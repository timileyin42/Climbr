import { api } from '@/lib/api/client'

export interface OtherUser {
  id: number
  name: string
  role: string
  avatar: string | null
}

export interface ConversationSummary {
  id: number
  other_user: OtherUser
  last_message: string | null
  last_message_at: string
  unread_count: number
}

export interface ChatMessage {
  id: number
  sender_id: number
  content: string
  is_read: boolean
  created_at: string
  is_mine: boolean
}

export interface ConversationThread {
  conversation: ConversationSummary
  messages: ChatMessage[]
}

export interface ProfileViewer {
  id: number
  name: string
  role: string
  avatar: string | null
  viewed_at: string
}

export const messagesApi = {
  listConversations: () =>
    api.get('messages/conversations').json<ConversationSummary[]>(),

  startConversation: (user_id: number, message: string) =>
    api.post('messages/conversations', { json: { user_id, message } }).json<ConversationSummary>(),

  getMessages: (conversationId: number, before_id?: number) =>
    api.get(`messages/conversations/${conversationId}/messages`, {
      searchParams: before_id ? { before_id } : {},
    }).json<ConversationThread>(),

  sendMessage: (conversationId: number, content: string) =>
    api.post(`messages/conversations/${conversationId}/messages`, { json: { content } }).json<ChatMessage>(),

  unreadCount: () =>
    api.get('messages/unread-count').json<{ unread: number }>(),
}

export const profileViewsApi = {
  recordView: (userId: number) =>
    api.post(`profile-views/${userId}`).then(() => {}),

  getMyViewers: () =>
    api.get('profile-views/viewers').json<{ total_views: number; viewers: ProfileViewer[] }>(),
}
