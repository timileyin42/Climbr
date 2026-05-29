import 'package:dio/dio.dart';
import '../models/jobs_models.dart';
import '../../core/network/api_client.dart';

class JobsRepository {
  Future<List<Job>> getJobs({
    int page = 1, int limit = 20,
    String? search, String? jobType, String? location,
  }) async {
    final res = await dio.get('jobs', queryParameters: {
      'page': page, 'limit': limit,
      if (search   != null && search.isNotEmpty)   'search':   search,
      if (jobType  != null && jobType.isNotEmpty)  'job_type': jobType,
      if (location != null && location.isNotEmpty) 'location': location,
    });
    final data = res.data as Map<String, dynamic>;
    return (data['jobs'] as List<dynamic>)
        .map((e) => Job.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<JobDetail> getJobDetail(int id) async {
    final res = await dio.get('jobs/$id');
    return JobDetail.fromJson(res.data as Map<String, dynamic>);
  }

  Future<List<Training>> getTrainings({
    int skip = 0, int limit = 20,
    String? search, String? category, String? deliveryMethod,
  }) async {
    final res = await dio.get('trainings', queryParameters: {
      'skip': skip, 'limit': limit,
      if (search         != null && search.isNotEmpty)         'search':          search,
      if (category       != null && category.isNotEmpty)       'category':        category,
      if (deliveryMethod != null && deliveryMethod.isNotEmpty) 'delivery_method': deliveryMethod,
    });
    final data = res.data as Map<String, dynamic>;
    return (data['trainings'] as List<dynamic>)
        .map((e) => Training.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<TrainingDetail> getTrainingDetail(int id) async {
    final res = await dio.get('trainings/$id');
    return TrainingDetail.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> saveJob(int jobId) async {
    try {
      await dio.post('talent/jobs/$jobId/save');
    } on DioException catch (e) {
      if (e.response?.statusCode != 409) rethrow;
    }
  }

  Future<void> applyJob(int jobId, {String? coverLetter}) async {
    await dio.post(
      'talent/jobs/$jobId/apply',
      data: coverLetter != null ? {'cover_letter': coverLetter} : null,
    );
  }

  Future<void> applyTraining(int trainingId) async {
    await dio.post('talent/trainings/$trainingId/apply');
  }
}
