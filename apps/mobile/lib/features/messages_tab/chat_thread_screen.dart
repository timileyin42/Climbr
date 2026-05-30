import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import '../../data/models/messages_models.dart';
import 'messages_provider.dart';

class ChatThreadScreen extends ConsumerStatefulWidget {
  final int conversationId;
  const ChatThreadScreen({super.key, required this.conversationId});

  @override
  ConsumerState<ChatThreadScreen> createState() => _ChatThreadScreenState();
}

class _ChatThreadScreenState extends ConsumerState<ChatThreadScreen> {
  final _inputCtrl   = TextEditingController();
  final _scrollCtrl  = ScrollController();
  bool  _hasScrolled = false;

  @override
  void dispose() {
    _inputCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _scrollToBottom({bool animated = false}) {
    if (!_scrollCtrl.hasClients) return;
    final target = _scrollCtrl.position.maxScrollExtent;
    if (animated) {
      _scrollCtrl.animateTo(target, duration: 280.ms, curve: Curves.easeOut);
    } else {
      _scrollCtrl.jumpTo(target);
    }
  }

  @override
  Widget build(BuildContext context, ) {
    final state    = ref.watch(threadProvider(widget.conversationId));
    final notifier = ref.read(threadProvider(widget.conversationId).notifier);
    final conv     = state.conversation;

    // Auto-scroll on first load and when new mine messages arrive
    if (!state.loading && state.messages.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!_hasScrolled) {
          _scrollToBottom();
          _hasScrolled = true;
        }
      });
    }

    // Scroll to bottom when I send a message
    ref.listen(threadProvider(widget.conversationId), (prev, next) {
      if (prev != null && next.messages.length > prev.messages.length) {
        WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom(animated: true));
      }
    });

    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: SafeArea(
        child: Column(
          children: [
            // ── Top bar ──────────────────────────────────────────────────
            Container(
              color: ClimbrColors.bgPrimary,
              padding: const EdgeInsets.fromLTRB(Sp.s4, Sp.s3, Sp.s5, Sp.s3),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => context.pop(),
                    child: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: ClimbrColors.textPrimary),
                  ),
                  const SizedBox(width: Sp.s3),

                  // Avatar
                  if (conv != null)
                    _SmallAvatar(name: conv.otherUser.name, role: conv.otherUser.role),

                  const SizedBox(width: Sp.s3),

                  Expanded(
                    child: conv == null
                        ? Container(height: 14, width: 100, decoration: BoxDecoration(color: ClimbrColors.bgTertiary, borderRadius: BorderRadius.circular(4)))
                        : Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(conv.otherUser.name, style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary)),
                              Text(
                                conv.otherUser.role.isNotEmpty
                                    ? conv.otherUser.role[0].toUpperCase() + conv.otherUser.role.substring(1)
                                    : '',
                                style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary),
                              ),
                            ],
                          ),
                  ),
                ],
              ),
            ),

            // ── Messages ─────────────────────────────────────────────────
            Expanded(
              child: state.loading
                  ? const Center(child: CircularProgressIndicator(color: ClimbrColors.brandCyan))
                  : state.messages.isEmpty
                      ? Center(
                          child: Text(
                            'No messages yet — say hello!',
                            style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textTertiary),
                          ),
                        )
                      : ListView.builder(
                          controller: _scrollCtrl,
                          padding: const EdgeInsets.fromLTRB(Sp.s4, Sp.s4, Sp.s4, Sp.s3),
                          itemCount: state.messages.length,
                          itemBuilder: (_, i) {
                            final msg  = state.messages[i];
                            final prev = i > 0 ? state.messages[i - 1] : null;
                            final next = i < state.messages.length - 1 ? state.messages[i + 1] : null;

                            // Show timestamp separator when gap > 10 min
                            final showTime = prev == null ||
                                msg.timestamp.difference(prev.timestamp).inMinutes.abs() > 10;

                            // Show avatar for "theirs" only on the first in a run
                            final isFirstInRun = prev == null || prev.isMine != msg.isMine;

                            // Read receipt on last mine message
                            final isLastMine = msg.isMine &&
                                (next == null || !next.isMine);

                            return Column(
                              children: [
                                if (showTime) _TimestampDivider(msg: msg),
                                _BubbleRow(
                                  msg:          msg,
                                  isFirstInRun: isFirstInRun,
                                  showReceipt:  isLastMine,
                                ),
                              ],
                            );
                          },
                        ),
            ),

            // ── Input bar ────────────────────────────────────────────────
            Container(
              color: ClimbrColors.bgPrimary,
              padding: const EdgeInsets.fromLTRB(Sp.s4, Sp.s3, Sp.s4, Sp.s4),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      constraints: const BoxConstraints(maxHeight: 120),
                      decoration: BoxDecoration(
                        color: ClimbrColors.bgSecondary,
                        borderRadius: BorderRadius.circular(Radii.xl),
                        border: Border.all(color: ClimbrColors.border),
                      ),
                      child: TextField(
                        controller: _inputCtrl,
                        maxLines: null,
                        textCapitalization: TextCapitalization.sentences,
                        style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
                        decoration: InputDecoration(
                          hintText: 'Type a message…',
                          hintStyle: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textTertiary),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(horizontal: Sp.s4, vertical: 10),
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                  ),

                  const SizedBox(width: Sp.s2),

                  // Send button
                  AnimatedContainer(
                    duration: 180.ms,
                    width: 44, height: 44,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _inputCtrl.text.trim().isNotEmpty
                          ? ClimbrColors.brandCyan
                          : ClimbrColors.bgTertiary,
                    ),
                    child: GestureDetector(
                      onTap: () async {
                        final text = _inputCtrl.text;
                        if (text.trim().isEmpty) return;
                        _inputCtrl.clear();
                        setState(() {});
                        await notifier.send(text);
                      },
                      child: Icon(
                        Icons.send_rounded,
                        size: 20,
                        color: _inputCtrl.text.trim().isNotEmpty
                            ? Colors.white
                            : ClimbrColors.textTertiary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Bubble row ────────────────────────────────────────────────────────────────

class _BubbleRow extends StatelessWidget {
  final ChatMessage msg;
  final bool        isFirstInRun;
  final bool        showReceipt;

  const _BubbleRow({required this.msg, required this.isFirstInRun, required this.showReceipt});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: isFirstInRun ? Sp.s4 : 3),
      child: Row(
        mainAxisAlignment: msg.isMine ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // Avatar for "theirs" — 28px, shown only on first in run
          if (!msg.isMine) ...[
            SizedBox(
              width: 28, height: 28,
              child: isFirstInRun
                  ? _TinyAvatar()
                  : const SizedBox.shrink(),
            ),
            const SizedBox(width: Sp.s2),
          ],

          // Bubble
          Flexible(
            child: Column(
              crossAxisAlignment: msg.isMine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                Container(
                  constraints: BoxConstraints(
                    maxWidth: MediaQuery.sizeOf(context).width * 0.70,
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: msg.isMine
                        ? (msg.isPending ? ClimbrColors.brandCyan.withValues(alpha: 0.6) : ClimbrColors.brandCyan)
                        : ClimbrColors.bgTertiary,
                    borderRadius: BorderRadius.only(
                      topLeft:     const Radius.circular(999),
                      topRight:    const Radius.circular(999),
                      bottomLeft:  msg.isMine  ? const Radius.circular(999) : const Radius.circular(4),
                      bottomRight: !msg.isMine ? const Radius.circular(999) : const Radius.circular(4),
                    ),
                  ),
                  child: Text(
                    msg.content,
                    style: ClimbrText.bodyMd.copyWith(
                      color: msg.isMine ? Colors.white : ClimbrColors.textPrimary,
                      height: 1.4,
                    ),
                  ),
                ),

                // Read receipt + time
                if (showReceipt || !msg.isMine)
                  Padding(
                    padding: const EdgeInsets.only(top: 3),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          msg.formattedTime,
                          style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary),
                        ),
                        if (msg.isMine && showReceipt) ...[
                          const SizedBox(width: 4),
                          Icon(
                            msg.isRead ? Icons.done_all_rounded : Icons.done_rounded,
                            size: 14,
                            color: msg.isRead ? ClimbrColors.brandCyan : ClimbrColors.textTertiary,
                          ),
                        ],
                      ],
                    ),
                  ),
              ],
            ),
          ),

          // Spacer for "mine" bubbles (no avatar shown)
          if (msg.isMine) const SizedBox(width: 40),
        ],
      ),
    );
  }
}

// ── Small avatar ──────────────────────────────────────────────────────────────

class _TinyAvatar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 28, height: 28,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: ClimbrColors.statusShortlistedBg,
      ),
      child: const Center(
        child: Icon(Icons.person_outline_rounded, size: 14, color: ClimbrColors.statusShortlisted),
      ),
    );
  }
}

class _SmallAvatar extends StatelessWidget {
  final String name;
  final String role;
  const _SmallAvatar({required this.name, required this.role});

  @override
  Widget build(BuildContext context) {
    final initials = name.trim().split(' ').where((s) => s.isNotEmpty).take(2)
        .map((s) => s[0].toUpperCase()).join();
    final isEmployer = role.toLowerCase() == 'employer';
    return Container(
      width: 36, height: 36,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isEmployer ? ClimbrColors.brandOrangeSoft : ClimbrColors.statusShortlistedBg,
      ),
      child: Center(
        child: Text(
          initials,
          style: ClimbrText.label.copyWith(
            color: isEmployer ? ClimbrColors.brandOrange : ClimbrColors.statusShortlisted,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }
}

// ── Timestamp divider ─────────────────────────────────────────────────────────

class _TimestampDivider extends StatelessWidget {
  final ChatMessage msg;
  const _TimestampDivider({required this.msg});

  @override
  Widget build(BuildContext context) {
    final t = msg.timestamp;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final msgDay = DateTime(t.year, t.month, t.day);

    String label;
    if (msgDay == today) {
      label = 'Today, ${msg.formattedTime}';
    } else if (msgDay == today.subtract(const Duration(days: 1))) {
      label = 'Yesterday, ${msg.formattedTime}';
    } else {
      label = '${t.day}/${t.month}/${t.year} ${msg.formattedTime}';
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: Sp.s4),
      child: Center(
        child: Text(label, style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary)),
      ),
    );
  }
}
