import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import 'auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool  _obscure      = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final loading   = authState is AuthLoading;

    // Navigate on success
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
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        ref.read(authProvider.notifier).clearError();
      }
    });

    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: Sp.s6),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: Sp.s6),

              GestureDetector(
                onTap: () => context.go('/welcome'),
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

              Text('Welcome\nback 👋', style: ClimbrText.displayMd.copyWith(color: ClimbrColors.textPrimary))
                  .animate(delay: 100.ms).fadeIn(duration: 400.ms)
                  .slideY(begin: 0.1, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

              const SizedBox(height: Sp.s2),
              Text('Log in to your Climbr account.', style: ClimbrText.bodyLg.copyWith(color: ClimbrColors.textSecondary))
                  .animate(delay: 180.ms).fadeIn(duration: 400.ms),

              const SizedBox(height: Sp.s7),

              _Label('Email'),
              const SizedBox(height: Sp.s2),
              TextField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                enabled: !loading,
                style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
                decoration: const InputDecoration(
                  hintText: 'you@example.com',
                  prefixIcon: Icon(Icons.mail_outline_rounded, size: 18, color: ClimbrColors.textTertiary),
                ),
              ).animate(delay: 250.ms).fadeIn(duration: 400.ms)
                  .slideY(begin: 0.08, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

              const SizedBox(height: Sp.s4),

              _Label('Password'),
              const SizedBox(height: Sp.s2),
              TextField(
                controller: _passwordCtrl,
                obscureText: _obscure,
                textInputAction: TextInputAction.done,
                enabled: !loading,
                onSubmitted: (_) => _submit(),
                style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
                decoration: InputDecoration(
                  hintText: '••••••••',
                  prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18, color: ClimbrColors.textTertiary),
                  suffixIcon: GestureDetector(
                    onTap: () => setState(() => _obscure = !_obscure),
                    child: Icon(
                      _obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      size: 18, color: ClimbrColors.textTertiary,
                    ),
                  ),
                ),
              ).animate(delay: 310.ms).fadeIn(duration: 400.ms)
                  .slideY(begin: 0.08, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

              const SizedBox(height: Sp.s3),

              Align(
                alignment: Alignment.centerRight,
                child: GestureDetector(
                  onTap: () => context.go('/forgot-password'),
                  child: Text('Forgot password?', style: ClimbrText.label.copyWith(color: ClimbrColors.brandCyan)),
                ),
              ).animate(delay: 360.ms).fadeIn(duration: 300.ms),

              const SizedBox(height: Sp.s7),

              SizedBox(
                width: double.infinity, height: 54,
                child: ElevatedButton(
                  onPressed: loading ? null : _submit,
                  child: loading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Log in', style: TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w700)),
                ),
              ).animate(delay: 420.ms).fadeIn(duration: 400.ms)
                  .slideY(begin: 0.1, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

              const SizedBox(height: Sp.s7),

              Center(
                child: GestureDetector(
                  onTap: () => context.go('/signup'),
                  child: RichText(
                    text: TextSpan(children: [
                      TextSpan(text: "Don't have an account? ", style: ClimbrText.bodySm.copyWith(color: ClimbrColors.textSecondary)),
                      TextSpan(text: 'Sign up', style: ClimbrText.bodySm.copyWith(color: ClimbrColors.brandCyan, fontWeight: FontWeight.w600)),
                    ]),
                  ),
                ),
              ).animate(delay: 480.ms).fadeIn(duration: 300.ms),

              const SizedBox(height: Sp.s7),
            ],
          ),
        ),
      ),
    );
  }

  void _submit() {
    final email    = _emailCtrl.text.trim();
    final password = _passwordCtrl.text;
    if (email.isEmpty || password.isEmpty) return;
    ref.read(authProvider.notifier).login(email, password);
  }
}

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);
  @override
  Widget build(BuildContext context) =>
      Text(text, style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary));
}
