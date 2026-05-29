import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import 'listings_provider.dart';

class JobDetailScreen extends ConsumerWidget {
  final int jobId;
  const JobDetailScreen({super.key, required this.jobId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state    = ref.watch(jobDetailProvider(jobId));
    final notifier = ref.read(jobDetailProvider(jobId).notifier);

    if (state.loading) {
      return const Scaffold(
        backgroundColor: ClimbrColors.bgSecondary,
        body: Center(child: CircularProgressIndicator(color: ClimbrColors.brandCyan)),
      );
    }

    if (state.error != null || state.job == null) {
      return Scaffold(
        backgroundColor: ClimbrColors.bgSecondary,
        appBar: AppBar(backgroundColor: ClimbrColors.bgSecondary, elevation: 0),
        body: Center(child: Text('Job not found', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary))),
      );
    }

    final job = state.job!;

    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: Stack(
        children: [
          // ── Scrollable content ─────────────────────────────────────────
          CustomScrollView(
            slivers: [
              // ── Banner / App bar ───────────────────────────────────────
              SliverToBoxAdapter(
                child: Stack(
                  children: [
                    Container(
                      height: 200,
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end:   Alignment.bottomRight,
                          colors: [Color(0xFFE6F7FB), Color(0xFFC8EBEF)],
                        ),
                      ),
                      child: Center(
                        child: Text(
                          job.employerName.isNotEmpty ? job.employerName[0].toUpperCase() : '?',
                          style: const TextStyle(
                            fontFamily: 'Inter', fontSize: 100, fontWeight: FontWeight.w800,
                            color: Color(0x120CC0DF),
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

              // ── Header card ────────────────────────────────────────────
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
                        // Company logo
                        Container(
                          width: 52, height: 52,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: ClimbrColors.brandCyanSoft,
                            border: Border.all(color: ClimbrColors.brandCyan.withValues(alpha: 0.3)),
                          ),
                          child: Center(
                            child: Text(
                              job.employerName.isNotEmpty ? job.employerName[0].toUpperCase() : '?',
                              style: ClimbrText.h3.copyWith(color: ClimbrColors.brandCyan),
                            ),
                          ),
                        ),
                        const SizedBox(width: Sp.s3),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(job.title, style: ClimbrText.h2.copyWith(color: ClimbrColors.textPrimary)),
                            Text(job.employerName, style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.brandCyan)),
                          ]),
                        ),
                        GestureDetector(
                          onTap: notifier.save,
                          child: Icon(
                            state.saved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                            color: state.saved ? ClimbrColors.brandCyan : ClimbrColors.textTertiary,
                            size: 24,
                          ),
                        ),
                      ]),

                      const SizedBox(height: Sp.s4),

                      // Chips row
                      Wrap(spacing: Sp.s2, runSpacing: Sp.s2, children: [
                        _Chip(label: job.formattedType, color: ClimbrColors.brandOrange, bg: ClimbrColors.brandOrangeSoft),
                        if (job.industry != null) _Chip(label: job.industry!, color: ClimbrColors.textSecondary, bg: ClimbrColors.bgTertiary),
                        if ((job as dynamic).experienceLevel != null)
                          _Chip(label: (job as dynamic).experienceLevel as String, color: ClimbrColors.textSecondary, bg: ClimbrColors.bgTertiary),
                      ]),

                      const SizedBox(height: Sp.s4),

                      // Meta
                      Wrap(spacing: Sp.s4, runSpacing: Sp.s2, children: [
                        _Meta(icon: Icons.location_on_outlined,    text: job.location),
                        if (job.formattedSalary.isNotEmpty)
                          _Meta(icon: Icons.payments_outlined,     text: job.formattedSalary),
                        _Meta(icon: Icons.calendar_today_outlined, text: 'Posted ${job.timeAgo()}'),
                      ]),
                    ],
                  ),
                ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.05, end: 0, duration: 400.ms),
              ),

              // ── Highlights callout ─────────────────────────────────────
              if (job.highlights != null && job.highlights!.isNotEmpty)
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, Sp.s4),
                    padding: const EdgeInsets.all(Sp.s4),
                    decoration: BoxDecoration(
                      color: ClimbrColors.brandOrangeSoft,
                      borderRadius: BorderRadius.circular(Radii.lg),
                      border: const Border(left: BorderSide(color: ClimbrColors.brandOrange, width: 4)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('✦ Why you\'ll love this', style: ClimbrText.label.copyWith(color: ClimbrColors.brandOrange)),
                        const SizedBox(height: 4),
                        Text(job.highlights!, style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary)),
                      ],
                    ),
                  ).animate(delay: 100.ms).fadeIn(duration: 400.ms),
                ),

              // ── Description ────────────────────────────────────────────
              if (job.description != null && job.description!.isNotEmpty)
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
                      Text('Job Description', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
                      const SizedBox(height: Sp.s3),
                      Text(job.description!, style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary, height: 1.6)),
                    ]),
                  ).animate(delay: 150.ms).fadeIn(duration: 400.ms),
                ),

              // Bottom padding for sticky bar
              const SliverToBoxAdapter(child: SizedBox(height: 120)),
            ],
          ),

          // ── Sticky bottom bar ──────────────────────────────────────────
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
                  : Row(children: [
                      Expanded(
                        child: SizedBox(
                          height: 50,
                          child: ElevatedButton(
                            onPressed: () => _showApplyModal(context, ref),
                            child: const Text('Apply Now', style: TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w700)),
                          ),
                        ),
                      ),
                    ]),
            ).animate().slideY(begin: 0.3, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),
          ),
        ],
      ),
    );
  }

  void _showApplyModal(BuildContext context, WidgetRef ref) {
    final coverCtrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ApplySheet(
        coverCtrl: coverCtrl,
        onSubmit: (cover) async {
          Navigator.pop(context);
          final ok = await ref.read(jobDetailProvider(jobId).notifier).apply(coverLetter: cover.isEmpty ? null : cover);
          if (!ok && context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Failed to apply — please try again'), backgroundColor: ClimbrColors.statusRejected),
            );
          }
        },
      ),
    ).whenComplete(() => coverCtrl.dispose());
  }
}

// ── Apply bottom sheet ────────────────────────────────────────────────────────

class _ApplySheet extends StatelessWidget {
  final TextEditingController coverCtrl;
  final ValueChanged<String>  onSubmit;
  const _ApplySheet({required this.coverCtrl, required this.onSubmit});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: Container(
        padding: const EdgeInsets.all(Sp.s6),
        decoration: const BoxDecoration(
          color: ClimbrColors.bgPrimary,
          borderRadius: BorderRadius.vertical(top: Radius.circular(Radii.xl2)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 36, height: 4,
                decoration: BoxDecoration(color: ClimbrColors.border, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: Sp.s4),
            Text('Submit Application', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
            const SizedBox(height: Sp.s3),

            // CV note
            Container(
              padding: const EdgeInsets.symmetric(horizontal: Sp.s4, vertical: Sp.s3),
              decoration: BoxDecoration(
                color: ClimbrColors.bgSecondary,
                borderRadius: BorderRadius.circular(Radii.md),
                border: Border.all(color: ClimbrColors.border),
              ),
              child: Row(children: [
                const Icon(Icons.description_outlined, size: 18, color: ClimbrColors.textTertiary),
                const SizedBox(width: Sp.s2),
                Expanded(
                  child: Text(
                    'Your uploaded CV & profile will be shared with the employer.',
                    style: ClimbrText.bodySm.copyWith(color: ClimbrColors.textSecondary),
                  ),
                ),
              ]),
            ),

            const SizedBox(height: Sp.s4),

            Text('Cover letter', style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary)),
            const SizedBox(height: 4),
            Text('optional', style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary)),
            const SizedBox(height: Sp.s2),

            TextField(
              controller: coverCtrl,
              maxLines: 5,
              style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
              decoration: InputDecoration(
                hintText: 'Introduce yourself and why you\'re a great fit…',
                hintStyle: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textTertiary),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(Radii.md), borderSide: const BorderSide(color: ClimbrColors.border)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Radii.md), borderSide: const BorderSide(color: ClimbrColors.border)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Radii.md), borderSide: const BorderSide(color: ClimbrColors.brandCyan, width: 1.5)),
                filled: true, fillColor: ClimbrColors.bgPrimary,
                contentPadding: const EdgeInsets.all(Sp.s4),
              ),
            ),

            const SizedBox(height: Sp.s5),

            SizedBox(
              width: double.infinity, height: 52,
              child: ElevatedButton(
                onPressed: () => onSubmit(coverCtrl.text.trim()),
                child: const Text('Submit Application', style: TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Applied badge ─────────────────────────────────────────────────────────────

class _AppliedBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      decoration: BoxDecoration(
        color: ClimbrColors.statusAcceptedBg,
        borderRadius: BorderRadius.circular(Radii.pill),
      ),
      child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Icon(Icons.check_circle_outline, size: 20, color: ClimbrColors.statusAccepted),
        const SizedBox(width: Sp.s2),
        Text('Application submitted ✓', style: ClimbrText.label.copyWith(color: ClimbrColors.statusAccepted)),
      ]),
    );
  }
}

// ── Shared widgets ────────────────────────────────────────────────────────────

class _Chip extends StatelessWidget {
  final String label;
  final Color  color;
  final Color  bg;
  const _Chip({required this.label, required this.color, required this.bg});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(Radii.pill)),
      child: Text(label, style: ClimbrText.caption.copyWith(color: color, fontWeight: FontWeight.w700)),
    );
  }
}

class _Meta extends StatelessWidget {
  final IconData icon;
  final String   text;
  const _Meta({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Icon(icon, size: 14, color: ClimbrColors.textTertiary),
      const SizedBox(width: 4),
      Text(text, style: ClimbrText.bodySm.copyWith(color: ClimbrColors.textSecondary)),
    ]);
  }
}
