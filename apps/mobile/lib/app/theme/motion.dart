import 'package:flutter/material.dart';

abstract final class Motion {
  // Durations
  static const fast    = Duration(milliseconds: 120);
  static const normal  = Duration(milliseconds: 240);
  static const medium  = Duration(milliseconds: 320);
  static const slow    = Duration(milliseconds: 500);
  static const splash  = Duration(milliseconds: 1200);

  // Curves
  static const sharp     = Curves.easeInOut;
  static const smooth    = Curves.easeOutCubic;
  static const spring    = Curves.elasticOut;
  static const decelerate = Curves.decelerate;

  // Stagger delay between list items
  static const stagger = Duration(milliseconds: 60);
}
