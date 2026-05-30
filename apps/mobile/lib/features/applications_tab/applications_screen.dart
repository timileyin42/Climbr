import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import '../../data/models/saved_models.dart';
import 'applications_provider.dart';

class ApplicationsScreen extends ConsumerWidget {
  const ApplicationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state    = ref.watch(applicationsProvider);
    final notifier = ref.read(applicationsProvider.notifier);

    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ──────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, 0),
              child: Text('My Applications', style: ClimbrText.h1.copyWith(color: ClimbrColors.textPrimary))
                  .animate().fadeIn(duration: 300.ms),
            ),

            const SizedBox(height: Sp.s4),

            // ── Stat cards ───────────────────────────────────────────────
            SizedBox(
              height: 80,
              child: state.loading
                  ? _StatSkeleton()
                  : ListView(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: Sp.s5),
                      children: [
                        _StatChip(label: 'Total', value: state.stats?.total ?? 0,
                          color: ClimbrColors.brandCyan, bg: ClimbrColors.brandCyanSoft,
                          active: state.statusFilter.isEmpty, onTap: () => notifier.setFilter('')),
                        _StatChip(label: 'In Review', value: state.stats?.inReview ?? 0,
                          color: ClimbrColors.statusInReview, bg: ClimbrColors.statusInReviewBg,
                          active: state.statusFilter == 'in_review', onTap: () => notifier.setFilter('in_review')),
                        _StatChip(label: 'Shortlisted', value: state.stats?.acceptedShortlisted ?? 0,
                          color: ClimbrColors.statusShortlisted, bg: ClimbrColors.statusShortlistedBg,
                          active: state.statusFilter == 'shortlisted', onTap: () => notifier.setFilter('shortlisted')),
                        _StatChip(label: 'Rejected', value: state.stats?.rejected ?? 0,
                          color: ClimbrColors.statusRejected, bg: ClimbrColors.statusRejectedBg,
                          active: state.statusFilter == 'rejected', onTap: () => notifier.setFilter('rejected')),
                      ],
                    ),
            ),

            const SizedBox(height: Sp.s4),

            // ── List ─────────────────────────────────────────────────────
            Expanded(
              child: state.loading
                  ? _ListSkeleton()
                  : state.error != null
                      ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                          const Icon(Icons.error_outline_rounded, size: 48, color: ClimbrColors.textTertiary),
                          const SizedBox(height: Sp.s3),
                          Text('Could not load', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
                          const SizedBox(height: Sp.s4),
                          SizedBox(
                            width: 140, height: 44,
                            child: ElevatedButton(onPressed: () => notifier.fetch(), child: const Text('Retry')),
                          ),
                        ]))
                      : state.items.isEmpty
                          ? Center(
                              child: Column(mainAxisSize: MainAxisSize.min, children: [
                                Container(
                                  width: 72, height: 72,
                                  decoration: const BoxDecoration(shape: BoxShape.circle, color: ClimbrColors.bgTertiary),
                                  child: const Icon(Icons.folder_open_outlined, size: 36, color: ClimbrColors.textTertiary),
                                )
                                    .animate(onPlay: (c) => c.repeat(reverse: true))
                                    .moveY(begin: 0, end: -6, duration: 2400.ms, curve: Curves.easeInOut),
                                const SizedBox(height: Sp.s4),
                                Text(
                                  state.statusFilter.isEmpty ? 'No applications yet' : 'No ${_filterLabel(state.statusFilter)} applications',
                                  style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: Sp.s2),
                                Text(
                                  'Apply to jobs and trainings to track them here.',
                                  style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary),
                                  textAlign: TextAlign.center,
                                ),
                              ]),
                            )
                          : RefreshIndicator(
                              color: ClimbrColors.brandCyan,
                              onRefresh: () => notifier.fetch(),
                              child: ListView.separated(
                                padding: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, 100),
                                itemCount: state.items.length,
                                separatorBuilder: (_, __) => const SizedBox(height: Sp.s3),
                                itemBuilder: (_, i) => _AppRow(
                                  item:     state.items[i],
                                  onRemove: () => notifier.removeApplication(state.items[i]),
                                ).animate(delay: Duration(milliseconds: i * 40))
                                    .fadeIn(duration: 280.ms)
                                    .slideY(begin: 0.04, end: 0, duration: 280.ms),
                              ),
                            ),
            ),
          ],
        ),
      ),
    );
  }

  String _filterLabel(String f) {
    switch (f) {
      case 'in_review':   return 'In Review';
      case 'shortlisted': return 'Shortlisted';
      case 'rejected':    return 'Rejected';
      default:            return f;
    }
  }
}

// ── Application row ───────────────────────────────────────────────────────────

class _AppRow extends StatelessWidget {
  final ApplicationItem item;
  final VoidCallback    onRemove;
  const _AppRow({required this.item, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    final statusColor = _statusColor(item.status);
    final statusBg    = _statusBg(item.status);

    return Container(
      padding: const EdgeInsets.all(Sp.s4),
      decoration: BoxDecoration(
        color: ClimbrColors.bgPrimary,
        borderRadius: BorderRadius.circular(Radii.lg),
        border: Border.all(color: ClimbrColors.border),
      ),
      child: Row(
        children: [
          // Type icon
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: item.isJob ? ClimbrColors.brandCyanSoft : const Color(0xFFFFF8E0),
            ),
            child: Center(
              child: Text(
                item.isJob ? 'J' : 'T',
                style: ClimbrText.label.copyWith(
                  color: item.isJob ? ClimbrColors.brandCyan : const Color(0xFF8B6A00),
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),

          const SizedBox(width: Sp.s3),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary),
                ),
                const SizedBox(height: 2),
                Text(
                  item.companyProvider,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: ClimbrText.caption.copyWith(color: ClimbrColors.textSecondary),
                ),
                const SizedBox(height: 4),
                Row(children: [
                  // Status badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: statusBg,
                      borderRadius: BorderRadius.circular(Radii.pill),
                    ),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Container(
                        width: 5, height: 5,
                        decoration: BoxDecoration(shape: BoxShape.circle, color: statusColor),
                      ),
                      const SizedBox(width: 4),
                      Text(item.displayStatus, style: ClimbrText.caption.copyWith(color: statusColor, fontWeight: FontWeight.w700)),
                    ]),
                  ),
                  const SizedBox(width: Sp.s3),
                  // Date
                  Text(item.dateApplied, style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary)),
                ]),
              ],
            ),
          ),

          // 3-dot menu
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert_rounded, size: 18, color: ClimbrColors.textTertiary),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Radii.md)),
            onSelected: (v) {
              if (v == 'remove') onRemove();
            },
            itemBuilder: (_) => [
              const PopupMenuItem(
                value: 'remove',
                child: Row(children: [
                  Icon(Icons.delete_outline_rounded, size: 16, color: ClimbrColors.statusRejected),
                  SizedBox(width: 8),
                  Text('Remove application'),
                ]),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _statusColor(String s) {
    switch (s) {
      case 'applied':     return ClimbrColors.statusPending;
      case 'in_review':   return ClimbrColors.statusInReview;
      case 'shortlisted': return ClimbrColors.statusShortlisted;
      case 'accepted':    return ClimbrColors.statusAccepted;
      case 'rejected':    return ClimbrColors.statusRejected;
      default:            return ClimbrColors.textTertiary;
    }
  }

  Color _statusBg(String s) {
    switch (s) {
      case 'applied':     return ClimbrColors.statusPendingBg;
      case 'in_review':   return ClimbrColors.statusInReviewBg;
      case 'shortlisted': return ClimbrColors.statusShortlistedBg;
      case 'accepted':    return ClimbrColors.statusAcceptedBg;
      case 'rejected':    return ClimbrColors.statusRejectedBg;
      default:            return ClimbrColors.bgTertiary;
    }
  }
}

// ── Stat chip ─────────────────────────────────────────────────────────────────

class _StatChip extends StatelessWidget {
  final String   label;
  final int      value;
  final Color    color;
  final Color    bg;
  final bool     active;
  final VoidCallback onTap;
  const _StatChip({required this.label, required this.value, required this.color, required this.bg, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(right: Sp.s3),
        padding: const EdgeInsets.symmetric(horizontal: Sp.s4, vertical: Sp.s3),
        decoration: BoxDecoration(
          color: active ? color : ClimbrColors.bgPrimary,
          borderRadius: BorderRadius.circular(Radii.lg),
          border: Border.all(color: active ? color : ClimbrColors.border),
          boxShadow: active ? [BoxShadow(color: color.withValues(alpha: 0.2), blurRadius: 8, offset: const Offset(0, 3))] : null,
        ),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text(
            '$value',
            style: ClimbrText.h3.copyWith(
              color: active ? Colors.white : color,
              fontWeight: FontWeight.w800,
            ),
          ),
          Text(
            label,
            style: ClimbrText.caption.copyWith(
              color: active ? Colors.white.withValues(alpha: 0.85) : ClimbrColors.textSecondary,
            ),
          ),
        ]),
      ),
    );
  }
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

class _StatSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: Sp.s5),
      itemCount: 4,
      separatorBuilder: (_, __) => const SizedBox(width: Sp.s3),
      itemBuilder: (_, __) => Container(
        width: 88,
        decoration: BoxDecoration(color: ClimbrColors.bgPrimary, borderRadius: BorderRadius.circular(Radii.lg), border: Border.all(color: ClimbrColors.border)),
      ).animate(onPlay: (c) => c.repeat(reverse: true)).shimmer(duration: 1200.ms, color: ClimbrColors.bgTertiary),
    );
  }
}

class _ListSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, 100),
      itemCount: 5,
      separatorBuilder: (_, __) => const SizedBox(height: Sp.s3),
      itemBuilder: (_, __) => Container(
        height: 84,
        decoration: BoxDecoration(color: ClimbrColors.bgPrimary, borderRadius: BorderRadius.circular(Radii.lg), border: Border.all(color: ClimbrColors.border)),
      ).animate(onPlay: (c) => c.repeat(reverse: true)).shimmer(duration: 1200.ms, color: ClimbrColors.bgTertiary),
    );
  }
}
