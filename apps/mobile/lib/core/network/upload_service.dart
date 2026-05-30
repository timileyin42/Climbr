import 'dart:io';
import 'package:dio/dio.dart';
import 'api_client.dart';

class UploadService {
  /// Upload profile photo — POST /talent/profile/image/upload
  /// Returns the new image URL or null on failure.
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
    } catch (_) { return null; }
  }

  /// Upload CV/resume — POST /talent/profile/resume
  /// Returns the resume URL or null on failure.
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
    } catch (_) { return null; }
  }
}
