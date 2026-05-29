import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/auth_models.dart';
import '../../data/repositories/auth_repository.dart';
import '../../core/storage/token_storage.dart';

// ── Repository provider ────────────────────────────────────────────────────────
final authRepoProvider = Provider<AuthRepository>((ref) => AuthRepository());

// ── Auth state ────────────────────────────────────────────────────────────────

sealed class AuthState {
  const AuthState();
}
class AuthInitial   extends AuthState { const AuthInitial(); }
class AuthLoading   extends AuthState { const AuthLoading(); }
class AuthSuccess   extends AuthState {
  final AuthUser user;
  const AuthSuccess(this.user);
}
class AuthError     extends AuthState {
  final String message;
  const AuthError(this.message);
}
class AuthLoggedOut extends AuthState { const AuthLoggedOut(); }

// ── Notifier ──────────────────────────────────────────────────────────────────

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repo;

  AuthNotifier(this._repo) : super(const AuthInitial()) {
    _checkExistingSession();
  }

  Future<void> _checkExistingSession() async {
    final token = await TokenStorage.accessToken;
    if (token == null) {
      state = const AuthLoggedOut();
    }
    // Token exists — leave as AuthInitial; router will decide next screen
    // In Batch 3 we'll fetch the current user profile here
  }

  Future<void> login(String email, String password) async {
    state = const AuthLoading();
    try {
      final auth = await _repo.login(LoginRequest(email: email, password: password));
      state = AuthSuccess(auth.user);
    } on AuthException catch (e) {
      state = AuthError(e.message);
    }
  }

  Future<void> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    state = const AuthLoading();
    try {
      final auth = await _repo.register(RegisterRequest(
        firstName: firstName,
        lastName:  lastName,
        email:     email,
        password:  password,
      ));
      state = AuthSuccess(auth.user);
    } on AuthException catch (e) {
      state = AuthError(e.message);
    }
  }

  Future<void> logout() async {
    await _repo.logout();
    state = const AuthLoggedOut();
  }

  void clearError() {
    if (state is AuthError) state = const AuthLoggedOut();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(ref.read(authRepoProvider)),
);
