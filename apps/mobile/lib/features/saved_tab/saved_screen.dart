import 'package:flutter/material.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';

class SavedScreen extends StatelessWidget {
  const SavedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      appBar: AppBar(title: Text('Saved', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary))),
      body: Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.bookmark_border_rounded, size: 56, color: ClimbrColors.textTertiary),
          const SizedBox(height: Sp.s3),
          Text('Saved Jobs & Trainings', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
          const SizedBox(height: Sp.s2),
          Text('Coming in Batch 7', style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary)),
        ]),
      ),
    );
  }
}
