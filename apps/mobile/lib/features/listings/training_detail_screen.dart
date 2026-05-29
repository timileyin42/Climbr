import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import 'listings_provider.dart';

class TrainingDetailScreen extends ConsumerWidget {
  final int trainingId;
  const TrainingDetailScreen({super.key, required this.trainingId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state    = ref.watch(trainingDetailProvider(trainingId));
    final notifier = ref.read(trainingDetailProvider(trainingId).notifier);

    if (state.loading) {
      return const Scaffold(
        backgroundColor: ClimbrColors.bgSecondary,
        body: Center(child: CircularProgressIndicator(color: Color(0xFFFFC93C))),
      );
    }

    if (state.error != null || state.training == null) {
      return Scaffold(
        backgroundColor: ClimbrColors.bgSecondary,
        appBar: AppBar(backgroundColor: ClimbrColors.bgSecondary, elevation: 0),
        body: Center(child: Text('Training not found', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary))),
      );
    }

    final t = state.training!;

    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              // ── Banner ───────────────────────────────────────────────
              SliverToBoxAdapter(
                child: Stack(
                  children: [
                    Container(
                      height: 200,
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end:   Alignment.bottomRight,
                          colors: [Color(0xFFFFF8E0), Color(0xFFFFEDAA)],
                        ),
                      ),
                      child: Center(
                        child: Text(
                          t.trainerName.isNotEmpty ? t.trainerName[0].toUpperCase() : '?',
                          style: const TextStyle(
                            fontFamily: 'Inter', fontSize: 100, fontWeight: FontWeight.w800,
                            color: Color(0x18FFC93C),
                          ),
                        ),
                      ),
                    ),
                    SafeArea(
                      child: Row(children: [
                        const SizedBox(width: Sp.s4),
                        GestureDetector(
                          onTap: () => context.pop(),
                          child: Container(
                            width: 38, height: 38,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white.withValues(alpha: 0.85),
                            ),
                            child: const Icon(Icons.arrow_back_ios_new_rounded, size: 16),
                          ),
                        ),
                      ]),
                    ),
                  ],
                ),
              ),

              // ── Header card ──────────────────────────────────────────
              SliverToBoxAdapter(
                child: Container(
                  margin: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, Sp.s4),
                  padding: const EdgeInsets.all(Sp.s5),
                  decoration: BoxDecoration(
                    color: ClimbrColors.bgPrimary,
                    borderRadius: BorderRadius.circular(Radii.xl),
                    border: Border.all(color: ClimbrColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Container(
                          width: 52, height: 52,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFFFFF8E0),
                            border: Border.all(color: const Color(0xFFFFC93C).withValues(alpha: 0.4)),
                          ),
                          child: Center(
                            child: Text(
                              t.trainerName.isNotEmpty ? t.trainerName[0].toUpperCase() : '?',
                              style: ClimbrText.h3.copyWith(color: const Color(0xFF8B6A00)),
                            ),
                          ),
                        ),
                        const SizedBox(width: Sp.s3),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(t.title, style: ClimbrText.h2.copyWith(color: ClimbrColors.textPrimary)),
                            Text(t.trainerName, style: ClimbrText.bodyMd.copyWith(color: const Color(0xFF8B6A00))),
                          ]),
                        ),
                      ]),

                      const SizedBox(height: Sp.s4),

                      // Tags row
                      Wrap(spacing: Sp.s2, runSpacing: Sp.s2, children: [
                        _Chip(label: t.formattedDelivery, color: const Color(0xFF8B6A00), bg: const Color(0xFFFFF8E0)),
                        _Chip(label: t.formattedCost, color: ClimbrColors.statusAccepted, bg: ClimbrColors.statusAcceptedBg),
                        if (t.level != null) _Chip(label: t.level!, color: ClimbrColors.textSecondary, bg: ClimbrColors.bgTertiary),
                      ]),

                      const SizedBox(height: Sp.s4),

                      // Details grid
                      _DetailsCard(training: t),
                    ],
                  ),
                ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.05, end: 0, duration: 400.ms),
              ),

              // ── Highlights ───────────────────────────────────────────
              if (t.highlights != null && t.highlights!.isNotEmpty)
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, Sp.s4),
                    padding: const EdgeInsets.all(Sp.s4),
                    decoration: const BoxDecoration(
                      color: Color(0xFFFFF8E0),
                      borderRadius: BorderRadius.all(Radius.circular(Radii.lg)),
                      border: Border(left: BorderSide(color: Color(0xFFFFC93C), width: 4)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('✦ Why you\'ll love this', style: ClimbrText.label.copyWith(color: const Color(0xFF8B6A00))),
                        const SizedBox(height: 4),
                        Text(t.highlights!, style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary)),
                      ],
                    ),
                  ).animate(delay: 100.ms).fadeIn(duration: 400.ms),
                ),

              // ── Description ──────────────────────────────────────────
              if (t.description != null && t.description!.isNotEmpty)
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, Sp.s4),
                    padding: const EdgeInsets.all(Sp.s5),
                    decoration: BoxDecoration(
                      color: ClimbrColors.bgPrimary,
                      borderRadius: BorderRadius.circular(Radii.xl),
                      border: Border.all(color: ClimbrColors.border),
                    ),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('About this Programme', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
                      const SizedBox(height: Sp.s3),
                      Text(t.description!, style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary, height: 1.6)),
                    ]),
                  ).animate(delay: 150.ms).fadeIn(duration: 400.ms),
                ),

              // ── Curriculum ───────────────────────────────────────────
              if (t.curriculum != null && t.curriculum!.isNotEmpty)
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, Sp.s4),
                    padding: const EdgeInsets.all(Sp.s5),
                    decoration: BoxDecoration(
                      color: ClimbrColors.bgPrimary,
                      borderRadius: BorderRadius.circular(Radii.xl),
                      border: Border.all(color: ClimbrColors.border),
                    ),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Curriculum', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
                      const SizedBox(height: Sp.s3),
                      Text(t.curriculum!, style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary, height: 1.6)),
                    ]),
                  ).animate(delay: 200.ms).fadeIn(duration: 400.ms),
                ),

              const SliverToBoxAdapter(child: SizedBox(height: 120)),
            ],
          ),

          // ── Sticky bottom bar ────────────────────────────────────────
          Positioned(
            bottom: 0, left: 0, right: 0,
            child: Container(
              padding: EdgeInsets.fromLTRB(Sp.s5, Sp.s4, Sp.s5, MediaQuery.paddingOf(context).bottom + Sp.s4),
              decoration: BoxDecoration(
                color: ClimbrColors.bgPrimary,
                border: const Border(top: BorderSide(color: ClimbrColors.border)),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 12, offset: const Offset(0, -4))],
              ),
              child: state.applied
                  ? _AppliedBadge()
                  : SizedBox(
                      width: double.infinity, height: 50,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFFC93C),
                          foregroundColor: ClimbrColors.brandNavy,
                          shape: const StadiumBorder(),
                          elevation: 0,
                        ),
                        onPressed: () async {
                          final ok = await notifier.apply();
                          if (!ok && context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Failed to apply — please try again')),
                            );
                          }
                        },
                        child: const Text('Enrol Now', style: TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w700)),
                      ),
                    ),
            ).animate().slideY(begin: 0.3, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),
          ),
        ],
      ),
    );
  }
}

// ── Training details card ─────────────────────────────────────────────────────

class _DetailsCard extends StatelessWidget {
  final dynamic training;
  const _DetailsCard({required this.training});

  @override
  Widget build(BuildContext context) {
    final rows = <(String, String)>[
      if (training.startDate != null) ('Start date', _formatDate(training.startDate as String)),
      if (training.endDate   != null) ('End date',   _formatDate(training.endDate   as String)),
      if (training.duration  != null) ('Duration',   training.duration  as String),
      if (training.openSlots != null) ('Open slots', '${training.openSlots} remaining'),
      if (training.location  != null) ('Location',   training.location  as String),
    ];

    return Wrap(
      spacing: Sp.s3, runSpacing: Sp.s3,
      children: rows.map((r) => SizedBox(
        width: (MediaQuery.sizeOf(context).width - Sp.s5 * 2 - Sp.s3) / 2 - Sp.s3,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(r.$1, style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary)),
          const SizedBox(height: 2),
          Text(r.$2, style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary)),
        ]),
      )).toList(),
    );
  }

  String _formatDate(String iso) {
    try {
      final d = DateTime.parse(iso);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return '${months[d.month - 1]} ${d.day}, ${d.year}';
    } catch (_) { return iso; }
  }
}

// ── Shared ────────────────────────────────────────────────────────────────────

class _Chip extends StatelessWidget {
  final String label; final Color color; final Color bg;
  const _Chip({required this.label, required this.color, required this.bg});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(Radii.pill)),
    child: Text(label, style: ClimbrText.caption.copyWith(color: color, fontWeight: FontWeight.w700)),
  );
}

class _AppliedBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(
    height: 50,
    decoration: BoxDecoration(color: ClimbrColors.statusAcceptedBg, borderRadius: BorderRadius.circular(Radii.pill)),
    child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
      const Icon(Icons.check_circle_outline, size: 20, color: ClimbrColors.statusAccepted),
      const SizedBox(width: Sp.s2),
      Text('Enrolled ✓', style: ClimbrText.label.copyWith(color: ClimbrColors.statusAccepted)),
    ]),
  );
}
