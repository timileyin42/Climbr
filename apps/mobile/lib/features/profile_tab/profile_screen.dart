import 'package:flutter/material.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      appBar: AppBar(title: Text('My Profile', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary))),
      body: Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.person_outline_rounded, size: 56, color: ClimbrColors.textTertiary),
          const SizedBox(height: Sp.s3),
          Text('My Profile', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
          const SizedBox(height: Sp.s2),
          Text('Coming in Batch 8', style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary)),
        ]),
      ),
    );
  }
}
