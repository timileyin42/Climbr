import 'package:dio/dio.dart';
import '../models/profile_models.dart';
import '../../core/network/api_client.dart';

class ProfileException implements Exception {
  final String message;
  const ProfileException(this.message);
  @override
  String toString() => message;
}

class ProfileRepository {
  Future<TalentProfile> getProfile() async {
    try {
      final res = await dio.get('talent/profile');
      return TalentProfile.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ProfileException(_msg(e));
    }
  }

  Future<void> updateBio(String bio) async {
    try {
      await dio.put('talent/profile', data: {'bio': bio});
    } on DioException catch (e) {
      throw ProfileException(_msg(e));
    }
  }

  Future<void> addEducation(EducationRequest req) async {
    try {
      await dio.post('talent/profile/education', data: req.toJson());
    } on DioException catch (e) {
      throw ProfileException(_msg(e));
    }
  }

  Future<void> addCertificate(CertificateRequest req) async {
    try {
      await dio.post('talent/profile/certificates', data: req.toJson());
    } on DioException catch (e) {
      throw ProfileException(_msg(e));
    }
  }

  Future<void> addWorkExperience(WorkExperienceRequest req) async {
    try {
      await dio.post('talent/profile/work-experience', data: req.toJson());
    } on DioException catch (e) {
      throw ProfileException(_msg(e));
    }
  }

  Future<void> addSkill(SkillRequest req) async {
    try {
      await dio.post('talent/profile/skills', data: req.toJson());
    } on DioException catch (e) {
      throw ProfileException(_msg(e));
    }
  }

  Future<void> addHobby(HobbyRequest req) async {
    try {
      await dio.post('talent/profile/hobbies', data: req.toJson());
    } on DioException catch (e) {
      throw ProfileException(_msg(e));
    }
  }

  Future<void> addLanguage(LanguageRequest req) async {
    try {
      await dio.post('talent/profile/languages', data: req.toJson());
    } on DioException catch (e) {
      throw ProfileException(_msg(e));
    }
  }

  String _msg(DioException e) {
    final data = e.response?.data;
    if (data is Map && data['detail'] != null) return data['detail'].toString();
    return e.message ?? 'Something went wrong.';
  }
}
