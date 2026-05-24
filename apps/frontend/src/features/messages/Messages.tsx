import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, MessageSquare, Search } from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/feedback/Skeleton'
import {
  useConversations,
  useConversationThread,
  useSendMessage,
} from '@/lib/api/queries/useMessages'
import type { ConversationSummary } from '@/lib/api/endpoints/messages'
import { cn } from '@/lib/utils'

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso)
  if (isToday(d)) return format(d, 'HH:mm')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'dd MMM')
}

function Avatar({ name, avatar, size = 'md' }: { name: string; avatar?: string | null; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const cls = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  if (avatar) return <img src={avatar} alt={name} className={`${cls} rounded-full object-cover flex-shrink-0`} />
  return (
    <div className={`${cls} rounded-full bg-[var(--color-brand-cyan)] flex items-center justify-center font-semibold text-white flex-shrink-0`}>
      {initials || '?'}
    </div>
  )
}

// ── Conversation list item ────────────────────────────────────────────────────

function ConvItem({ conv, active, onClick }: { conv: ConversationSummary; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-secondary)] transition-colors text-left',
        active && 'bg-[var(--color-bg-secondary)] border-r-2 border-[var(--color-brand-cyan)]',
      )}
    >
      <Avatar name={conv.other_user.name} avatar={conv.other_user.avatar} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm text-[var(--color-text-primary)] truncate">{conv.other_user.name}</p>
          <span className="text-[11px] text-[var(--color-text-tertiary)] flex-shrink-0 ml-1">
            {formatTime(conv.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-[var(--color-text-secondary)] truncate">{conv.last_message ?? 'No messages yet'}</p>
          {conv.unread_count > 0 && (
            <span className="ml-1 flex-shrink-0 min-w-[18px] h-[18px] bg-[var(--color-brand-cyan)] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {conv.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ── Chat bubble ────────────────────────────────────────────────────────────────

function Bubble({ content, isMe, time }: { content: string; isMe: boolean; time: string }) {
  return (
    <div className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
        isMe
          ? 'bg-[var(--color-brand-cyan)] text-white rounded-br-sm'
          : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-bl-sm',
      )}>
        <p>{content}</p>
        <p className={cn('text-[10px] mt-1', isMe ? 'text-white/70 text-right' : 'text-[var(--color-text-tertiary)]')}>
          {format(new Date(time), 'HH:mm')}
        </p>
      </div>
    </div>
  )
}

// ── Thread panel ──────────────────────────────────────────────────────────────

function ThreadPanel({ conversationId }: { conversationId: number }) {
  const { data, isLoading } = useConversationThread(conversationId)
  const send = useSendMessage(conversationId)
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages.length])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || send.isPending) return
    send.mutate(trimmed)
    setText('')
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col gap-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className={cn('h-10 rounded-2xl', i % 2 === 0 ? 'w-1/2 ml-auto' : 'w-2/3')} />
        ))}
      </div>
    )
  }

  const { conversation: conv, messages } = data!

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)] flex-shrink-0">
        <Avatar name={conv.other_user.name} avatar={conv.other_user.avatar} />
        <div>
          <p className="font-semibold text-[var(--color-text-primary)]">{conv.other_user.name}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] capitalize">{conv.other_user.role}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <p className="text-center text-xs text-[var(--color-text-tertiary)] mt-8">No messages yet — say hello!</p>
        )}
        {messages.map(m => (
          <Bubble key={m.id} content={m.content} isMe={m.is_mine} time={m.created_at} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={submit} className="flex items-center gap-2 px-4 py-3 border-t border-[var(--color-border)] flex-shrink-0">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1"
          autoFocus
        />
        <Button type="submit" size="icon" disabled={!text.trim() || send.isPending}
          className="bg-[var(--color-brand-cyan)] hover:bg-[var(--color-brand-cyan)]/90 text-white flex-shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function Component() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const { data: convs, isLoading } = useConversations()

  const activeId = searchParams.get('c') ? Number(searchParams.get('c')) : null

  const filtered = (convs ?? []).filter(c =>
    c.other_user.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-[var(--color-bg-primary)]">
      {/* Sidebar */}
      <div className={cn(
        'flex flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-primary)]',
        'w-full md:w-80 lg:w-96 flex-shrink-0',
        activeId ? 'hidden md:flex' : 'flex',
      )}>
        <div className="px-4 py-4 border-b border-[var(--color-border)]">
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <Input
              placeholder="Search conversations…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}

          {!isLoading && filtered.length === 0 && (
            <EmptyState
              icon={MessageSquare}
              title="No conversations yet"
              description="Start a chat from any applicant or profile page"
            />
          )}

          {filtered.map(c => (
            <ConvItem
              key={c.id}
              conv={c}
              active={activeId === c.id}
              onClick={() => setSearchParams({ c: String(c.id) })}
            />
          ))}
        </div>
      </div>

      {/* Thread */}
      <div className={cn(
        'flex-1 flex flex-col min-w-0',
        !activeId ? 'hidden md:flex' : 'flex',
      )}>
        {activeId ? (
          <ThreadPanel conversationId={activeId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--color-text-tertiary)]">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
