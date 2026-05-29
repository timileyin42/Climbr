import 'package:flutter/material.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';

class ApplicationsScreen extends StatelessWidget {
  const ApplicationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      appBar: AppBar(title: Text('Applications', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary))),
      body: Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.folder_open_outlined, size: 56, color: ClimbrColors.textTertiary),
          const SizedBox(height: Sp.s3),
          Text('My Applications', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
          const SizedBox(height: Sp.s2),
          Text('Coming in Batch 7', style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary)),
        ]),
      ),
    );
  }
}
