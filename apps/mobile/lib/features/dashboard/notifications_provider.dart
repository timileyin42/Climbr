import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../core/network/api_client.dart';

class AppNotification {
  final int    id;
  final String title;
  final String body;
  final bool   isRead;
  final String createdAt;

  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.isRead,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> j) => AppNotification(
    id:        j['id']         as int,
    title:     j['title']      as String? ?? '',
    body:      j['body']       as String? ?? '',
    isRead:    j['is_read']    as bool? ?? false,
    createdAt: j['created_at'] as String? ?? '',
  );

  String get timeAgo {
    try {
      final d = DateTime.now().difference(DateTime.parse(createdAt));
      if (d.inMinutes < 1)  return 'just now';
      if (d.inHours   < 1)  return '${d.inMinutes}m ago';
      if (d.inDays    < 1)  return '${d.inHours}h ago';
      if (d.inDays    < 7)  return '${d.inDays}d ago';
      return '${(d.inDays / 7).floor()}w ago';
    } catch (_) { return ''; }
  }
}

class NotificationsState {
  final List<AppNotification> items;
  final int                   unreadCount;
  final bool                  loading;

  const NotificationsState({
    this.items       = const [],
    this.unreadCount = 0,
    this.loading     = true,
  });

  NotificationsState copyWith({
    List<AppNotification>? items,
    int?                   unreadCount,
    bool?                  loading,
  }) => NotificationsState(
    items:       items       ?? this.items,
    unreadCount: unreadCount ?? this.unreadCount,
    loading:     loading     ?? this.loading,
  );
}

class NotificationsNotifier extends StateNotifier<NotificationsState> {
  NotificationsNotifier() : super(const NotificationsState()) { fetch(); }

  Future<void> fetch() async {
    state = state.copyWith(loading: true);
    try {
      final res  = await dio.get('talent/notifications');
      final data = res.data as Map<String, dynamic>;
      final raw  = (data['items'] as List<dynamic>? ?? [])
          .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
          .toList();
      final unread = data['unread_count'] as int? ?? raw.where((n) => !n.isRead).length;
      state = state.copyWith(items: raw, unreadCount: unread, loading: false);
    } on DioException catch (_) {
      state = state.copyWith(loading: false);
    }
  }

  Future<void> markAllRead() async {
    try {
      await dio.post('talent/notifications/read-all');
      state = state.copyWith(
        unreadCount: 0,
        items: state.items.map((n) => AppNotification(
          id: n.id, title: n.title, body: n.body,
          isRead: true, createdAt: n.createdAt,
        )).toList(),
      );
    } catch (_) {}
  }
}

final notificationsProvider =
    StateNotifierProvider<NotificationsNotifier, NotificationsState>(
  (_) => NotificationsNotifier(),
);
