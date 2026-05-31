import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../app/firebase_options.dart';
import '../../data/models/auth_models.dart';
import '../../data/repositories/auth_repository.dart';
import '../../core/storage/token_storage.dart';

// Native channel that handles Google Sign-In with UIWindowScene VC lookup
const _googleSignInChannel = MethodChannel('com.climbr/google_signin');

// ── Repository provider ────────────────────────────────────────────────────────
final authRepoProvider = Provider<AuthRepository>((ref) => AuthRepository());

// ── Auth state ────────────────────────────────────────────────────────────────

sealed class AuthState {
  const AuthState();
}

class AuthInitial extends AuthState {
  const AuthInitial();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class AuthSuccess extends AuthState {
  final AuthUser user;
  const AuthSuccess(this.user);
}

class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);
}

class AuthLoggedOut extends AuthState {
  const AuthLoggedOut();
}

class _GoogleTokens {
  final String idToken;
  final String? accessToken;

  const _GoogleTokens({
    required this.idToken,
    this.accessToken,
  });
}

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
      final auth =
          await _repo.login(LoginRequest(email: email, password: password));
      state = AuthSuccess(auth.user);
    } on AuthException catch (e) {
      state = AuthError(e.message);
    } catch (e) {
      state =
          const AuthError('Could not connect. Check your internet connection.');
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
        lastName: lastName,
        email: email,
        password: password,
      ));
      state = AuthSuccess(auth.user);
    } on AuthException catch (e) {
      state = AuthError(e.message);
    } catch (e) {
      state =
          const AuthError('Could not connect. Check your internet connection.');
    }
  }

  Future<void> signInWithGoogle() async {
    state = const AuthLoading();
    try {
      final googleTokens = await _getGoogleTokens();
      if (googleTokens == null) {
        state = const AuthLoggedOut(); // user cancelled
        return;
      }

      final credential = GoogleAuthProvider.credential(
        idToken: googleTokens.idToken,
        accessToken: googleTokens.accessToken,
      );
      final userCredential =
          await FirebaseAuth.instance.signInWithCredential(credential);

      // 3. Get Firebase ID token and send to our backend
      final firebaseToken = await userCredential.user?.getIdToken();
      if (firebaseToken == null) {
        throw const AuthException('Could not obtain Firebase token');
      }

      final auth = await _repo.firebaseSignIn(firebaseToken);
      state = AuthSuccess(auth.user);
    } on AuthException catch (e) {
      state = AuthError(e.message);
    } on PlatformException catch (e) {
      if (e.code == 'SIGN_IN_FAILED' && (e.message ?? '').contains('cancel')) {
        state = const AuthLoggedOut();
      } else {
        state = AuthError(e.message ?? 'Google Sign-In failed');
      }
    } catch (e) {
      state = AuthError(e.toString());
    }
  }

  Future<_GoogleTokens?> _getGoogleTokens() async {
    try {
      return await _getNativeGoogleTokens();
    } on MissingPluginException {
      return _getPluginGoogleTokens();
    } on PlatformException catch (e) {
      if (_isGoogleCancel(e)) return null;
      if (e.code == 'NO_VIEW_CONTROLLER' || e.code == 'GOOGLE_CONFIG_MISSING') {
        return _getPluginGoogleTokens();
      }
      rethrow;
    }
  }

  Future<_GoogleTokens?> _getNativeGoogleTokens() async {
    // Native channel finds the UIWindowScene presenting VC correctly on iOS.
    final googleTokens =
        await _googleSignInChannel.invokeMethod<dynamic>('signIn');
    if (googleTokens == null) return null;

    final idToken = switch (googleTokens) {
      final String token => token,
      final Map tokens => tokens['idToken'] as String?,
      _ => null,
    };
    final accessToken =
        googleTokens is Map ? googleTokens['accessToken'] as String? : null;

    if (idToken == null || idToken.isEmpty) {
      throw const AuthException('Google Sign-In returned no ID token');
    }

    return _GoogleTokens(idToken: idToken, accessToken: accessToken);
  }

  Future<_GoogleTokens?> _getPluginGoogleTokens() async {
    final googleUser = await GoogleSignIn(
      clientId: DefaultFirebaseOptions.currentPlatform.iosClientId,
    ).signIn();
    if (googleUser == null) return null;

    final googleAuth = await googleUser.authentication;
    final idToken = googleAuth.idToken;
    if (idToken == null || idToken.isEmpty) {
      throw const AuthException('Google Sign-In returned no ID token');
    }

    return _GoogleTokens(
      idToken: idToken,
      accessToken: googleAuth.accessToken,
    );
  }

  bool _isGoogleCancel(PlatformException e) {
    final message = e.message?.toLowerCase() ?? '';
    return e.code == 'SIGN_IN_CANCELLED' ||
        e.code == 'canceled' ||
        (e.code == 'SIGN_IN_FAILED' && message.contains('cancel'));
  }

  Future<void> logout() async {
    await _repo.logout();
    try {
      await GoogleSignIn().signOut();
    } catch (_) {}
    try {
      await FirebaseAuth.instance.signOut();
    } catch (_) {}
    state = const AuthLoggedOut();
  }

  void clearError() {
    if (state is AuthError) state = const AuthLoggedOut();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(ref.read(authRepoProvider)),
);
