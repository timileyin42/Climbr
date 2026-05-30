import '../models/messages_models.dart';
import '../../core/network/api_client.dart';

class MessagesRepository {
  Future<List<ConversationSummary>> listConversations() async {
    final res  = await dio.get('messages/conversations');
    final list = res.data as List<dynamic>;
    return list.map((e) => ConversationSummary.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<({ConversationSummary conversation, List<ChatMessage> messages})> getThread(int convId) async {
    final res  = await dio.get('messages/conversations/$convId/messages');
    final data = res.data as Map<String, dynamic>;
    return (
      conversation: ConversationSummary.fromJson(data['conversation'] as Map<String, dynamic>),
      messages: (data['messages'] as List<dynamic>)
          .map((e) => ChatMessage.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Future<ChatMessage> sendMessage(int convId, String content) async {
    final res = await dio.post(
      'messages/conversations/$convId/messages',
      data: {'content': content},
    );
    return ChatMessage.fromJson(res.data as Map<String, dynamic>);
  }

  Future<int> getUnreadCount() async {
    try {
      final res = await dio.get('messages/unread-count');
      return (res.data as Map<String, dynamic>)['unread'] as int? ?? 0;
    } catch (_) { return 0; }
  }
}
