class OtherUser {
  final int     id;
  final String  name;
  final String  role;
  final String? avatar;

  const OtherUser({required this.id, required this.name, required this.role, this.avatar});

  factory OtherUser.fromJson(Map<String, dynamic> j) => OtherUser(
    id:     j['id']     as int,
    name:   j['name']   as String? ?? '',
    role:   j['role']   as String? ?? '',
    avatar: j['avatar'] as String?,
  );

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    if (parts.isNotEmpty && parts[0].isNotEmpty) return parts[0][0].toUpperCase();
    return '?';
  }
}

class ConversationSummary {
  final int       id;
  final OtherUser otherUser;
  final String?   lastMessage;
  final String?   lastMessageAt;
  final int       unreadCount;

  const ConversationSummary({
    required this.id,
    required this.otherUser,
    this.lastMessage,
    this.lastMessageAt,
    this.unreadCount = 0,
  });

  factory ConversationSummary.fromJson(Map<String, dynamic> j) => ConversationSummary(
    id:             j['id']              as int,
    otherUser:      OtherUser.fromJson(j['other_user'] as Map<String, dynamic>),
    lastMessage:    j['last_message']    as String?,
    lastMessageAt:  j['last_message_at'] as String?,
    unreadCount:    j['unread_count']    as int? ?? 0,
  );

  String get formattedTime {
    if (lastMessageAt == null) return '';
    try {
      final dt   = DateTime.parse(lastMessageAt!).toLocal();
      final now  = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inMinutes < 1)  return 'now';
      if (diff.inHours < 1)    return '${diff.inMinutes}m';
      if (diff.inDays < 1)     return '${diff.inHours}h';
      if (diff.inDays < 7)     return '${diff.inDays}d';
      return '${dt.day}/${dt.month}';
    } catch (_) { return ''; }
  }
}

class ChatMessage {
  final int    id;
  final int    senderId;
  final String content;
  final bool   isRead;
  final String createdAt;
  final bool   isMine;

  // Optimistic-only flag — not from server
  final bool isPending;

  const ChatMessage({
    required this.id,
    required this.senderId,
    required this.content,
    required this.isRead,
    required this.createdAt,
    required this.isMine,
    this.isPending = false,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> j) => ChatMessage(
    id:        j['id']         as int,
    senderId:  j['sender_id']  as int,
    content:   j['content']    as String,
    isRead:    j['is_read']    as bool? ?? false,
    createdAt: j['created_at'] as String,
    isMine:    j['is_mine']    as bool? ?? false,
  );

  DateTime get timestamp {
    try { return DateTime.parse(createdAt).toLocal(); } catch (_) { return DateTime.now(); }
  }

  String get formattedTime {
    final t = timestamp;
    return '${t.hour.toString().padLeft(2,'0')}:${t.minute.toString().padLeft(2,'0')}';
  }
}
