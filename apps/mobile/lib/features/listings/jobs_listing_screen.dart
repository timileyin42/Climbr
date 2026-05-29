import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import 'listings_provider.dart';
import 'job_card_widget.dart';

const _jobTypes = ['', 'full_time', 'part_time', 'contract', 'internship', 'remote'];
const _jobTypeLabels = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

class JobsListingScreen extends ConsumerStatefulWidget {
  const JobsListingScreen({super.key});

  @override
  ConsumerState<JobsListingScreen> createState() => _JobsListingScreenState();
}

class _JobsListingScreenState extends ConsumerState<JobsListingScreen> {
  final _searchCtrl   = TextEditingController();
  bool  _gridView     = true;
  bool  _showFilter   = false;
  String _activeType  = '';

  @override
  void dispose() { _searchCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final state    = ref.watch(jobsListProvider);
    final notifier = ref.read(jobsListProvider.notifier);
    final jobs     = state.jobs;

    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ──────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, 0),
              child: Row(children: [
                GestureDetector(
                  onTap: () => context.pop(),
                  child: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: ClimbrColors.textPrimary),
                ),
                const SizedBox(width: Sp.s3),
                Expanded(child: Text('Job Listings', style: ClimbrText.h2.copyWith(color: ClimbrColors.textPrimary))),
                // Grid / list toggle
                GestureDetector(
                  onTap: () => setState(() => _gridView = !_gridView),
                  child: Icon(
                    _gridView ? Icons.view_list_rounded : Icons.grid_view_rounded,
                    size: 22, color: ClimbrColors.textSecondary,
                  ),
                ),
              ]),
            ),

            const SizedBox(height: Sp.s4),

            // ── Search bar ──────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: Sp.s5),
              child: Row(children: [
                Expanded(
                  child: Container(
                    height: 46,
                    decoration: BoxDecoration(
                      color: ClimbrColors.bgPrimary,
                      borderRadius: BorderRadius.circular(Radii.pill),
                      border: Border.all(color: ClimbrColors.border),
                    ),
                    child: Row(children: [
                      const SizedBox(width: Sp.s4),
                      const Icon(Icons.search_rounded, size: 18, color: ClimbrColors.textTertiary),
                      const SizedBox(width: Sp.s2),
                      Expanded(
                        child: TextField(
                          controller: _searchCtrl,
                          onSubmitted: notifier.search,
                          style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
                          decoration: InputDecoration(
                            hintText: 'Search by industry, location, type…',
                            hintStyle: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textTertiary),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.zero,
                          ),
                        ),
                      ),
                      if (_searchCtrl.text.isNotEmpty)
                        GestureDetector(
                          onTap: () { _searchCtrl.clear(); notifier.clear(); setState(() {}); },
                          child: const Icon(Icons.close_rounded, size: 16, color: ClimbrColors.textTertiary),
                        ),
                      const SizedBox(width: Sp.s3),
                    ]),
                  ),
                ),
                const SizedBox(width: Sp.s2),
                // Filter button
                GestureDetector(
                  onTap: () => setState(() => _showFilter = !_showFilter),
                  child: Container(
                    width: 46, height: 46,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _showFilter ? ClimbrColors.brandCyan : ClimbrColors.bgPrimary,
                      border: Border.all(color: _showFilter ? ClimbrColors.brandCyan : ClimbrColors.border),
                    ),
                    child: Icon(
                      Icons.tune_rounded, size: 20,
                      color: _showFilter ? Colors.white : ClimbrColors.textSecondary,
                    ),
                  ),
                ),
              ]),
            ),

            // ── Type filter chips ────────────────────────────────────────
            if (_showFilter)
              AnimatedSize(
                duration: 220.ms,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(Sp.s5, Sp.s3, 0, 0),
                  child: SizedBox(
                    height: 36,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _jobTypes.length,
                      separatorBuilder: (_, __) => const SizedBox(width: Sp.s2),
                      itemBuilder: (_, i) {
                        final active = _activeType == _jobTypes[i];
                        return GestureDetector(
                          onTap: () {
                            setState(() => _activeType = _jobTypes[i]);
                            notifier.filterType(_jobTypes[i]);
                          },
                          child: AnimatedContainer(
                            duration: 180.ms,
                            padding: const EdgeInsets.symmetric(horizontal: Sp.s4),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(Radii.pill),
                              color: active ? ClimbrColors.brandNavy : ClimbrColors.bgPrimary,
                              border: Border.all(color: active ? ClimbrColors.brandNavy : ClimbrColors.border),
                            ),
                            child: Center(
                              child: Text(
                                _jobTypeLabels[i],
                                style: ClimbrText.label.copyWith(
                                  color: active ? Colors.white : ClimbrColors.textSecondary,
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ),

            const SizedBox(height: Sp.s4),

            // ── Section title ────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: Sp.s6),
              child: Row(children: [
                Expanded(
                  child: Text('Opportunities You Might Like', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
                ),
                if (!state.loading)
                  Text('${jobs.length} jobs', style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary)),
              ]),
            ),

            const SizedBox(height: Sp.s3),

            // ── Job grid / list ──────────────────────────────────────────
            Expanded(
              child: state.loading
                  ? _LoadingGrid(grid: _gridView)
                  : state.error != null
                      ? Center(child: Text(state.error!, style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.statusRejected)))
                      : jobs.isEmpty
                          ? _EmptyState(query: _searchCtrl.text, onClear: () { _searchCtrl.clear(); notifier.clear(); setState((){}); })
                          : RefreshIndicator(
                              color: ClimbrColors.brandCyan,
                              onRefresh: () => notifier.fetch(),
                              child: _gridView
                                  ? _JobGrid(jobs: jobs)
                                  : _JobList(jobs: jobs),
                            ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Grid view ─────────────────────────────────────────────────────────────────

class _JobGrid extends StatelessWidget {
  final List<dynamic> jobs;
  const _JobGrid({required this.jobs});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, 100),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2, crossAxisSpacing: Sp.s3, mainAxisSpacing: Sp.s3, childAspectRatio: 0.72,
      ),
      itemCount: jobs.length,
      itemBuilder: (_, i) => JobCardWidget(
        job: jobs[i],
        onTap: () => context.push('/jobs/${jobs[i].id}'),
      ).animate(delay: Duration(milliseconds: i * 40))
          .fadeIn(duration: 280.ms)
          .slideY(begin: 0.06, end: 0, duration: 280.ms, curve: Curves.easeOutCubic),
    );
  }
}

// ── List view ─────────────────────────────────────────────────────────────────

class _JobList extends StatelessWidget {
  final List<dynamic> jobs;
  const _JobList({required this.jobs});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, 100),
      itemCount: jobs.length,
      separatorBuilder: (_, __) => const SizedBox(height: Sp.s3),
      itemBuilder: (_, i) => JobCardWidget(
        job: jobs[i],
        onTap: () => context.push('/jobs/${jobs[i].id}'),
      ).animate(delay: Duration(milliseconds: i * 40))
          .fadeIn(duration: 280.ms),
    );
  }
}

// ── Skeleton, empty, states ───────────────────────────────────────────────────

class _LoadingGrid extends StatelessWidget {
  final bool grid;
  const _LoadingGrid({required this.grid});

  @override
  Widget build(BuildContext context) {
    if (grid) {
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
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, 100),
      itemCount: 5,
      separatorBuilder: (_, __) => const SizedBox(height: Sp.s3),
      itemBuilder: (_, __) => Container(
        height: 100,
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

class _EmptyState extends StatelessWidget {
  final String query;
  final VoidCallback onClear;
  const _EmptyState({required this.query, required this.onClear});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: Sp.s7),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.search_off_rounded, size: 56, color: ClimbrColors.textTertiary),
          const SizedBox(height: Sp.s3),
          Text(
            query.isNotEmpty ? '"$query" isn\'t on Climbr yet.' : 'No jobs found.',
            style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: Sp.s2),
          Text(
            query.isNotEmpty ? "We'll let you know when a job is up!" : 'Try adjusting your filters.',
            style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: Sp.s5),
          SizedBox(
            width: 140, height: 46,
            child: ElevatedButton(onPressed: onClear, child: const Text('Clear filters')),
          ),
        ]),
      ),
    );
  }
}
