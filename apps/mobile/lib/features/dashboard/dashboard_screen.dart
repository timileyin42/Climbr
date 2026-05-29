import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import '../../data/models/dashboard_models.dart';
import 'dashboard_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(dashboardProvider);

    return RefreshIndicator(
      color: ClimbrColors.brandCyan,
      onRefresh: () => ref.read(dashboardProvider.notifier).fetch(),
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          // ── App bar ─────────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s6, Sp.s6, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '👋 Good ${_timeOfDay()}',
                              style: ClimbrText.bodySm.copyWith(color: ClimbrColors.textTertiary),
                            ),
                            const SizedBox(height: 2),
                            Text('Dashboard', style: ClimbrText.h1.copyWith(color: ClimbrColors.textPrimary)),
                          ],
                        ),
                      ),
                      // Notification bell stub
                      Container(
                        width: 40, height: 40,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: ClimbrColors.bgPrimary,
                          border: Border.all(color: ClimbrColors.border),
                        ),
                        child: const Icon(Icons.notifications_none_rounded, size: 20, color: ClimbrColors.textSecondary),
                      ),
                    ],
                  ),
                  const SizedBox(height: Sp.s5),
                ],
              ),
            ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.05, end: 0, duration: 400.ms),
          ),

          // ── Stats cards ──────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: Sp.s6),
              child: state.loading
                  ? _StatsSkeletons()
                  : _StatsGrid(stats: state.stats),
            ),
          ),

          // ── Profile completion ───────────────────────────────────────────
          if (!state.loading && state.stats != null && state.stats!.profileCompletion < 100)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, 0),
                child: _ProfileCompletionCard(pct: state.stats!.profileCompletion),
              ).animate(delay: 200.ms).fadeIn(duration: 400.ms),
            ),

          // ── CTA card ─────────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, 0),
              child: _CtaCard(),
            ).animate(delay: 300.ms).fadeIn(duration: 400.ms),
          ),

          // ── Featured jobs ─────────────────────────────────────────────────
          if (!state.loading && state.stats != null && state.stats!.featuredJobs.isNotEmpty) ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s6, 0, Sp.s3),
                child: Text('Featured Jobs', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
              ).animate(delay: 400.ms).fadeIn(duration: 300.ms),
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 160,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: Sp.s6),
                  itemCount: state.stats!.featuredJobs.length,
                  separatorBuilder: (_, __) => const SizedBox(width: Sp.s3),
                  itemBuilder: (_, i) => _FeaturedJobCard(
                    job: state.stats!.featuredJobs[i],
                  ).animate(delay: Duration(milliseconds: 400 + i * 60)).fadeIn(duration: 300.ms),
                ),
              ),
            ),
          ],

          // ── Bottom padding for floating nav ───────────────────────────────
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }

  String _timeOfDay() {
    final h = DateTime.now().hour;
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }
}

// ── Stats grid ────────────────────────────────────────────────────────────────

class _StatsGrid extends StatelessWidget {
  final DashboardStats? stats;
  const _StatsGrid({this.stats});

  @override
  Widget build(BuildContext context) {
    final cards = [
      _StatData('Applications', stats?.totalApplications ?? 0, Icons.description_outlined, ClimbrColors.brandOrange, ClimbrColors.brandOrangeSoft),
      _StatData('Trainings', stats?.totalTrainings ?? 0, Icons.school_outlined, ClimbrColors.brandCyan, ClimbrColors.brandCyanSoft),
      _StatData('In Review', stats?.inReview ?? 0, Icons.hourglass_empty_rounded, ClimbrColors.statusInReview, ClimbrColors.statusInReviewBg),
      _StatData('Shortlisted', stats?.shortlisted ?? 0, Icons.star_outline_rounded, ClimbrColors.statusShortlisted, ClimbrColors.statusShortlistedBg),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2, crossAxisSpacing: Sp.s3, mainAxisSpacing: Sp.s3, childAspectRatio: 1.55,
      ),
      itemCount: 4,
      itemBuilder: (_, i) => _StatCard(data: cards[i])
          .animate(delay: Duration(milliseconds: i * 70))
          .fadeIn(duration: 350.ms)
          .slideY(begin: 0.08, end: 0, duration: 350.ms, curve: Curves.easeOutCubic),
    );
  }
}

class _StatData {
  final String label;
  final int    value;
  final IconData icon;
  final Color  color;
  final Color  bg;
  const _StatData(this.label, this.value, this.icon, this.color, this.bg);
}

class _StatCard extends StatelessWidget {
  final _StatData data;
  const _StatCard({required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Sp.s4),
      decoration: BoxDecoration(
        color: ClimbrColors.bgPrimary,
        borderRadius: BorderRadius.circular(Radii.lg),
        border: Border.all(color: ClimbrColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(shape: BoxShape.circle, color: data.bg),
            child: Icon(data.icon, size: 18, color: data.color),
          ),
          const Spacer(),
          Text(
            '${data.value}',
            style: ClimbrText.displayMd.copyWith(color: ClimbrColors.textPrimary, fontSize: 28, fontWeight: FontWeight.w800),
          ),
          Text(data.label, style: ClimbrText.caption.copyWith(color: ClimbrColors.textSecondary)),
        ],
      ),
    );
  }
}

// ── Skeleton loading ──────────────────────────────────────────────────────────

class _StatsSkeletons extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2, crossAxisSpacing: Sp.s3, mainAxisSpacing: Sp.s3, childAspectRatio: 1.55,
      ),
      itemCount: 4,
      itemBuilder: (_, __) => Container(
        decoration: BoxDecoration(
          color: ClimbrColors.bgPrimary,
          borderRadius: BorderRadius.circular(Radii.lg),
          border: Border.all(color: ClimbrColors.border),
        ),
      ).animate(onPlay: (c) => c.repeat(reverse: true))
          .shimmer(duration: 1200.ms, color: ClimbrColors.bgTertiary),
    );
  }
}

// ── Profile completion card ───────────────────────────────────────────────────

class _ProfileCompletionCard extends StatelessWidget {
  final int pct;
  const _ProfileCompletionCard({required this.pct});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Sp.s4),
      decoration: BoxDecoration(
        color: ClimbrColors.brandCyanSoft,
        borderRadius: BorderRadius.circular(Radii.lg),
        border: Border.all(color: ClimbrColors.brandCyan.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 44, height: 44,
            child: Stack(
              fit: StackFit.expand,
              children: [
                CircularProgressIndicator(
                  value: pct / 100,
                  strokeWidth: 4,
                  backgroundColor: ClimbrColors.border,
                  valueColor: const AlwaysStoppedAnimation<Color>(ClimbrColors.brandCyan),
                ),
                Center(
                  child: Text(
                    '$pct%',
                    style: ClimbrText.caption.copyWith(color: ClimbrColors.brandCyan, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: Sp.s3),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Complete your profile', style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary)),
              const SizedBox(height: 2),
              Text('A complete profile gets 3× more views from employers.', style: ClimbrText.caption.copyWith(color: ClimbrColors.textSecondary)),
            ]),
          ),
          const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: ClimbrColors.brandCyan),
        ],
      ),
    );
  }
}

// ── CTA card ──────────────────────────────────────────────────────────────────

class _CtaCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(Sp.s5),
      decoration: BoxDecoration(
        color: ClimbrColors.brandOrange,
        borderRadius: BorderRadius.circular(Radii.xl),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Ready to make\nyour next move?',
            style: ClimbrText.h3.copyWith(color: Colors.white, height: 1.3),
          ),
          const SizedBox(height: Sp.s2),
          Text(
            'Thousands of jobs and training programmes are waiting.',
            style: ClimbrText.bodySm.copyWith(color: Colors.white.withValues(alpha: 0.8)),
          ),
          const SizedBox(height: Sp.s4),
          Row(
            children: [
              _CtaBtn(label: 'Find Jobs', icon: Icons.work_outline_rounded, onTap: () => context.push('/jobs')),
              const SizedBox(width: Sp.s2),
              _CtaBtn(label: 'Trainings', icon: Icons.school_outlined, outlined: true, onTap: () => context.push('/trainings')),
            ],
          ),
        ],
      ),
    );
  }
}

class _CtaBtn extends StatelessWidget {
  final String   label;
  final IconData icon;
  final bool     outlined;
  final VoidCallback? onTap;
  const _CtaBtn({required this.label, required this.icon, this.outlined = false, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          height: 42,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(Radii.pill),
            color: outlined ? Colors.transparent : Colors.white,
            border: outlined ? Border.all(color: Colors.white.withValues(alpha: 0.6)) : null,
          ),
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(icon, size: 16, color: outlined ? Colors.white : ClimbrColors.brandOrange),
            const SizedBox(width: 6),
            Text(
              label,
              style: ClimbrText.label.copyWith(
                color: outlined ? Colors.white : ClimbrColors.brandOrange,
              ),
            ),
          ]),
        ),
      ),
    );
  }
}

// ── Featured job card ─────────────────────────────────────────────────────────

class _FeaturedJobCard extends StatelessWidget {
  final FeaturedJob job;
  const _FeaturedJobCard({required this.job});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/jobs/${job.id}'),
      child: Container(
      width: 230,
      padding: const EdgeInsets.all(Sp.s4),
      decoration: BoxDecoration(
        color: ClimbrColors.bgPrimary,
        borderRadius: BorderRadius.circular(Radii.lg),
        border: Border.all(color: ClimbrColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Logo initial
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: ClimbrColors.brandCyanSoft,
              border: Border.all(color: ClimbrColors.brandCyan.withValues(alpha: 0.25)),
            ),
            child: Center(
              child: Text(
                job.employerName.isNotEmpty ? job.employerName[0].toUpperCase() : '?',
                style: ClimbrText.label.copyWith(color: ClimbrColors.brandCyan),
              ),
            ),
          ),
          const SizedBox(height: Sp.s2),
          Text(
            job.title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary),
          ),
          Text(
            job.employerName,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: ClimbrText.caption.copyWith(color: ClimbrColors.brandCyan),
          ),
          const Spacer(),
          Row(children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(Radii.pill),
                color: ClimbrColors.brandOrangeSoft,
              ),
              child: Text(
                job.jobType.replaceAll('_', '-'),
                style: ClimbrText.caption.copyWith(color: ClimbrColors.brandOrange, fontWeight: FontWeight.w700),
              ),
            ),
            const Spacer(),
            if (job.formattedSalary.isNotEmpty)
              Text(job.formattedSalary, style: ClimbrText.caption.copyWith(color: ClimbrColors.textSecondary)),
          ]),
        ],
      ),
    ),
  );
  }
}
