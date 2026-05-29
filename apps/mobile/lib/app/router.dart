import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/splash/splash_screen.dart';
import '../features/welcome/welcome_screen.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/signup_screen.dart';
import '../features/auth/verify_email_screen.dart';
import '../features/auth/forgot_password_screen.dart';
import '../features/auth/auth_provider.dart';
import '../features/onboarding/onboarding_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/splash',
  redirect: _authGuard,
  routes: [
    // ── Public ──────────────────────────────────────────────────────────────
    GoRoute(path: '/splash',          builder: (_, __) => const SplashScreen()),
    GoRoute(path: '/welcome',         builder: (_, __) => const WelcomeScreen()),
    GoRoute(path: '/login',           builder: (_, __) => const LoginScreen()),
    GoRoute(path: '/signup',          builder: (_, __) => const SignupScreen()),
    GoRoute(path: '/verify-email',    builder: (_, __) => const VerifyEmailScreen()),
    GoRoute(path: '/forgot-password', builder: (_, __) => const ForgotPasswordScreen()),

    // ── Protected (stubs for Batch 3+) ──────────────────────────────────────
    GoRoute(
      path: '/onboarding',
      builder: (_, __) => const OnboardingScreen(),
    ),
    GoRoute(
      path: '/home',
      builder: (_, __) => const _Placeholder('Home coming soon'),
    ),
  ],
);

// Routes that don't need a token
const _publicRoutes = {'/splash', '/welcome', '/login', '/signup', '/verify-email', '/forgot-password'};

String? _authGuard(BuildContext context, GoRouterState state) {
  // Never block public routes
  if (_publicRoutes.contains(state.matchedLocation)) return null;
  // Everything else eventually checks token — for now just allow through
  return null;
}

// Lightweight placeholder used until a screen is built
class _Placeholder extends StatelessWidget {
  final String label;
  const _Placeholder(this.label);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1A1F),
      body: Center(
        child: Text(
          label,
          style: const TextStyle(fontFamily: 'Inter', color: Colors.white54, fontSize: 16),
        ),
      ),
    );
  }
}

// Provider so widgets can read the router if needed
final routerProvider = Provider<GoRouter>((ref) {
  // Re-evaluate redirect when auth state changes
  ref.listen<AuthState>(authProvider, (_, __) => appRouter.refresh());
  return appRouter;
});
