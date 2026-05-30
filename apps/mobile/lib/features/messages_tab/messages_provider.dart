import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/messages_models.dart';
import '../../data/repositories/messages_repository.dart';

final messagesRepoProvider =
    Provider<MessagesRepository>((_) => MessagesRepository());

// ── Conversation list ─────────────────────────────────────────────────────────

class ConversationsState {
  final List<ConversationSummary> conversations;
  final bool                      loading;
  final int                       unreadCount;

  const ConversationsState({
    this.conversations = const [],
    this.loading       = true,
    this.unreadCount   = 0,
  });

  ConversationsState copyWith({
    List<ConversationSummary>? conversations,
    bool?                      loading,
    int?                       unreadCount,
  }) => ConversationsState(
    conversations: conversations ?? this.conversations,
    loading:       loading       ?? this.loading,
    unreadCount:   unreadCount   ?? this.unreadCount,
  );
}

class ConversationsNotifier extends StateNotifier<ConversationsState> {
  final MessagesRepository _repo;
  Timer? _pollTimer;

  ConversationsNotifier(this._repo) : super(const ConversationsState()) {
    fetch();
    _pollTimer = Timer.periodic(const Duration(seconds: 10), (_) => fetch());
  }

  Future<void> fetch() async {
    try {
      final convs  = await _repo.listConversations();
      final unread = await _repo.getUnreadCount();
      if (mounted) {
        state = state.copyWith(conversations: convs, loading: false, unreadCount: unread);
      }
    } catch (_) {
      if (mounted) state = state.copyWith(loading: false);
    }
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }
}

final conversationsProvider =
    StateNotifierProvider<ConversationsNotifier, ConversationsState>(
  (ref) => ConversationsNotifier(ref.read(messagesRepoProvider)),
);

// ── Chat thread ───────────────────────────────────────────────────────────────

class ThreadState {
  final ConversationSummary? conversation;
  final List<ChatMessage>    messages;
  final bool                 loading;
  final bool                 sending;

  const ThreadState({
    this.conversation,
    this.messages = const [],
    this.loading  = true,
    this.sending  = false,
  });

  ThreadState copyWith({
    ConversationSummary? conversation,
    List<ChatMessage>?   messages,
    bool?                loading,
    bool?                sending,
  }) => ThreadState(
    conversation: conversation ?? this.conversation,
    messages:     messages     ?? this.messages,
    loading:      loading      ?? this.loading,
    sending:      sending      ?? this.sending,
  );
}

class ThreadNotifier extends StateNotifier<ThreadState> {
  final MessagesRepository _repo;
  final int                _convId;
  Timer? _pollTimer;

  ThreadNotifier(this._repo, this._convId) : super(const ThreadState()) {
    fetch();
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (_) => _silentPoll());
  }

  Future<void> fetch() async {
    state = state.copyWith(loading: true);
    try {
      final result = await _repo.getThread(_convId);
      if (mounted) {
        state = state.copyWith(
          conversation: result.conversation,
          messages:     result.messages,
          loading:      false,
        );
      }
    } catch (_) {
      if (mounted) state = state.copyWith(loading: false);
    }
  }

  // Silent poll — replaces messages without showing loading
  Future<void> _silentPoll() async {
    try {
      final result = await _repo.getThread(_convId);
      if (mounted) {
        state = state.copyWith(
          conversation: result.conversation,
          messages:     result.messages,
        );
      }
    } catch (_) {}
  }

  Future<void> send(String content) async {
    if (content.trim().isEmpty) return;

    // Optimistic: prepend a pending message
    final optimistic = ChatMessage(
      id:        -DateTime.now().millisecondsSinceEpoch,
      senderId:  0,
      content:   content.trim(),
      isRead:    false,
      createdAt: DateTime.now().toIso8601String(),
      isMine:    true,
      isPending: true,
    );

    state = state.copyWith(
      messages: [...state.messages, optimistic],
      sending:  true,
    );

    try {
      await _repo.sendMessage(_convId, content.trim());
      if (mounted) {
        state = state.copyWith(sending: false);
        await _silentPoll(); // confirm with server state
      }
    } catch (_) {
      // Remove optimistic on failure
      if (mounted) {
        state = state.copyWith(
          messages: state.messages.where((m) => m.id != optimistic.id).toList(),
          sending:  false,
        );
      }
    }
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }
}

final threadProvider =
    StateNotifierProvider.family<ThreadNotifier, ThreadState, int>(
  (ref, convId) => ThreadNotifier(ref.read(messagesRepoProvider), convId),
);
