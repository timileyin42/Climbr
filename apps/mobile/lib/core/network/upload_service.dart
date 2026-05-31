import 'dart:io';
import 'package:dio/dio.dart';
import 'api_client.dart';

class UploadService {
  /// Upload profile photo → POST /talent/profile/image/upload
  static Future<String?> uploadProfileImage(File file) async {
    try {
      final form = FormData.fromMap({
        'profile_image': await MultipartFile.fromFile(
          file.path,
          filename: file.path.split('/').last,
        ),
      });
      final res = await dio.post('talent/profile/image/upload', data: form);
      return (res.data as Map<String, dynamic>)['profile_image_url'] as String?;
    } catch (e) {
      print('[Upload] profile image failed: $e');
      return null;
    }
  }

  /// Upload CV/resume → POST /talent/profile/resume
  static Future<String?> uploadResume(File file) async {
    try {
      final form = FormData.fromMap({
        'resume': await MultipartFile.fromFile(
          file.path,
          filename: file.path.split('/').last,
        ),
      });
      final res = await dio.post('talent/profile/resume', data: form);
      return (res.data as Map<String, dynamic>)['resume_url'] as String?;
    } catch (e) {
      print('[Upload] resume failed: $e');
      return null;
    }
  }

  /// Upload certificate file → POST /talent/profile/certificates/:id/upload
  static Future<String?> uploadCertificate(int certId, File file) async {
    try {
      final form = FormData.fromMap({
        'certificate_file': await MultipartFile.fromFile(
          file.path,
          filename: file.path.split('/').last,
        ),
      });
      final res = await dio.post('talent/profile/certificates/$certId/upload', data: form);
      return (res.data as Map<String, dynamic>)['file_url'] as String?;
    } catch (e) {
      print('[Upload] certificate failed: $e');
      return null;
    }
  }
}
