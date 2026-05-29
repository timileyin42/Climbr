import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  static const _accessKey  = 'access_token';
  static const _refreshKey = 'refresh_token';
  static const _roleKey    = 'user_role';

  static Future<void> saveTokens({
    required String access,
    String? refresh,
    required String role,
  }) async {
    await Future.wait([
      _storage.write(key: _accessKey, value: access),
      if (refresh != null) _storage.write(key: _refreshKey, value: refresh),
      _storage.write(key: _roleKey, value: role),
    ]);
  }

  static Future<String?> get accessToken => _storage.read(key: _accessKey);
  static Future<String?> get role         => _storage.read(key: _roleKey);

  static Future<void> clear() async {
    await Future.wait([
      _storage.delete(key: _accessKey),
      _storage.delete(key: _refreshKey),
      _storage.delete(key: _roleKey),
    ]);
  }
}
