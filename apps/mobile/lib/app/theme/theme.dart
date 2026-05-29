import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'colors.dart';
import 'typography.dart';

ThemeData climbrLight() => ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: ClimbrColors.brandCyan,
    primary:   ClimbrColors.brandCyan,
    surface:   ClimbrColors.bgPrimary,
    onSurface: ClimbrColors.textPrimary,
  ),
  scaffoldBackgroundColor: ClimbrColors.bgSecondary,
  textTheme: ClimbrText.lightTextTheme,
  appBarTheme: const AppBarTheme(
    backgroundColor: ClimbrColors.bgPrimary,
    elevation: 0,
    scrolledUnderElevation: 0,
    systemOverlayStyle: SystemUiOverlayStyle.dark,
    titleTextStyle: TextStyle(
      fontFamily: 'Inter',
      fontSize: 18,
      fontWeight: FontWeight.w600,
      color: ClimbrColors.textPrimary,
    ),
    iconTheme: IconThemeData(color: ClimbrColors.textPrimary),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: ClimbrColors.brandCyan,
      foregroundColor: Colors.white,
      minimumSize: const Size(double.infinity, 52),
      shape: const StadiumBorder(),
      textStyle: ClimbrText.label,
      elevation: 0,
    ),
  ),
  outlinedButtonTheme: OutlinedButtonThemeData(
    style: OutlinedButton.styleFrom(
      foregroundColor: ClimbrColors.textPrimary,
      minimumSize: const Size(double.infinity, 52),
      shape: const StadiumBorder(),
      side: const BorderSide(color: ClimbrColors.border),
      textStyle: ClimbrText.label,
    ),
  ),
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: ClimbrColors.bgPrimary,
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: ClimbrColors.border),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: ClimbrColors.border),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: ClimbrColors.brandCyan, width: 1.5),
    ),
    hintStyle: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textTertiary),
    labelStyle: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary),
  ),
);

ThemeData climbrDark() => ThemeData(
  useMaterial3: true,
  brightness: Brightness.dark,
  colorScheme: ColorScheme.fromSeed(
    seedColor: ClimbrColors.brandCyan,
    brightness: Brightness.dark,
    primary: ClimbrColors.brandCyan,
    surface: ClimbrColors.darkBgPrimary,
    onSurface: ClimbrColors.darkTextPrimary,
  ),
  scaffoldBackgroundColor: ClimbrColors.darkBgPrimary,
  textTheme: ClimbrText.darkTextTheme,
  appBarTheme: const AppBarTheme(
    backgroundColor: ClimbrColors.darkBgPrimary,
    elevation: 0,
    scrolledUnderElevation: 0,
    systemOverlayStyle: SystemUiOverlayStyle.light,
    titleTextStyle: TextStyle(
      fontFamily: 'Inter',
      fontSize: 18,
      fontWeight: FontWeight.w600,
      color: ClimbrColors.darkTextPrimary,
    ),
    iconTheme: IconThemeData(color: ClimbrColors.darkTextPrimary),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: ClimbrColors.brandCyan,
      foregroundColor: Colors.white,
      minimumSize: const Size(double.infinity, 52),
      shape: const StadiumBorder(),
      textStyle: ClimbrText.label,
      elevation: 0,
    ),
  ),
  outlinedButtonTheme: OutlinedButtonThemeData(
    style: OutlinedButton.styleFrom(
      foregroundColor: ClimbrColors.darkTextPrimary,
      minimumSize: const Size(double.infinity, 52),
      shape: const StadiumBorder(),
      side: const BorderSide(color: ClimbrColors.darkBorder),
      textStyle: ClimbrText.label,
    ),
  ),
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: ClimbrColors.darkBgSecondary,
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: ClimbrColors.darkBorder),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: ClimbrColors.darkBorder),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: ClimbrColors.brandCyan, width: 1.5),
    ),
    hintStyle: ClimbrText.bodyMd.copyWith(color: ClimbrColors.darkTextSecondary),
    labelStyle: ClimbrText.label.copyWith(color: ClimbrColors.darkTextPrimary),
  ),
);
