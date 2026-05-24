from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List
from pydantic import BaseModel
from datetime import datetime, timezone

from app.database import get_db
from app.models.database_models import User, Conversation, Message, UserType
from app.dependencies.auth import get_current_user
from app.routers.auth import _user_names

router = APIRouter()


# ── Helpers ────────────────────────────────────────────────────────────────────

def _profile_pic(user: User) -> str | None:
    if user.user_type == UserType.TALENT and user.talent:
        return user.talent.profile_image_url
    if user.user_type == UserType.EMPLOYER and user.employer:
        return user.employer.logo_url
    if user.user_type == UserType.TRAINER and user.trainer:
        return user.trainer.logo_url
    return None


def _serialize_user(user: User) -> dict:
    first, last = _user_names(user)
    return {
        "id": user.id,
        "name": f"{first} {last}".strip() or user.email,
        "role": user.user_type.value,
        "avatar": _profile_pic(user),
    }


def _other_participant(conv: Conversation, me_id: int) -> User:
    return conv.participant_2 if conv.participant_1_id == me_id else conv.participant_1


def _serialize_conversation(conv: Conversation, me_id: int, db: Session) -> dict:
    other = _other_participant(conv, me_id)
    last_msg = (
        db.query(Message)
        .filter(Message.conversation_id == conv.id)
        .order_by(Message.created_at.desc())
        .first()
    )
    unread = (
        db.query(func.count(Message.id))
        .filter(Message.conversation_id == conv.id, Message.sender_id != me_id, Message.is_read == False)
        .scalar()
    )
    return {
        "id": conv.id,
        "other_user": _serialize_user(other),
        "last_message": last_msg.content if last_msg else None,
        "last_message_at": last_msg.created_at.isoformat() if last_msg else conv.created_at.isoformat(),
        "unread_count": unread or 0,
    }


# ── Schemas ────────────────────────────────────────────────────────────────────

class SendMessageBody(BaseModel):
    content: str


class StartConversationBody(BaseModel):
    user_id: int
    message: str


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/conversations")
def list_conversations(
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    convs = (
        db.query(Conversation)
        .filter(
            or_(
                Conversation.participant_1_id == me.id,
                Conversation.participant_2_id == me.id,
            )
        )
        .order_by(Conversation.last_message_at.desc())
        .all()
    )
    return [_serialize_conversation(c, me.id, db) for c in convs]


@router.post("/conversations", status_code=status.HTTP_201_CREATED)
def start_or_get_conversation(
    body: StartConversationBody,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    if body.user_id == me.id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")

    other = db.query(User).filter(User.id == body.user_id).first()
    if not other:
        raise HTTPException(status_code=404, detail="User not found")

    # Ensure consistent ordering so the unique constraint fires correctly
    p1, p2 = sorted([me.id, body.user_id])

    conv = (
        db.query(Conversation)
        .filter(
            Conversation.participant_1_id == p1,
            Conversation.participant_2_id == p2,
        )
        .first()
    )

    if not conv:
        conv = Conversation(participant_1_id=p1, participant_2_id=p2)
        db.add(conv)
        db.flush()

    msg = Message(conversation_id=conv.id, sender_id=me.id, content=body.message.strip())
    db.add(msg)
    conv.last_message_at = func.now()
    db.commit()
    db.refresh(conv)

    return _serialize_conversation(conv, me.id, db)


@router.get("/conversations/{conversation_id}/messages")
def get_messages(
    conversation_id: int,
    limit: int = 50,
    before_id: int = None,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv or me.id not in (conv.participant_1_id, conv.participant_2_id):
        raise HTTPException(status_code=404, detail="Conversation not found")

    q = db.query(Message).filter(Message.conversation_id == conversation_id)
    if before_id:
        q = q.filter(Message.id < before_id)
    messages = q.order_by(Message.created_at.desc()).limit(limit).all()

    # Mark messages from the other user as read
    db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != me.id,
        Message.is_read == False,
    ).update({"is_read": True})
    db.commit()

    return {
        "conversation": _serialize_conversation(conv, me.id, db),
        "messages": [
            {
                "id": m.id,
                "sender_id": m.sender_id,
                "content": m.content,
                "is_read": m.is_read,
                "created_at": m.created_at.isoformat(),
                "is_mine": m.sender_id == me.id,
            }
            for m in reversed(messages)
        ],
    }


@router.post("/conversations/{conversation_id}/messages", status_code=status.HTTP_201_CREATED)
def send_message(
    conversation_id: int,
    body: SendMessageBody,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv or me.id not in (conv.participant_1_id, conv.participant_2_id):
        raise HTTPException(status_code=404, detail="Conversation not found")

    if not body.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    msg = Message(conversation_id=conv.id, sender_id=me.id, content=body.content.strip())
    db.add(msg)
    conv.last_message_at = func.now()
    db.commit()
    db.refresh(msg)

    return {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "content": msg.content,
        "is_read": msg.is_read,
        "created_at": msg.created_at.isoformat(),
        "is_mine": True,
    }


@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    my_conv_ids = (
        db.query(Conversation.id)
        .filter(
            or_(
                Conversation.participant_1_id == me.id,
                Conversation.participant_2_id == me.id,
            )
        )
        .subquery()
    )
    count = (
        db.query(func.count(Message.id))
        .filter(
            Message.conversation_id.in_(my_conv_ids),
            Message.sender_id != me.id,
            Message.is_read == False,
        )
        .scalar()
    )
    return {"unread": count or 0}
