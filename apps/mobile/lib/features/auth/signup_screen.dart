import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import 'auth_provider.dart';

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  final _firstCtrl    = TextEditingController();
  final _lastCtrl     = TextEditingController();
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool  _obscure      = true;

  @override
  void dispose() {
    _firstCtrl.dispose();
    _lastCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final loading   = authState is AuthLoading;

    ref.listen<AuthState>(authProvider, (_, next) {
      if (next is AuthSuccess) {
        // New accounts always need email verification first
        context.go('/verify-email');
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

              Text('Create your\naccount ✨', style: ClimbrText.displayMd.copyWith(color: ClimbrColors.textPrimary))
                  .animate(delay: 100.ms).fadeIn(duration: 400.ms)
                  .slideY(begin: 0.1, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

              const SizedBox(height: Sp.s2),
              Text('Join thousands of African talents on Climbr.', style: ClimbrText.bodyLg.copyWith(color: ClimbrColors.textSecondary))
                  .animate(delay: 180.ms).fadeIn(duration: 400.ms),

              const SizedBox(height: Sp.s7),

              // Name row
              Row(
                children: [
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      _Label('First name'),
                      const SizedBox(height: Sp.s2),
                      TextField(
                        controller: _firstCtrl,
                        enabled: !loading,
                        textCapitalization: TextCapitalization.words,
                        textInputAction: TextInputAction.next,
                        style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
                        decoration: const InputDecoration(hintText: 'Ada'),
                      ),
                    ]),
                  ),
                  const SizedBox(width: Sp.s3),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      _Label('Last name'),
                      const SizedBox(height: Sp.s2),
                      TextField(
                        controller: _lastCtrl,
                        enabled: !loading,
                        textCapitalization: TextCapitalization.words,
                        textInputAction: TextInputAction.next,
                        style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
                        decoration: const InputDecoration(hintText: 'Okonkwo'),
                      ),
                    ]),
                  ),
                ],
              ).animate(delay: 250.ms).fadeIn(duration: 400.ms)
                  .slideY(begin: 0.08, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

              const SizedBox(height: Sp.s4),

              _Label('Email'),
              const SizedBox(height: Sp.s2),
              TextField(
                controller: _emailCtrl,
                enabled: !loading,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
                decoration: const InputDecoration(
                  hintText: 'you@example.com',
                  prefixIcon: Icon(Icons.mail_outline_rounded, size: 18, color: ClimbrColors.textTertiary),
                ),
              ).animate(delay: 310.ms).fadeIn(duration: 400.ms)
                  .slideY(begin: 0.08, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

              const SizedBox(height: Sp.s4),

              _Label('Password'),
              const SizedBox(height: Sp.s2),
              TextField(
                controller: _passwordCtrl,
                obscureText: _obscure,
                enabled: !loading,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _submit(),
                style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
                decoration: InputDecoration(
                  hintText: 'Min. 8 characters',
                  prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18, color: ClimbrColors.textTertiary),
                  suffixIcon: GestureDetector(
                    onTap: () => setState(() => _obscure = !_obscure),
                    child: Icon(
                      _obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      size: 18, color: ClimbrColors.textTertiary,
                    ),
                  ),
                ),
              ).animate(delay: 370.ms).fadeIn(duration: 400.ms)
                  .slideY(begin: 0.08, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

              const SizedBox(height: Sp.s3),

              Text(
                'By signing up you agree to our Terms of Service and Privacy Policy.',
                style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary),
              ).animate(delay: 410.ms).fadeIn(duration: 300.ms),

              const SizedBox(height: Sp.s7),

              SizedBox(
                width: double.infinity, height: 54,
                child: ElevatedButton(
                  onPressed: loading ? null : _submit,
                  child: loading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Create account', style: TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w700)),
                ),
              ).animate(delay: 450.ms).fadeIn(duration: 400.ms)
                  .slideY(begin: 0.1, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

              const SizedBox(height: Sp.s7),

              Center(
                child: GestureDetector(
                  onTap: () => context.go('/login'),
                  child: RichText(
                    text: TextSpan(children: [
                      TextSpan(text: 'Already have an account? ', style: ClimbrText.bodySm.copyWith(color: ClimbrColors.textSecondary)),
                      TextSpan(text: 'Log in', style: ClimbrText.bodySm.copyWith(color: ClimbrColors.brandCyan, fontWeight: FontWeight.w600)),
                    ]),
                  ),
                ),
              ).animate(delay: 490.ms).fadeIn(duration: 300.ms),

              const SizedBox(height: Sp.s7),
            ],
          ),
        ),
      ),
    );
  }

  void _submit() {
    final first    = _firstCtrl.text.trim();
    final last     = _lastCtrl.text.trim();
    final email    = _emailCtrl.text.trim();
    final password = _passwordCtrl.text;
    if (first.isEmpty || last.isEmpty || email.isEmpty || password.length < 8) return;
    ref.read(authProvider.notifier).register(
      firstName: first, lastName: last, email: email, password: password,
    );
  }
}

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);
  @override
  Widget build(BuildContext context) =>
      Text(text, style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary));
}
