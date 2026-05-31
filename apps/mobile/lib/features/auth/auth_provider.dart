import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
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
    } catch (e) {
      state = AuthError('Could not connect. Check your internet connection.');
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
    } catch (e) {
      state = AuthError('Could not connect. Check your internet connection.');
    }
  }

  Future<void> signInWithGoogle() async {
    state = const AuthLoading();
    try {
      // 1. Trigger Google Sign-In flow
      final googleUser = await GoogleSignIn().signIn();
      if (googleUser == null) {
        state = const AuthLoggedOut(); // user cancelled
        return;
      }

      // 2. Get Google auth tokens
      final googleAuth = await googleUser.authentication;

      // 3. Sign into Firebase with Google credential
      final credential = GoogleAuthProvider.credential(
        idToken:     googleAuth.idToken,
        accessToken: googleAuth.accessToken,
      );
      final userCredential =
          await FirebaseAuth.instance.signInWithCredential(credential);

      // 4. Get Firebase ID token
      final firebaseToken = await userCredential.user?.getIdToken();
      if (firebaseToken == null) throw AuthException('Could not obtain Firebase token');

      // 5. Send to our backend
      final auth = await _repo.firebaseSignIn(firebaseToken);
      state = AuthSuccess(auth.user);
    } on AuthException catch (e) {
      state = AuthError(e.message);
    } catch (e) {
      state = AuthError(e.toString());
    }
  }

  Future<void> logout() async {
    await _repo.logout();
    try { await GoogleSignIn().signOut(); } catch (_) {}
    try { await FirebaseAuth.instance.signOut(); } catch (_) {}
    state = const AuthLoggedOut();
  }

  void clearError() {
    if (state is AuthError) state = const AuthLoggedOut();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(ref.read(authRepoProvider)),
);
