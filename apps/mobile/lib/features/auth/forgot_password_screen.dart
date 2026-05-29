import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import '../../data/repositories/auth_repository.dart';

final _forgotRepoProvider = Provider<AuthRepository>((ref) => AuthRepository());

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _emailCtrl = TextEditingController();
  bool _loading = false;
  bool _sent    = false;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailCtrl.text.trim();
    if (email.isEmpty) return;
    setState(() { _loading = true; _error = null; });
    try {
      await ref.read(_forgotRepoProvider).forgotPassword(email);
      if (mounted) setState(() { _loading = false; _sent = true; });
    } on AuthException catch (e) {
      if (mounted) setState(() { _loading = false; _error = e.message; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: Sp.s6),
          child: _sent ? _SuccessView() : _FormView(
            emailCtrl: _emailCtrl,
            loading:   _loading,
            error:     _error,
            onSubmit:  _submit,
          ),
        ),
      ),
    );
  }
}

// ── Form view ─────────────────────────────────────────────────────────────────

class _FormView extends StatelessWidget {
  final TextEditingController emailCtrl;
  final bool    loading;
  final String? error;
  final VoidCallback onSubmit;

  const _FormView({
    required this.emailCtrl,
    required this.loading,
    required this.error,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: Sp.s6),

        GestureDetector(
          onTap: () => context.go('/login'),
          child: Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: ClimbrColors.bgPrimary,
              border: Border.all(color: ClimbrColors.border),
            ),
            child: const Icon(Icons.arrow_back_ios_new_rounded, size: 16, color: ClimbrColors.textPrimary),
          ),
        ).animate().fadeIn(duration: 300.ms),

        const SizedBox(height: Sp.s7),

        Text('Forgot\npassword?', style: ClimbrText.displayMd.copyWith(color: ClimbrColors.textPrimary))
            .animate(delay: 100.ms).fadeIn(duration: 400.ms)
            .slideY(begin: 0.1, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

        const SizedBox(height: Sp.s2),
        Text(
          "Enter your email and we'll send you a reset link.",
          style: ClimbrText.bodyLg.copyWith(color: ClimbrColors.textSecondary),
        ).animate(delay: 180.ms).fadeIn(duration: 400.ms),

        const SizedBox(height: Sp.s7),

        Text('Email', style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary)),
        const SizedBox(height: Sp.s2),
        TextField(
          controller: emailCtrl,
          enabled: !loading,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.done,
          onSubmitted: (_) => onSubmit(),
          style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
          decoration: const InputDecoration(
            hintText: 'you@example.com',
            prefixIcon: Icon(Icons.mail_outline_rounded, size: 18, color: ClimbrColors.textTertiary),
          ),
        ).animate(delay: 250.ms).fadeIn(duration: 400.ms)
            .slideY(begin: 0.08, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

        if (error != null) ...[
          const SizedBox(height: Sp.s3),
          Text(error!, style: ClimbrText.bodySm.copyWith(color: ClimbrColors.statusRejected)),
        ],

        const SizedBox(height: Sp.s7),

        SizedBox(
          width: double.infinity, height: 54,
          child: ElevatedButton(
            onPressed: loading ? null : onSubmit,
            child: loading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Send reset link', style: TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w700)),
          ),
        ).animate(delay: 320.ms).fadeIn(duration: 400.ms)
            .slideY(begin: 0.1, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),
      ],
    );
  }
}

// ── Success view ──────────────────────────────────────────────────────────────

class _SuccessView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 80, height: 80,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: ClimbrColors.statusAcceptedBg,
          ),
          child: const Icon(Icons.check_circle_outline, size: 40, color: ClimbrColors.statusAccepted),
        ).animate().scale(begin: const Offset(0.6, 0.6), end: const Offset(1.0, 1.0), duration: 500.ms, curve: Curves.easeOutBack),

        const SizedBox(height: Sp.s6),

        Text(
          'Reset link sent!',
          style: ClimbrText.displayMd.copyWith(color: ClimbrColors.textPrimary),
          textAlign: TextAlign.center,
        ).animate(delay: 200.ms).fadeIn(duration: 400.ms),

        const SizedBox(height: Sp.s3),

        Text(
          'Check your inbox and follow the link to reset your password.',
          style: ClimbrText.bodyLg.copyWith(color: ClimbrColors.textSecondary, height: 1.55),
          textAlign: TextAlign.center,
        ).animate(delay: 300.ms).fadeIn(duration: 400.ms),

        const SizedBox(height: Sp.s8),

        SizedBox(
          width: double.infinity, height: 54,
          child: ElevatedButton(
            onPressed: () => context.go('/login'),
            child: const Text('Back to login', style: TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w700)),
          ),
        ).animate(delay: 400.ms).fadeIn(duration: 400.ms),
      ],
    );
  }
}
