import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import '../auth/auth_provider.dart';

class WelcomeScreen extends ConsumerStatefulWidget {
  const WelcomeScreen({super.key});

  @override
  ConsumerState<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends ConsumerState<WelcomeScreen>
    with TickerProviderStateMixin {
  late final AnimationController _floatCtrl;
  late final AnimationController _rotateCtrl;

  @override
  void initState() {
    super.initState();
    _floatCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3600),
    )..repeat(reverse: true);
    _rotateCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();
  }

  @override
  void dispose() {
    _floatCtrl.dispose();
    _rotateCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);

    // Navigate on Google sign-in success
    ref.listen<AuthState>(authProvider, (_, next) {
      if (next is AuthSuccess) {
        if (!next.user.isVerified) {
          context.go('/verify-email');
        } else if (!next.user.profileComplete) {
          context.go('/onboarding');
        } else {
          context.go('/home');
        }
      }
      if (next is AuthError) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.message),
            backgroundColor: ClimbrColors.statusRejected,
            behavior: SnackBarBehavior.floating,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        ref.read(authProvider.notifier).clearError();
      }
    });

    return Scaffold(
      backgroundColor: ClimbrColors.brandNavy,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // ── Abstract background shapes ─────────────────────────────────
          AnimatedBuilder(
            animation: _rotateCtrl,
            builder: (_, __) => CustomPaint(
              painter: _WelcomeBgPainter(_rotateCtrl.value, _floatCtrl.value),
            ),
          ),

          // ── Floating accent orbs ───────────────────────────────────────
          AnimatedBuilder(
            animation: _floatCtrl,
            builder: (_, __) {
              final dy = math.sin(_floatCtrl.value * math.pi) * 12;
              return Stack(
                children: [
                  // Top-right orb (cyan)
                  Positioned(
                    top: size.height * 0.08 + dy,
                    right: -30,
                    child: const _Orb(
                      size: 140,
                      color: ClimbrColors.brandCyan,
                      opacity: 0.13,
                    ),
                  ),
                  // Bottom-left orb (pink)
                  Positioned(
                    bottom: size.height * 0.22 - dy,
                    left: -40,
                    child: const _Orb(
                      size: 160,
                      color: ClimbrColors.brandPink,
                      opacity: 0.10,
                    ),
                  ),
                  // Mid-right (orange)
                  Positioned(
                    top: size.height * 0.38 + dy * 0.5,
                    right: size.width * 0.05,
                    child: const _Orb(
                      size: 60,
                      color: ClimbrColors.brandOrange,
                      opacity: 0.20,
                    ),
                  ),
                ],
              );
            },
          ),

          // ── Content ────────────────────────────────────────────────────
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: Sp.s6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: Sp.s6),

                  // Wordmark
                  Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: ClimbrColors.brandCyan,
                            width: 1.5,
                          ),
                        ),
                        child: const Center(
                          child: Text(
                            'C',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: ClimbrColors.brandCyan,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: Sp.s2),
                      const Text(
                        'climbr',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: -0.3,
                        ),
                      ),
                    ],
                  ).animate().fadeIn(duration: 500.ms).slideX(
                      begin: -0.1,
                      end: 0,
                      duration: 500.ms,
                      curve: Curves.easeOutCubic),

                  const Spacer(flex: 2),

                  // Pill tag
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: Sp.s3,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(Radii.pill),
                      color: ClimbrColors.brandCyan.withValues(alpha: 0.12),
                      border: Border.all(
                        color: ClimbrColors.brandCyan.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: ClimbrColors.brandCyan,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'For African talent',
                          style: ClimbrText.caption.copyWith(
                            color: ClimbrColors.brandCyan,
                            letterSpacing: 0.3,
                          ),
                        ),
                      ],
                    ),
                  ).animate(delay: 200.ms).fadeIn(duration: 400.ms).slideY(
                      begin: 0.15,
                      end: 0,
                      duration: 400.ms,
                      curve: Curves.easeOutCubic),

                  const SizedBox(height: Sp.s4),

                  // Main headline
                  Text(
                    'Your future\nstarts here.',
                    style: ClimbrText.displayLg.copyWith(
                      color: Colors.white,
                      letterSpacing: -1.5,
                      height: 1.05,
                    ),
                  ).animate(delay: 350.ms).fadeIn(duration: 500.ms).slideY(
                      begin: 0.12,
                      end: 0,
                      duration: 500.ms,
                      curve: Curves.easeOutCubic),

                  const SizedBox(height: Sp.s4),

                  // Subtitle
                  Text(
                    'Discover jobs, training programmes,\nand mentors built for your career.',
                    style: ClimbrText.bodyLg.copyWith(
                      color: Colors.white.withValues(alpha: 0.55),
                      height: 1.55,
                    ),
                  ).animate(delay: 500.ms).fadeIn(duration: 500.ms).slideY(
                      begin: 0.12,
                      end: 0,
                      duration: 500.ms,
                      curve: Curves.easeOutCubic),

                  const Spacer(flex: 3),

                  // Pillars row
                  _PillarsRow()
                      .animate(delay: 600.ms)
                      .fadeIn(duration: 500.ms)
                      .slideY(
                          begin: 0.1,
                          end: 0,
                          duration: 500.ms,
                          curve: Curves.easeOutCubic),

                  const SizedBox(height: Sp.s7),

                  // CTA buttons
                  _CTAButtons()
                      .animate(delay: 750.ms)
                      .fadeIn(duration: 500.ms)
                      .slideY(
                          begin: 0.1,
                          end: 0,
                          duration: 500.ms,
                          curve: Curves.easeOutCubic),

                  const SizedBox(height: Sp.s5),

                  // Log in link
                  Center(
                    child: GestureDetector(
                      onTap: () => context.go('/login'),
                      child: RichText(
                        text: TextSpan(
                          children: [
                            TextSpan(
                              text: 'Already have an account? ',
                              style: ClimbrText.bodySm.copyWith(
                                color: Colors.white.withValues(alpha: 0.45),
                              ),
                            ),
                            TextSpan(
                              text: 'Log in',
                              style: ClimbrText.bodySm.copyWith(
                                color: ClimbrColors.brandCyan,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ).animate(delay: 850.ms).fadeIn(duration: 400.ms),

                  const SizedBox(height: Sp.s7),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Background painter ─────────────────────────────────────────────────────────

class _WelcomeBgPainter extends CustomPainter {
  final double rotate;
  final double float;
  _WelcomeBgPainter(this.rotate, this.float);

  @override
  void paint(Canvas canvas, Size size) {
    // Large cyan arc — top right
    final arcPaint = Paint()
      ..color = ClimbrColors.brandCyan.withValues(alpha: 0.06)
      ..style = PaintingStyle.fill;

    final path = Path()
      ..moveTo(size.width * 0.4, 0)
      ..quadraticBezierTo(
        size.width * 1.3,
        size.height * 0.05,
        size.width * 1.1,
        size.height * 0.45,
      )
      ..quadraticBezierTo(
        size.width * 0.9,
        size.height * 0.55,
        size.width * 0.5,
        size.height * 0.3,
      )
      ..close();
    canvas.drawPath(path, arcPaint);

    // Subtle grid dots
    final dotPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.03)
      ..style = PaintingStyle.fill;

    const spacing = 32.0;
    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), 1.2, dotPaint);
      }
    }

    // Slow-rotating subtle ring — bottom area
    canvas.save();
    canvas.translate(size.width * 0.5, size.height * 0.78);
    canvas.rotate(rotate * 2 * math.pi);
    final ringPaint = Paint()
      ..color = ClimbrColors.brandCyan.withValues(alpha: 0.05)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    canvas.drawCircle(Offset.zero, size.width * 0.42, ringPaint);
    canvas.drawCircle(Offset.zero, size.width * 0.55, ringPaint);
    canvas.restore();
  }

  @override
  bool shouldRepaint(_WelcomeBgPainter o) =>
      o.rotate != rotate || o.float != float;
}

// ── Orb widget ────────────────────────────────────────────────────────────────

class _Orb extends StatelessWidget {
  final double size;
  final Color color;
  final double opacity;

  const _Orb({required this.size, required this.color, required this.opacity});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withValues(alpha: opacity),
      ),
    );
  }
}

// ── Pillars row ───────────────────────────────────────────────────────────────

class _PillarsRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const pillars = [
      ('Real', ClimbrColors.brandCyan),
      ('Relevant', ClimbrColors.brandOrange),
      ('Future-focused', ClimbrColors.brandPink),
    ];

    return Row(
      children: pillars.map((p) {
        return Padding(
          padding: const EdgeInsets.only(right: Sp.s2),
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: Sp.s3,
              vertical: 7,
            ),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(Radii.pill),
              color: p.$2.withValues(alpha: 0.1),
              border: Border.all(
                color: p.$2.withValues(alpha: 0.25),
              ),
            ),
            child: Text(
              p.$1,
              style: ClimbrText.caption.copyWith(
                color: p.$2,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

// ── CTA buttons ───────────────────────────────────────────────────────────────

class _CTAButtons extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final loading = ref.watch(authProvider) is AuthLoading;

    return Column(
      children: [
        // Primary — Get started (cyan)
        SizedBox(
          width: double.infinity,
          height: 54,
          child: ElevatedButton(
            onPressed: () => context.go('/signup'),
            style: ElevatedButton.styleFrom(
              backgroundColor: ClimbrColors.brandCyan,
              foregroundColor: Colors.white,
              shape: const StadiumBorder(),
              elevation: 0,
            ).copyWith(
              overlayColor: WidgetStateProperty.all(
                Colors.white.withValues(alpha: 0.1),
              ),
            ),
            child: const Text(
              'Get started — it\'s free',
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),

        const SizedBox(height: Sp.s3),

        // Secondary — Continue with Google
        SizedBox(
          width: double.infinity,
          height: 54,
          child: OutlinedButton(
            onPressed: loading
                ? null
                : () => ref.read(authProvider.notifier).signInWithGoogle(),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white,
              shape: const StadiumBorder(),
              side: BorderSide(
                color: Colors.white.withValues(alpha: 0.18),
              ),
            ),
            child: loading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _GoogleLogo(),
                      const SizedBox(width: Sp.s2),
                      const Text(
                        'Continue with Google',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ],
    );
  }
}

// ── Google logo SVG-ish ───────────────────────────────────────────────────────

class _GoogleLogo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 20,
      height: 20,
      child: CustomPaint(painter: _GoogleLogoPainter()),
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final c = Offset(size.width / 2, size.height / 2);
    final r = size.width / 2;

    void arc(double startAngle, double sweepAngle, Color color) {
      canvas.drawArc(
        Rect.fromCircle(center: c, radius: r),
        startAngle,
        sweepAngle,
        false,
        Paint()
          ..color = color
          ..style = PaintingStyle.stroke
          ..strokeWidth = size.width * 0.22
          ..strokeCap = StrokeCap.round,
      );
    }

    arc(-math.pi / 6, math.pi * 2 / 3, const Color(0xFF4285F4)); // blue
    arc(math.pi / 2, math.pi * 2 / 3, const Color(0xFF34A853)); // green
    arc(math.pi * 7 / 6, math.pi * 2 / 3, const Color(0xFFEA4335)); // red
  }

  @override
  bool shouldRepaint(_) => false;
}
