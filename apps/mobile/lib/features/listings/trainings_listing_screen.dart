import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import 'listings_provider.dart';
import 'job_card_widget.dart';

const _deliveries = ['', 'online', 'in_person', 'hybrid'];
const _deliveryLabels = ['All', 'Online', 'In-person', 'Hybrid'];

class TrainingsListingScreen extends ConsumerStatefulWidget {
  const TrainingsListingScreen({super.key});

  @override
  ConsumerState<TrainingsListingScreen> createState() => _TrainingsListingScreenState();
}

class _TrainingsListingScreenState extends ConsumerState<TrainingsListingScreen> {
  final _searchCtrl   = TextEditingController();
  bool  _gridView     = true;
  bool  _showFilter   = false;
  String _activeDelivery = '';

  @override
  void dispose() { _searchCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final state    = ref.watch(trainingsListProvider);
    final notifier = ref.read(trainingsListProvider.notifier);
    final ts       = state.trainings;

    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, 0),
              child: Row(children: [
                GestureDetector(
                  onTap: () => context.pop(),
                  child: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: ClimbrColors.textPrimary),
                ),
                const SizedBox(width: Sp.s3),
                Expanded(child: Text('Trainings', style: ClimbrText.h2.copyWith(color: ClimbrColors.textPrimary))),
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
                          onSubmitted: (q) => notifier.fetch(search: q, category: _activeDelivery.isEmpty ? null : _activeDelivery),
                          style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
                          decoration: InputDecoration(
                            hintText: 'Search trainings…',
                            hintStyle: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textTertiary),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.zero,
                          ),
                        ),
                      ),
                      const SizedBox(width: Sp.s3),
                    ]),
                  ),
                ),
                const SizedBox(width: Sp.s2),
                GestureDetector(
                  onTap: () => setState(() => _showFilter = !_showFilter),
                  child: Container(
                    width: 46, height: 46,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _showFilter ? const Color(0xFFFFC93C) : ClimbrColors.bgPrimary,
                      border: Border.all(color: _showFilter ? const Color(0xFFFFC93C) : ClimbrColors.border),
                    ),
                    child: Icon(Icons.tune_rounded, size: 20,
                      color: _showFilter ? ClimbrColors.brandNavy : ClimbrColors.textSecondary),
                  ),
                ),
              ]),
            ),

            if (_showFilter)
              AnimatedSize(
                duration: 220.ms,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(Sp.s5, Sp.s3, 0, 0),
                  child: SizedBox(
                    height: 36,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _deliveries.length,
                      separatorBuilder: (_, __) => const SizedBox(width: Sp.s2),
                      itemBuilder: (_, i) {
                        final active = _activeDelivery == _deliveries[i];
                        return GestureDetector(
                          onTap: () {
                            setState(() => _activeDelivery = _deliveries[i]);
                            notifier.fetch(
                              search:        _searchCtrl.text.isEmpty ? null : _searchCtrl.text,
                              deliveryMethod: _deliveries[i].isEmpty ? null : _deliveries[i],
                            );
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
                                _deliveryLabels[i],
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

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: Sp.s6),
              child: Row(children: [
                Expanded(child: Text('Available Programmes', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary))),
                if (!state.loading)
                  Text('${ts.length} found', style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary)),
              ]),
            ),

            const SizedBox(height: Sp.s3),

            Expanded(
              child: state.loading
                  ? _SkeletonGrid(grid: _gridView)
                  : ts.isEmpty
                      ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                          const Icon(Icons.school_outlined, size: 56, color: ClimbrColors.textTertiary),
                          const SizedBox(height: Sp.s3),
                          Text('No trainings found', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
                        ]))
                      : RefreshIndicator(
                          color: ClimbrColors.brandCyan,
                          onRefresh: () => notifier.fetch(),
                          child: _gridView
                              ? GridView.builder(
                                  padding: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, 100),
                                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                    crossAxisCount: 2, crossAxisSpacing: Sp.s3, mainAxisSpacing: Sp.s3, childAspectRatio: 0.72,
                                  ),
                                  itemCount: ts.length,
                                  itemBuilder: (_, i) => TrainingCardWidget(
                                    training: ts[i],
                                    onTap: () => context.push('/trainings/${ts[i].id}'),
                                  ).animate(delay: Duration(milliseconds: i * 40)).fadeIn(duration: 280.ms),
                                )
                              : ListView.separated(
                                  padding: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, 100),
                                  itemCount: ts.length,
                                  separatorBuilder: (_, __) => const SizedBox(height: Sp.s3),
                                  itemBuilder: (_, i) => TrainingCardWidget(
                                    training: ts[i],
                                    onTap: () => context.push('/trainings/${ts[i].id}'),
                                  ).animate(delay: Duration(milliseconds: i * 40)).fadeIn(duration: 280.ms),
                                ),
                        ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SkeletonGrid extends StatelessWidget {
  final bool grid;
  const _SkeletonGrid({required this.grid});

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
          decoration: BoxDecoration(color: ClimbrColors.bgPrimary, borderRadius: BorderRadius.circular(Radii.xl), border: Border.all(color: ClimbrColors.border)),
        ).animate(onPlay: (c) => c.repeat(reverse: true)).shimmer(duration: 1200.ms, color: ClimbrColors.bgTertiary),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, 100),
      itemCount: 5,
      separatorBuilder: (_, __) => const SizedBox(height: Sp.s3),
      itemBuilder: (_, __) => Container(
        height: 100,
        decoration: BoxDecoration(color: ClimbrColors.bgPrimary, borderRadius: BorderRadius.circular(Radii.lg), border: Border.all(color: ClimbrColors.border)),
      ).animate(onPlay: (c) => c.repeat(reverse: true)).shimmer(duration: 1200.ms, color: ClimbrColors.bgTertiary),
    );
  }
}
