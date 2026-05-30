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
import '../features/home/home_screen.dart';
import '../features/listings/jobs_listing_screen.dart';
import '../features/listings/job_detail_screen.dart';
import '../features/listings/trainings_listing_screen.dart';
import '../features/listings/training_detail_screen.dart';
import '../features/profile_tab/settings_screen.dart';
import '../features/messages_tab/chat_thread_screen.dart';

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
      builder: (_, __) => const HomeScreen(),
    ),

    // ── Listings ─────────────────────────────────────────────────────────────
    GoRoute(path: '/jobs',      builder: (_, __) => const JobsListingScreen()),
    GoRoute(
      path: '/jobs/:id',
      builder: (_, s) => JobDetailScreen(jobId: int.parse(s.pathParameters['id']!)),
    ),
    GoRoute(path: '/trainings', builder: (_, __) => const TrainingsListingScreen()),
    GoRoute(
      path: '/trainings/:id',
      builder: (_, s) => TrainingDetailScreen(trainingId: int.parse(s.pathParameters['id']!)),
    ),

    // ── Profile & Settings ────────────────────────────────────────────────────
    GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),

    // ── Messages ──────────────────────────────────────────────────────────────
    GoRoute(
      path: '/chat/:id',
      builder: (_, s) => ChatThreadScreen(conversationId: int.parse(s.pathParameters['id']!)),
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

// Provider so widgets can read the router if needed
final routerProvider = Provider<GoRouter>((ref) {
  // Re-evaluate redirect when auth state changes
  ref.listen<AuthState>(authProvider, (_, __) => appRouter.refresh());
  return appRouter;
});
