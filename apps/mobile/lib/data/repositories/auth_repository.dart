import 'package:dio/dio.dart';
import '../models/auth_models.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/token_storage.dart';

class AuthException implements Exception {
  final String message;
  const AuthException(this.message);
  @override
  String toString() => message;
}

class AuthRepository {
  Future<AuthResponse> login(LoginRequest req) async {
    try {
      final res = await dio.post('auth/login', data: req.toJson());
      final auth = AuthResponse.fromJson(res.data as Map<String, dynamic>);
      await TokenStorage.saveTokens(
        access: auth.accessToken,
        role:   auth.user.role,
      );
      return auth;
    } on DioException catch (e) {
      throw AuthException(_extractMessage(e));
    }
  }

  Future<AuthResponse> register(RegisterRequest req) async {
    try {
      final res = await dio.post('auth/register', data: req.toJson());
      final auth = AuthResponse.fromJson(res.data as Map<String, dynamic>);
      await TokenStorage.saveTokens(
        access: auth.accessToken,
        role:   auth.user.role,
      );
      return auth;
    } on DioException catch (e) {
      throw AuthException(_extractMessage(e));
    }
  }

  Future<void> verifyEmail(String token) async {
    try {
      await dio.get('auth/verify-email', queryParameters: {'token': token});
    } on DioException catch (e) {
      throw AuthException(_extractMessage(e));
    }
  }

  Future<void> forgotPassword(String email) async {
    try {
      await dio.post('auth/forgot-password', data: {'email': email});
    } on DioException catch (e) {
      throw AuthException(_extractMessage(e));
    }
  }

  Future<void> resetPassword({required String token, required String newPassword}) async {
    try {
      await dio.post('auth/reset-password', data: {
        'token':        token,
        'new_password': newPassword,
      });
    } on DioException catch (e) {
      throw AuthException(_extractMessage(e));
    }
  }

  /// Sends a Firebase ID token to POST /auth/firebase and returns an AuthResponse.
  Future<AuthResponse> firebaseSignIn(String idToken) async {
    try {
      final res = await dio.post('auth/firebase', data: {
        'id_token':  idToken,
        'user_type': 'talent',
      });
      final auth = AuthResponse.fromJson(res.data as Map<String, dynamic>);
      await TokenStorage.saveTokens(access: auth.accessToken, role: auth.user.role);
      return auth;
    } on DioException catch (e) {
      throw AuthException(_extractMessage(e));
    }
  }

  Future<void> logout() async {
    await TokenStorage.clear();
  }

  String _extractMessage(DioException e) {
    final data = e.response?.data;
    if (data is Map && data['detail'] != null) {
      return data['detail'].toString();
    }
    return e.message ?? 'Something went wrong. Please try again.';
  }
}
