import 'package:flutter/material.dart';
import 'colors.dart';

abstract final class ClimbrText {
  static const _family = 'Inter';

  static const displayLg = TextStyle(fontFamily: _family, fontSize: 40, fontWeight: FontWeight.w700, height: 1.1);
  static const displayMd = TextStyle(fontFamily: _family, fontSize: 32, fontWeight: FontWeight.w700, height: 1.15);
  static const h1        = TextStyle(fontFamily: _family, fontSize: 28, fontWeight: FontWeight.w700, height: 1.2);
  static const h2        = TextStyle(fontFamily: _family, fontSize: 22, fontWeight: FontWeight.w600, height: 1.25);
  static const h3        = TextStyle(fontFamily: _family, fontSize: 18, fontWeight: FontWeight.w600, height: 1.3);
  static const bodyLg    = TextStyle(fontFamily: _family, fontSize: 16, fontWeight: FontWeight.w500, height: 1.5);
  static const bodyMd    = TextStyle(fontFamily: _family, fontSize: 14, fontWeight: FontWeight.w400, height: 1.5);
  static const bodySm    = TextStyle(fontFamily: _family, fontSize: 13, fontWeight: FontWeight.w400, height: 1.45);
  static const label     = TextStyle(fontFamily: _family, fontSize: 13, fontWeight: FontWeight.w600, height: 1.3);
  static const caption   = TextStyle(fontFamily: _family, fontSize: 11, fontWeight: FontWeight.w500, height: 1.3);

  static TextTheme lightTextTheme = TextTheme(
    displayLarge:  displayLg.copyWith(color: ClimbrColors.textPrimary),
    displayMedium: displayMd.copyWith(color: ClimbrColors.textPrimary),
    displaySmall:  h1.copyWith(color: ClimbrColors.textPrimary),
    headlineMedium:h2.copyWith(color: ClimbrColors.textPrimary),
    headlineSmall: h3.copyWith(color: ClimbrColors.textPrimary),
    titleLarge:    bodyLg.copyWith(color: ClimbrColors.textPrimary),
    bodyLarge:     bodyMd.copyWith(color: ClimbrColors.textSecondary),
    bodyMedium:    bodySm.copyWith(color: ClimbrColors.textSecondary),
    labelLarge:    label.copyWith(color: ClimbrColors.textPrimary),
    labelSmall:    caption.copyWith(color: ClimbrColors.textTertiary),
  );

  static TextTheme darkTextTheme = TextTheme(
    displayLarge:  displayLg.copyWith(color: ClimbrColors.darkTextPrimary),
    displayMedium: displayMd.copyWith(color: ClimbrColors.darkTextPrimary),
    displaySmall:  h1.copyWith(color: ClimbrColors.darkTextPrimary),
    headlineMedium:h2.copyWith(color: ClimbrColors.darkTextPrimary),
    headlineSmall: h3.copyWith(color: ClimbrColors.darkTextPrimary),
    titleLarge:    bodyLg.copyWith(color: ClimbrColors.darkTextPrimary),
    bodyLarge:     bodyMd.copyWith(color: ClimbrColors.darkTextSecondary),
    bodyMedium:    bodySm.copyWith(color: ClimbrColors.darkTextSecondary),
    labelLarge:    label.copyWith(color: ClimbrColors.darkTextPrimary),
    labelSmall:    caption.copyWith(color: ClimbrColors.darkTextSecondary),
  );
}
