import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messagesApi, notificationsApi, profileViewsApi } from '@/lib/api/endpoints/messages'

export const msgKeys = {
  conversations: ['conversations'] as const,
  thread:        (id: number) => ['conversation', id] as const,
  unread:        ['messages-unread'] as const,
  viewers:       ['profile-viewers'] as const,
}

export function useConversations() {
  return useQuery({
    queryKey: msgKeys.conversations,
    queryFn:  messagesApi.listConversations,
    refetchInterval: 10_000,
  })
}

export function useConversationThread(conversationId: number | null) {
  return useQuery({
    queryKey: msgKeys.thread(conversationId!),
    queryFn:  () => messagesApi.getMessages(conversationId!),
    enabled:  conversationId != null,
    refetchInterval: 5_000,
  })
}

export function useStartConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, message }: { userId: number; message: string }) =>
      messagesApi.startConversation(userId, message),
    onSuccess: () => qc.invalidateQueries({ queryKey: msgKeys.conversations }),
  })
}

export function useSendMessage(conversationId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => messagesApi.sendMessage(conversationId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: msgKeys.thread(conversationId) })
      qc.invalidateQueries({ queryKey: msgKeys.conversations })
      qc.invalidateQueries({ queryKey: msgKeys.unread })
    },
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: msgKeys.unread,
    queryFn:  messagesApi.unreadCount,
    refetchInterval: 15_000,
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn:  () => notificationsApi.list(),
    refetchInterval: 30_000,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useRecordProfileView(userId: number | undefined) {
  return useMutation({
    mutationFn: () => profileViewsApi.recordView(userId!),
  })
}

export function useMyViewers() {
  return useQuery({
    queryKey: msgKeys.viewers,
    queryFn:  profileViewsApi.getMyViewers,
  })
}
