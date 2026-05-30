import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import '../../data/models/saved_models.dart';
import 'saved_provider.dart';
import '../listings/job_card_widget.dart';

class SavedScreen extends ConsumerStatefulWidget {
  const SavedScreen({super.key});

  @override
  ConsumerState<SavedScreen> createState() => _SavedScreenState();
}

class _SavedScreenState extends ConsumerState<SavedScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() { _tabs.dispose(); super.dispose(); }

  void _unsaveJob(SavedJob saved) {
    // Optimistic remove
    final removed = ref.read(savedJobsProvider.notifier).optimisticRemove(saved.id);
    if (removed == null) return;

    // Fire API in background
    ref.read(savedJobsProvider.notifier).unsave(saved.id);

    // Show undo snackbar
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        duration: const Duration(seconds: 5),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.fromLTRB(Sp.s4, 0, Sp.s4, 96),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Radii.lg)),
        backgroundColor: ClimbrColors.bgPrimary,
        content: Row(children: [
          Expanded(
            child: RichText(
              text: TextSpan(children: [
                TextSpan(text: 'Removed ', style: ClimbrText.bodySm.copyWith(color: ClimbrColors.textSecondary)),
                TextSpan(text: removed.job.title, style: ClimbrText.bodySm.copyWith(color: ClimbrColors.textPrimary, fontWeight: FontWeight.w700)),
                TextSpan(text: ' from saved jobs.', style: ClimbrText.bodySm.copyWith(color: ClimbrColors.textSecondary)),
              ]),
            ),
          ),
          const SizedBox(width: Sp.s3),
          GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(context).clearSnackBars();
              ref.read(savedJobsProvider.notifier).resave(removed.jobId);
            },
            child: Text('Undo', style: ClimbrText.label.copyWith(color: ClimbrColors.brandCyan)),
          ),
        ]),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final jobsState      = ref.watch(savedJobsProvider);
    final trainingsState = ref.watch(savedTrainingsProvider);

    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ──────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, 0),
              child: Text('Saved', style: ClimbrText.h1.copyWith(color: ClimbrColors.textPrimary))
                  .animate().fadeIn(duration: 300.ms),
            ),

            const SizedBox(height: Sp.s4),

            // ── Tabs ─────────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: Sp.s5),
              child: Container(
                height: 44,
                decoration: BoxDecoration(
                  color: ClimbrColors.bgTertiary,
                  borderRadius: BorderRadius.circular(Radii.pill),
                ),
                child: TabBar(
                  controller: _tabs,
                  labelStyle: ClimbrText.label,
                  unselectedLabelStyle: ClimbrText.label,
                  labelColor: ClimbrColors.textPrimary,
                  unselectedLabelColor: ClimbrColors.textTertiary,
                  indicator: BoxDecoration(
                    color: ClimbrColors.bgPrimary,
                    borderRadius: BorderRadius.circular(Radii.pill),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 8, offset: const Offset(0, 2))],
                  ),
                  indicatorSize: TabBarIndicatorSize.tab,
                  indicatorPadding: const EdgeInsets.all(3),
                  dividerColor: Colors.transparent,
                  tabs: [
                    Tab(
                      child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        const Icon(Icons.work_outline_rounded, size: 14),
                        const SizedBox(width: 5),
                        Text('Jobs (${jobsState.jobs.length})'),
                      ]),
                    ),
                    Tab(
                      child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        const Icon(Icons.school_outlined, size: 14),
                        const SizedBox(width: 5),
                        Text('Trainings (${trainingsState.trainings.length})'),
                      ]),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: Sp.s4),

            // ── Tab views ────────────────────────────────────────────────
            Expanded(
              child: TabBarView(
                controller: _tabs,
                children: [
                  // ── Saved jobs ─────────────────────────────────────
                  jobsState.loading
                      ? _Skeleton()
                      : jobsState.jobs.isEmpty
                          ? _EmptyState(
                              icon: Icons.bookmark_border_rounded,
                              label: 'No saved jobs yet',
                              sub:   'Bookmark jobs while browsing and they\'ll appear here.',
                            )
                          : RefreshIndicator(
                              color: ClimbrColors.brandCyan,
                              onRefresh: () => ref.read(savedJobsProvider.notifier).fetch(),
                              child: GridView.builder(
                                padding: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, 100),
                                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2, crossAxisSpacing: Sp.s3, mainAxisSpacing: Sp.s3, childAspectRatio: 0.72,
                                ),
                                itemCount: jobsState.jobs.length,
                                itemBuilder: (_, i) {
                                  final saved = jobsState.jobs[i];
                                  return JobCardWidget(
                                    job:   saved.job,
                                    saved: true,
                                    onTap: () => context.push('/jobs/${saved.job.id}'),
                                    onSave: () => _unsaveJob(saved),
                                  ).animate(delay: Duration(milliseconds: i * 50))
                                      .fadeIn(duration: 280.ms)
                                      .slideY(begin: 0.05, end: 0, duration: 280.ms);
                                },
                              ),
                            ),

                  // ── Saved trainings ────────────────────────────────
                  trainingsState.loading
                      ? _Skeleton()
                      : trainingsState.trainings.isEmpty
                          ? _EmptyState(
                              icon: Icons.school_outlined,
                              label: 'No saved trainings yet',
                              sub:   'Bookmark training programmes and they\'ll appear here.',
                            )
                          : RefreshIndicator(
                              color: ClimbrColors.brandCyan,
                              onRefresh: () => ref.read(savedTrainingsProvider.notifier).fetch(),
                              child: GridView.builder(
                                padding: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, 100),
                                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2, crossAxisSpacing: Sp.s3, mainAxisSpacing: Sp.s3, childAspectRatio: 0.72,
                                ),
                                itemCount: trainingsState.trainings.length,
                                itemBuilder: (_, i) {
                                  final saved = trainingsState.trainings[i];
                                  return TrainingCardWidget(
                                    training: saved.training,
                                    onTap: () => context.push('/trainings/${saved.training.id}'),
                                  ).animate(delay: Duration(milliseconds: i * 50))
                                      .fadeIn(duration: 280.ms);
                                },
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

// ── Skeleton ──────────────────────────────────────────────────────────────────

class _Skeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, 100),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2, crossAxisSpacing: Sp.s3, mainAxisSpacing: Sp.s3, childAspectRatio: 0.72,
      ),
      itemCount: 6,
      itemBuilder: (_, __) => Container(
        decoration: BoxDecoration(
          color: ClimbrColors.bgPrimary,
          borderRadius: BorderRadius.circular(Radii.xl),
          border: Border.all(color: ClimbrColors.border),
        ),
      ).animate(onPlay: (c) => c.repeat(reverse: true))
          .shimmer(duration: 1200.ms, color: ClimbrColors.bgTertiary),
    );
  }
}

// ── Empty state ───────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String   label;
  final String   sub;
  const _EmptyState({required this.icon, required this.label, required this.sub});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: Sp.s7),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(
            width: 72, height: 72,
            decoration: BoxDecoration(shape: BoxShape.circle, color: ClimbrColors.bgTertiary),
            child: Icon(icon, size: 36, color: ClimbrColors.textTertiary),
          )
              .animate(onPlay: (c) => c.repeat(reverse: true))
              .moveY(begin: 0, end: -6, duration: 2400.ms, curve: Curves.easeInOut),
          const SizedBox(height: Sp.s4),
          Text(label, style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary), textAlign: TextAlign.center),
          const SizedBox(height: Sp.s2),
          Text(sub, style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary), textAlign: TextAlign.center),
        ]),
      ),
    );
  }
}
