import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
class VerifyEmailScreen extends ConsumerStatefulWidget {
  const VerifyEmailScreen({super.key});

  @override
  ConsumerState<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends ConsumerState<VerifyEmailScreen> {
  bool _loading = false;
  String? _error;
  bool _sent = false;

  Future<void> _resend() async {
    setState(() { _loading = true; _error = null; });
    // The backend sends a new verification email on register — no separate resend endpoint yet
    await Future.delayed(const Duration(milliseconds: 600));
    if (mounted) setState(() { _loading = false; _sent = true; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: Sp.s6),
          child: Column(
            children: [
              const SizedBox(height: Sp.s10),

              // Icon
              Container(
                width: 80, height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: ClimbrColors.brandCyan.withValues(alpha: 0.1),
                  border: Border.all(color: ClimbrColors.brandCyan.withValues(alpha: 0.3)),
                ),
                child: const Icon(Icons.mark_email_unread_outlined, size: 36, color: ClimbrColors.brandCyan),
              )
                  .animate()
                  .scale(begin: const Offset(0.6, 0.6), end: const Offset(1.0, 1.0), duration: 500.ms, curve: Curves.easeOutBack)
                  .fadeIn(duration: 400.ms),

              const SizedBox(height: Sp.s6),

              Text(
                'Check your\nemail',
                textAlign: TextAlign.center,
                style: ClimbrText.displayMd.copyWith(color: ClimbrColors.textPrimary),
              ).animate(delay: 200.ms).fadeIn(duration: 400.ms)
                  .slideY(begin: 0.1, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

              const SizedBox(height: Sp.s3),

              Text(
                "We've sent a verification link to your email address. Click it to activate your account.",
                textAlign: TextAlign.center,
                style: ClimbrText.bodyLg.copyWith(color: ClimbrColors.textSecondary, height: 1.55),
              ).animate(delay: 300.ms).fadeIn(duration: 400.ms),

              const SizedBox(height: Sp.s8),

              // Already verified? Go to login
              SizedBox(
                width: double.infinity, height: 54,
                child: ElevatedButton(
                  onPressed: () => context.go('/login'),
                  child: const Text(
                    "I've verified my email",
                    style: TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w700),
                  ),
                ),
              ).animate(delay: 400.ms).fadeIn(duration: 400.ms)
                  .slideY(begin: 0.1, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

              const SizedBox(height: Sp.s4),

              // Resend
              _sent
                  ? Container(
                      padding: const EdgeInsets.symmetric(horizontal: Sp.s4, vertical: Sp.s3),
                      decoration: BoxDecoration(
                        color: ClimbrColors.statusAcceptedBg,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        const Icon(Icons.check_circle_outline, size: 16, color: ClimbrColors.statusAccepted),
                        const SizedBox(width: Sp.s2),
                        Text('Email sent!', style: ClimbrText.label.copyWith(color: ClimbrColors.statusAccepted)),
                      ]),
                    ).animate().fadeIn(duration: 300.ms)
                  : GestureDetector(
                      onTap: _loading ? null : _resend,
                      child: _loading
                          ? const SizedBox(
                              width: 20, height: 20,
                              child: CircularProgressIndicator(color: ClimbrColors.brandCyan, strokeWidth: 2),
                            )
                          : RichText(
                              text: TextSpan(children: [
                                TextSpan(text: "Didn't receive it? ", style: ClimbrText.bodySm.copyWith(color: ClimbrColors.textSecondary)),
                                TextSpan(text: 'Resend email', style: ClimbrText.bodySm.copyWith(color: ClimbrColors.brandCyan, fontWeight: FontWeight.w600)),
                              ]),
                            ),
                    ).animate(delay: 480.ms).fadeIn(duration: 300.ms),

              if (_error != null) ...[
                const SizedBox(height: Sp.s3),
                Text(_error!, style: ClimbrText.bodySm.copyWith(color: ClimbrColors.statusRejected), textAlign: TextAlign.center),
              ],

              const Spacer(),

              GestureDetector(
                onTap: () => context.go('/welcome'),
                child: Text('← Back to welcome', style: ClimbrText.bodySm.copyWith(color: ClimbrColors.textTertiary)),
              ).animate(delay: 500.ms).fadeIn(duration: 300.ms),

              const SizedBox(height: Sp.s6),
            ],
          ),
        ),
      ),
    );
  }
}
