import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscure       = true;
  bool _loading       = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: Sp.s6),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: Sp.s6),

              // Back button
              GestureDetector(
                onTap: () => context.go('/welcome'),
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: ClimbrColors.bgPrimary,
                    border: Border.all(color: ClimbrColors.border),
                  ),
                  child: const Icon(
                    Icons.arrow_back_ios_new_rounded,
                    size: 16,
                    color: ClimbrColors.textPrimary,
                  ),
                ),
              )
                  .animate()
                  .fadeIn(duration: 300.ms),

              const SizedBox(height: Sp.s7),

              Text('Welcome\nback 👋', style: ClimbrText.displayMd.copyWith(color: ClimbrColors.textPrimary))
                  .animate(delay: 100.ms)
                  .fadeIn(duration: 400.ms)
                  .slideY(begin: 0.1, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

              const SizedBox(height: Sp.s2),

              Text(
                'Log in to your Climbr account.',
                style: ClimbrText.bodyLg.copyWith(color: ClimbrColors.textSecondary),
              )
                  .animate(delay: 180.ms)
                  .fadeIn(duration: 400.ms),

              const SizedBox(height: Sp.s7),

              // Email
              _FieldLabel('Email'),
              const SizedBox(height: Sp.s2),
              TextField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
                decoration: const InputDecoration(
                  hintText: 'you@example.com',
                  prefixIcon: Icon(Icons.mail_outline_rounded, size: 18, color: ClimbrColors.textTertiary),
                ),
              )
                  .animate(delay: 250.ms)
                  .fadeIn(duration: 400.ms)
                  .slideY(begin: 0.08, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

              const SizedBox(height: Sp.s4),

              // Password
              _FieldLabel('Password'),
              const SizedBox(height: Sp.s2),
              TextField(
                controller: _passwordCtrl,
                obscureText: _obscure,
                textInputAction: TextInputAction.done,
                style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
                decoration: InputDecoration(
                  hintText: '••••••••',
                  prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18, color: ClimbrColors.textTertiary),
                  suffixIcon: GestureDetector(
                    onTap: () => setState(() => _obscure = !_obscure),
                    child: Icon(
                      _obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      size: 18,
                      color: ClimbrColors.textTertiary,
                    ),
                  ),
                ),
              )
                  .animate(delay: 310.ms)
                  .fadeIn(duration: 400.ms)
                  .slideY(begin: 0.08, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

              const SizedBox(height: Sp.s3),

              // Forgot password
              Align(
                alignment: Alignment.centerRight,
                child: GestureDetector(
                  onTap: () {},
                  child: Text(
                    'Forgot password?',
                    style: ClimbrText.label.copyWith(color: ClimbrColors.brandCyan),
                  ),
                ),
              )
                  .animate(delay: 360.ms)
                  .fadeIn(duration: 300.ms),

              const SizedBox(height: Sp.s7),

              // Log in button
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _loading ? null : _handleLogin,
                  child: _loading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Log in', style: TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w700)),
                ),
              )
                  .animate(delay: 420.ms)
                  .fadeIn(duration: 400.ms)
                  .slideY(begin: 0.1, end: 0, duration: 400.ms, curve: Curves.easeOutCubic),

              const SizedBox(height: Sp.s5),

              // Divider
              Row(
                children: [
                  const Expanded(child: Divider(color: ClimbrColors.border)),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: Sp.s3),
                    child: Text('or', style: ClimbrText.bodySm.copyWith(color: ClimbrColors.textTertiary)),
                  ),
                  const Expanded(child: Divider(color: ClimbrColors.border)),
                ],
              )
                  .animate(delay: 480.ms)
                  .fadeIn(duration: 300.ms),

              const SizedBox(height: Sp.s5),

              // Google sign-in
              SizedBox(
                width: double.infinity,
                height: 54,
                child: OutlinedButton(
                  onPressed: _handleGoogleSignIn,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const _GoogleIcon(),
                      const SizedBox(width: Sp.s3),
                      Text(
                        'Continue with Google',
                        style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary),
                      ),
                    ],
                  ),
                ),
              )
                  .animate(delay: 520.ms)
                  .fadeIn(duration: 400.ms),

              const SizedBox(height: Sp.s7),

              // Sign up link
              Center(
                child: GestureDetector(
                  onTap: () => context.go('/signup'),
                  child: RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: "Don't have an account? ",
                          style: ClimbrText.bodySm.copyWith(color: ClimbrColors.textSecondary),
                        ),
                        TextSpan(
                          text: 'Sign up',
                          style: ClimbrText.bodySm.copyWith(
                            color: ClimbrColors.brandCyan,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              )
                  .animate(delay: 560.ms)
                  .fadeIn(duration: 300.ms),

              const SizedBox(height: Sp.s7),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleLogin() async {
    if (_emailCtrl.text.trim().isEmpty || _passwordCtrl.text.isEmpty) return;
    setState(() => _loading = true);
    await Future.delayed(const Duration(milliseconds: 800));
    if (mounted) setState(() => _loading = false);
    // TODO: call auth repository
  }

  void _handleGoogleSignIn() {
    // TODO: call Google Sign-In via firebase_auth + google_sign_in
  }
}

class _FieldLabel extends StatelessWidget {
  final String text;
  const _FieldLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary),
    );
  }
}

class _GoogleIcon extends StatelessWidget {
  const _GoogleIcon();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: 20,
      height: 20,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Text('G', style: TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF4285F4))),
        ],
      ),
    );
  }
}
