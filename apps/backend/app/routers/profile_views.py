from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app.models.database_models import User, ProfileView
from app.dependencies.auth import get_current_user
from app.routers.auth import _user_names, _profile_pic

router = APIRouter()


@router.post("/profile-views/{user_id}", status_code=204)
def record_view(
    user_id: int,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    """Record that `me` viewed `user_id`'s profile. Deduped per viewer per 24 h."""
    if user_id == me.id:
        return  # don't count self-views

    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    recent = (
        db.query(ProfileView)
        .filter(
            ProfileView.viewer_id == me.id,
            ProfileView.viewed_user_id == user_id,
            ProfileView.viewed_at >= cutoff,
        )
        .first()
    )
    if not recent:
        db.add(ProfileView(viewer_id=me.id, viewed_user_id=user_id))
        db.commit()


@router.get("/profile-views/viewers")
def my_viewers(
    limit: int = 20,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    """Return the most recent unique viewers of the current user's profile."""
    # Latest view per unique viewer
    latest_per_viewer = (
        db.query(
            ProfileView.viewer_id,
            func.max(ProfileView.viewed_at).label("viewed_at"),
        )
        .filter(ProfileView.viewed_user_id == me.id)
        .group_by(ProfileView.viewer_id)
        .order_by(func.max(ProfileView.viewed_at).desc())
        .limit(limit)
        .all()
    )

    result = []
    for row in latest_per_viewer:
        viewer = db.query(User).filter(User.id == row.viewer_id).first()
        if not viewer:
            continue
        first, last = _user_names(viewer)
        result.append({
            "id": viewer.id,
            "name": f"{first} {last}".strip() or viewer.email,
            "role": viewer.user_type.value,
            "avatar": _profile_pic(viewer),
            "viewed_at": row.viewed_at.isoformat(),
        })

    total = (
        db.query(func.count(ProfileView.id))
        .filter(ProfileView.viewed_user_id == me.id)
        .scalar()
    )
    return {"total_views": total or 0, "viewers": result}
