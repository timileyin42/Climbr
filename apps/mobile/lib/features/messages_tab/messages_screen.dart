import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import 'messages_provider.dart';

class MessagesScreen extends ConsumerWidget {
  const MessagesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state    = ref.watch(conversationsProvider);
    final notifier = ref.read(conversationsProvider.notifier);

    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ──────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, 0),
              child: Row(
                children: [
                  Expanded(child: Text('Messages', style: ClimbrText.h1.copyWith(color: ClimbrColors.textPrimary))),
                  if (state.unreadCount > 0)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: ClimbrColors.brandCyan,
                        borderRadius: BorderRadius.circular(Radii.pill),
                      ),
                      child: Text(
                        '${state.unreadCount} unread',
                        style: ClimbrText.caption.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
                      ),
                    ),
                ],
              ),
            ).animate().fadeIn(duration: 300.ms),

            const SizedBox(height: Sp.s4),

            // ── List ─────────────────────────────────────────────────────
            Expanded(
              child: state.loading
                  ? _ConvSkeleton()
                  : state.conversations.isEmpty
                      ? _EmptyState()
                      : RefreshIndicator(
                          color: ClimbrColors.brandCyan,
                          onRefresh: notifier.fetch,
                          child: ListView.separated(
                            padding: const EdgeInsets.fromLTRB(0, 0, 0, 100),
                            itemCount: state.conversations.length,
                            separatorBuilder: (_, __) =>
                                const Divider(height: 1, indent: 80, endIndent: Sp.s5),
                            itemBuilder: (_, i) {
                              final conv = state.conversations[i];
                              return _ConvRow(
                                conv: conv,
                                onTap: () => context.push('/chat/${conv.id}'),
                              ).animate(delay: Duration(milliseconds: i * 40))
                                  .fadeIn(duration: 280.ms);
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Conversation row ──────────────────────────────────────────────────────────

class _ConvRow extends StatelessWidget {
  final dynamic conv;
  final VoidCallback onTap;
  const _ConvRow({required this.conv, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final hasUnread = (conv.unreadCount as int) > 0;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        color: Colors.transparent,
        padding: const EdgeInsets.symmetric(horizontal: Sp.s5, vertical: Sp.s4),
        child: Row(
          children: [
            // Avatar
            _Avatar(name: conv.otherUser.name as String, role: conv.otherUser.role as String),

            const SizedBox(width: Sp.s3),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Expanded(
                      child: Text(
                        conv.otherUser.name as String,
                        style: ClimbrText.label.copyWith(
                          color: ClimbrColors.textPrimary,
                          fontWeight: hasUnread ? FontWeight.w700 : FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      conv.formattedTime as String,
                      style: ClimbrText.caption.copyWith(
                        color: hasUnread ? ClimbrColors.brandCyan : ClimbrColors.textTertiary,
                        fontWeight: hasUnread ? FontWeight.w700 : FontWeight.w400,
                      ),
                    ),
                  ]),

                  const SizedBox(height: 3),

                  Row(children: [
                    Expanded(
                      child: Text(
                        (conv.lastMessage as String?) ?? 'No messages yet',
                        style: ClimbrText.bodySm.copyWith(
                          color: hasUnread ? ClimbrColors.textPrimary : ClimbrColors.textTertiary,
                          fontWeight: hasUnread ? FontWeight.w500 : FontWeight.w400,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (hasUnread)
                      Container(
                        constraints: const BoxConstraints(minWidth: 20),
                        height: 20,
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        decoration: BoxDecoration(
                          color: ClimbrColors.brandCyan,
                          borderRadius: BorderRadius.circular(Radii.pill),
                        ),
                        child: Center(
                          child: Text(
                            '${conv.unreadCount}',
                            style: const TextStyle(
                              fontFamily: 'Inter', fontSize: 11,
                              fontWeight: FontWeight.w700, color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                  ]),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Avatar ────────────────────────────────────────────────────────────────────

class _Avatar extends StatelessWidget {
  final String name;
  final String role;
  const _Avatar({required this.name, required this.role});

  @override
  Widget build(BuildContext context) {
    final initials = name.trim().split(' ').where((s) => s.isNotEmpty).take(2)
        .map((s) => s[0].toUpperCase()).join();
    final isEmployer = role.toLowerCase() == 'employer';
    final color = isEmployer ? ClimbrColors.brandOrange : ClimbrColors.statusShortlisted;
    final bg    = isEmployer ? ClimbrColors.brandOrangeSoft : ClimbrColors.statusShortlistedBg;

    return Container(
      width: 44, height: 44,
      decoration: BoxDecoration(shape: BoxShape.circle, color: bg),
      child: Center(
        child: Text(initials, style: ClimbrText.label.copyWith(color: color, fontWeight: FontWeight.w800)),
      ),
    );
  }
}

// ── Skeleton & empty ──────────────────────────────────────────────────────────

class _ConvSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: EdgeInsets.zero,
      itemCount: 7,
      separatorBuilder: (_, __) => const Divider(height: 1, indent: 80),
      itemBuilder: (_, __) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: Sp.s5, vertical: Sp.s4),
        child: Row(children: [
          Container(width: 44, height: 44, decoration: const BoxDecoration(shape: BoxShape.circle, color: ClimbrColors.bgTertiary)),
          const SizedBox(width: Sp.s3),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(height: 13, width: 120, decoration: BoxDecoration(color: ClimbrColors.bgTertiary, borderRadius: BorderRadius.circular(4))),
              const SizedBox(height: 6),
              Container(height: 11, width: 200, decoration: BoxDecoration(color: ClimbrColors.bgTertiary, borderRadius: BorderRadius.circular(4))),
            ]),
          ),
        ]),
      ).animate(onPlay: (c) => c.repeat(reverse: true)).shimmer(duration: 1200.ms, color: ClimbrColors.border),
    );
  }
}

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
          width: 72, height: 72,
          decoration: const BoxDecoration(shape: BoxShape.circle, color: ClimbrColors.bgTertiary),
          child: const Icon(Icons.chat_bubble_outline_rounded, size: 36, color: ClimbrColors.textTertiary),
        ).animate(onPlay: (c) => c.repeat(reverse: true))
            .moveY(begin: 0, end: -6, duration: 2400.ms, curve: Curves.easeInOut),
        const SizedBox(height: Sp.s4),
        Text('No conversations yet', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
        const SizedBox(height: Sp.s2),
        Text(
          'When an employer messages you,\nit will appear here.',
          style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary),
          textAlign: TextAlign.center,
        ),
      ]),
    );
  }
}
