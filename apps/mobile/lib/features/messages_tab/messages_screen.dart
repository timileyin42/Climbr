import 'package:flutter/material.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';

class MessagesScreen extends StatelessWidget {
  const MessagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      appBar: AppBar(title: Text('Messages', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary))),
      body: Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.chat_bubble_outline_rounded, size: 56, color: ClimbrColors.textTertiary),
          const SizedBox(height: Sp.s3),
          Text('Messages', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
          const SizedBox(height: Sp.s2),
          Text('Coming in Batch 9', style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary)),
        ]),
      ),
    );
  }
}
