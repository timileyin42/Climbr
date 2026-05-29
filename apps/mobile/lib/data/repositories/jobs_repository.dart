import 'package:dio/dio.dart';
import '../models/jobs_models.dart';
import '../../core/network/api_client.dart';

class JobsRepository {
  Future<List<Job>> getJobs({int page = 1, int limit = 20}) async {
    final res = await dio.get('jobs', queryParameters: {'page': page, 'limit': limit});
    final data = res.data as Map<String, dynamic>;
    return (data['jobs'] as List<dynamic>)
        .map((e) => Job.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<Training>> getTrainings({int skip = 0, int limit = 20}) async {
    final res = await dio.get('trainings', queryParameters: {'skip': skip, 'limit': limit});
    final data = res.data as Map<String, dynamic>;
    return (data['trainings'] as List<dynamic>)
        .map((e) => Training.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> saveJob(int jobId) async {
    try {
      await dio.post('talent/jobs/$jobId/save');
    } on DioException catch (e) {
      // 409 = already saved — not an error
      if (e.response?.statusCode != 409) rethrow;
    }
  }

  Future<void> applyJob(int jobId) async {
    await dio.post('talent/jobs/$jobId/apply');
  }
}
