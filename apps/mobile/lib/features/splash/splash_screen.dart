import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _glowCtrl;

  @override
  void initState() {
    super.initState();
    _glowCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);

    // Navigate to welcome after splash completes (~2.4 s total)
    Future.delayed(const Duration(milliseconds: 2600), () {
      if (mounted) context.go('/welcome');
    });
  }

  @override
  void dispose() {
    _glowCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClimbrColors.brandNavy,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // ── Ambient glow ─────────────────────────────────────────────────
          AnimatedBuilder(
            animation: _glowCtrl,
            builder: (_, __) => CustomPaint(
              painter: _GlowPainter(_glowCtrl.value),
            ),
          ),

          // ── Wordmark ─────────────────────────────────────────────────────
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // "C" monogram — large, glowing
                _ClimbrMonogram()
                    .animate()
                    .scale(
                      begin: const Offset(0.6, 0.6),
                      end: const Offset(1.0, 1.0),
                      duration: 700.ms,
                      curve: Curves.easeOutBack,
                    )
                    .fadeIn(duration: 500.ms),

                const SizedBox(height: 20),

                // Wordmark "climbr"
                _WordmarkText()
                    .animate(delay: 400.ms)
                    .fadeIn(duration: 500.ms)
                    .slideY(begin: 0.2, end: 0, duration: 500.ms, curve: Curves.easeOutCubic),

                const SizedBox(height: 12),

                // Tagline
                Text(
                  'Your future starts here.',
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                    color: Colors.white,
                    letterSpacing: 0.2,
                  ).copyWith(color: Colors.white.withValues(alpha:0.5)),
                )
                    .animate(delay: 700.ms)
                    .fadeIn(duration: 400.ms),
              ],
            ),
          ),

          // ── Bottom loader dots ────────────────────────────────────────────
          Positioned(
            bottom: 60,
            left: 0,
            right: 0,
            child: _LoadingDots()
                .animate(delay: 900.ms)
                .fadeIn(duration: 300.ms),
          ),
        ],
      ),
    );
  }
}

// ── Ambient glow background ────────────────────────────────────────────────────

class _GlowPainter extends CustomPainter {
  final double t;
  _GlowPainter(this.t);

  @override
  void paint(Canvas canvas, Size size) {
    final opacity = 0.12 + t * 0.06;
    final radius  = size.width * (0.55 + t * 0.1);

    canvas.drawCircle(
      Offset(size.width / 2, size.height / 2),
      radius,
      Paint()
        ..shader = RadialGradient(
          colors: [
            ClimbrColors.brandCyan.withValues(alpha:opacity),
            Colors.transparent,
          ],
        ).createShader(Rect.fromCircle(
          center: Offset(size.width / 2, size.height / 2),
          radius: radius,
        )),
    );

    // Secondary accent — pink top-right
    canvas.drawCircle(
      Offset(size.width * 0.85, size.height * 0.15),
      size.width * (0.2 + t * 0.05),
      Paint()
        ..shader = RadialGradient(
          colors: [
            ClimbrColors.brandPink.withValues(alpha:0.07 + t * 0.03),
            Colors.transparent,
          ],
        ).createShader(Rect.fromCircle(
          center: Offset(size.width * 0.85, size.height * 0.15),
          radius: size.width * 0.25,
        )),
    );
  }

  @override
  bool shouldRepaint(_GlowPainter o) => o.t != t;
}

// ── "C" monogram ──────────────────────────────────────────────────────────────

class _ClimbrMonogram extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: ClimbrColors.brandCyan, width: 1.5),
        color: ClimbrColors.brandCyan.withValues(alpha:0.08),
        boxShadow: [
          BoxShadow(
            color: ClimbrColors.brandCyan.withValues(alpha:0.35),
            blurRadius: 32,
            spreadRadius: 4,
          ),
        ],
      ),
      child: const Center(
        child: Text(
          'C',
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 38,
            fontWeight: FontWeight.w800,
            color: ClimbrColors.brandCyan,
            height: 1,
          ),
        ),
      ),
    );
  }
}

// ── Wordmark ──────────────────────────────────────────────────────────────────

class _WordmarkText extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return RichText(
      text: const TextSpan(
        children: [
          TextSpan(
            text: 'climbr',
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 32,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Loading dots ──────────────────────────────────────────────────────────────

class _LoadingDots extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(3, (i) {
        return Container(
          width: 5,
          height: 5,
          margin: const EdgeInsets.symmetric(horizontal: 3),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: ClimbrColors.brandCyan.withValues(alpha:0.5),
          ),
        )
            .animate(
              onPlay: (c) => c.repeat(reverse: true),
              delay: Duration(milliseconds: i * 180),
            )
            .scaleXY(
              begin: 0.5,
              end: 1.0,
              duration: 500.ms,
              curve: Curves.easeInOut,
            )
            .fadeIn(duration: 300.ms);
      }),
    );
  }
}
