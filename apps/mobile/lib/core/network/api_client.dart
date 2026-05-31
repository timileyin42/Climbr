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

  // Logger — prints every request/response so we can see what's happening
  dio.interceptors.add(LogInterceptor(
    requestBody:  true,
    responseBody: true,
    requestHeader: false,
    responseHeader: false,
    error: true,
    logPrint: (o) => print('[Dio] $o'),
  ));

  // Auth interceptor — attach Bearer token if present.
  // IMPORTANT: wrapped in try-catch with timeout so a FlutterSecureStorage
  // hang never blocks the request from being sent.
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      try {
        final token = await TokenStorage.accessToken
            .timeout(const Duration(seconds: 2));
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
      } catch (e) {
        // If secure storage hangs or fails, continue without auth header
        print('[Auth] Token read failed: $e — proceeding without token');
      }
      handler.next(options);
    },
    onError: (err, handler) {
      print('[Dio] Error: ${err.message} | ${err.response?.statusCode}');
      handler.next(err);
    },
  ));

  return dio;
}

// Singleton — created lazily on first access
final dio = createDio();
