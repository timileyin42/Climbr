import 'package:flutter/material.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';

class DiscoverScreen extends StatelessWidget {
  const DiscoverScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72, height: 72,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: ClimbrColors.brandCyanSoft,
                  border: Border.all(color: ClimbrColors.brandCyan.withValues(alpha: 0.3)),
                ),
                child: const Icon(Icons.style_outlined, size: 36, color: ClimbrColors.brandCyan),
              ),
              const SizedBox(height: Sp.s4),
              Text('Swipe Deck', style: ClimbrText.h2.copyWith(color: ClimbrColors.textPrimary)),
              const SizedBox(height: Sp.s2),
              Text(
                'Coming in Batch 5 — swipe to save\nor skip jobs and trainings.',
                style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
