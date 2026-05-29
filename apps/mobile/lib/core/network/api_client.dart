import 'package:dio/dio.dart';
import '../storage/token_storage.dart';

const _baseUrl = 'https://climbr-api.fastapicloud.dev/';

Dio createDio() {
  final dio = Dio(BaseOptions(
    baseUrl: _baseUrl,
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 30),
    headers: {'Content-Type': 'application/json'},
  ));

  // Auth interceptor — attach Bearer token
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = await TokenStorage.accessToken;
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      handler.next(options);
    },
    onError: (err, handler) {
      handler.next(err);
    },
  ));

  return dio;
}

// Singleton used by repositories
final dio = createDio();
