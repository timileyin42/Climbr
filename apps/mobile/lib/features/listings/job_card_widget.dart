import 'package:flutter/material.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import '../../data/models/jobs_models.dart';

class JobCardWidget extends StatelessWidget {
  final Job          job;
  final bool         saved;
  final VoidCallback onTap;
  final VoidCallback? onSave;

  const JobCardWidget({
    super.key,
    required this.job,
    required this.onTap,
    this.saved   = false,
    this.onSave,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: ClimbrColors.bgPrimary,
          borderRadius: BorderRadius.circular(Radii.xl),
          border: Border.all(color: ClimbrColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(Radii.xl)),
              child: Container(
                height: 120,
                width: double.infinity,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end:   Alignment.bottomRight,
                    colors: [Color(0xFFE6F7FB), Color(0xFFC8EBEF)],
                  ),
                ),
                child: Align(
                  alignment: Alignment.bottomRight,
                  child: Padding(
                    padding: const EdgeInsets.only(right: 12, bottom: 8),
                    child: Text(
                      job.employerName.isNotEmpty ? job.employerName[0].toUpperCase() : '?',
                      style: const TextStyle(
                        fontFamily: 'Inter', fontSize: 64, fontWeight: FontWeight.w800,
                        color: Color(0x120CC0DF),
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Content
            Padding(
              padding: const EdgeInsets.all(Sp.s3),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Type + time + save
                  Row(children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: ClimbrColors.brandOrangeSoft,
                        borderRadius: BorderRadius.circular(Radii.pill),
                      ),
                      child: Text(
                        job.formattedType,
                        style: ClimbrText.caption.copyWith(color: ClimbrColors.brandOrange, fontWeight: FontWeight.w700),
                      ),
                    ),
                    const SizedBox(width: Sp.s2),
                    Expanded(
                      child: Text(job.timeAgo(), style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary)),
                    ),
                    if (onSave != null)
                      GestureDetector(
                        onTap: onSave,
                        child: Icon(
                          saved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                          size: 18,
                          color: saved ? ClimbrColors.brandCyan : ClimbrColors.textTertiary,
                        ),
                      ),
                  ]),

                  const SizedBox(height: Sp.s2),

                  // Title + logo
                  Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(
                          job.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary, height: 1.25),
                        ),
                        Text(
                          job.employerName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: ClimbrText.caption.copyWith(color: ClimbrColors.brandCyan),
                        ),
                      ]),
                    ),
                    const SizedBox(width: Sp.s2),
                    Container(
                      width: 32, height: 32,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: ClimbrColors.brandCyanSoft,
                        border: Border.all(color: ClimbrColors.brandCyan.withValues(alpha: 0.25)),
                      ),
                      child: Center(
                        child: Text(
                          job.employerName.isNotEmpty ? job.employerName[0].toUpperCase() : '?',
                          style: ClimbrText.caption.copyWith(color: ClimbrColors.brandCyan, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                  ]),

                  const SizedBox(height: Sp.s2),

                  // Location + Salary
                  Row(children: [
                    const Icon(Icons.location_on_outlined, size: 12, color: ClimbrColors.textTertiary),
                    const SizedBox(width: 3),
                    Expanded(
                      child: Text(
                        job.location,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: ClimbrText.caption.copyWith(color: ClimbrColors.textSecondary),
                      ),
                    ),
                    if (job.formattedSalary.isNotEmpty)
                      Text(job.formattedSalary, style: ClimbrText.caption.copyWith(color: ClimbrColors.textSecondary, fontWeight: FontWeight.w600)),
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

// ── Training card ─────────────────────────────────────────────────────────────

class TrainingCardWidget extends StatelessWidget {
  final Training     training;
  final VoidCallback onTap;

  const TrainingCardWidget({super.key, required this.training, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: ClimbrColors.bgPrimary,
          borderRadius: BorderRadius.circular(Radii.xl),
          border: Border.all(color: ClimbrColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner (yellow tint for trainings)
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(Radii.xl)),
              child: Container(
                height: 120,
                width: double.infinity,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end:   Alignment.bottomRight,
                    colors: [Color(0xFFFFF8E0), Color(0xFFFFEDAA)],
                  ),
                ),
                child: Align(
                  alignment: Alignment.bottomRight,
                  child: Padding(
                    padding: const EdgeInsets.only(right: 12, bottom: 8),
                    child: Text(
                      training.trainerName.isNotEmpty ? training.trainerName[0].toUpperCase() : '?',
                      style: const TextStyle(
                        fontFamily: 'Inter', fontSize: 64, fontWeight: FontWeight.w800,
                        color: Color(0x18FFC93C),
                      ),
                    ),
                  ),
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(Sp.s3),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF8E0),
                        borderRadius: BorderRadius.circular(Radii.pill),
                      ),
                      child: Text(
                        training.formattedDelivery,
                        style: ClimbrText.caption.copyWith(color: const Color(0xFF8B6A00), fontWeight: FontWeight.w700),
                      ),
                    ),
                    const Spacer(),
                    Text(training.formattedCost, style: ClimbrText.caption.copyWith(color: ClimbrColors.textSecondary, fontWeight: FontWeight.w600)),
                  ]),

                  const SizedBox(height: Sp.s2),

                  Text(
                    training.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary, height: 1.25),
                  ),
                  Text(
                    training.trainerName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: ClimbrText.caption.copyWith(color: const Color(0xFF8B6A00)),
                  ),

                  const SizedBox(height: Sp.s2),

                  if (training.location != null)
                    Row(children: [
                      const Icon(Icons.location_on_outlined, size: 12, color: ClimbrColors.textTertiary),
                      const SizedBox(width: 3),
                      Text(
                        training.location!,
                        style: ClimbrText.caption.copyWith(color: ClimbrColors.textSecondary),
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
