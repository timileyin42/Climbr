import 'package:dio/dio.dart';
import '../models/saved_models.dart';
import '../../core/network/api_client.dart';

class SavedRepository {
  // ── Saved jobs ──────────────────────────────────────────────────────────────

  Future<List<SavedJob>> getSavedJobs() async {
    final res  = await dio.get('talent/saved-jobs');
    final list = res.data as List<dynamic>;
    return list.map((e) => SavedJob.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> unsaveJob(int savedJobId) async {
    await dio.delete('talent/saved-jobs/$savedJobId');
  }

  Future<void> resaveJob(int jobId) async {
    try {
      await dio.post('talent/saved-jobs/$jobId');
    } on DioException catch (e) {
      if (e.response?.statusCode != 409) rethrow;
    }
  }

  // ── Saved trainings ─────────────────────────────────────────────────────────

  Future<List<SavedTraining>> getSavedTrainings() async {
    final res  = await dio.get('talent/saved-trainings');
    final data = res.data;
    final list = (data is List) ? data : (data as Map<String, dynamic>)['saved_trainings'] as List<dynamic>;
    return list.map((e) => SavedTraining.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> unsaveTraining(int trainingId) async {
    await dio.delete('talent/saved-trainings/$trainingId');
  }

  // ── Applications ────────────────────────────────────────────────────────────

  Future<({List<ApplicationItem> items, ApplicationStats stats, int total})> getApplications({
    int page = 1, int limit = 20, String? statusFilter,
  }) async {
    final res = await dio.get('talent/applications', queryParameters: {
      'page':  page,
      'limit': limit,
      if (statusFilter != null && statusFilter.isNotEmpty) 'status_filter': statusFilter,
    });
    final data  = res.data as Map<String, dynamic>;
    final items = (data['applications'] as List<dynamic>)
        .map((e) => ApplicationItem.fromJson(e as Map<String, dynamic>))
        .toList();
    final stats = ApplicationStats.fromJson(data['statistics'] as Map<String, dynamic>);
    return (items: items, stats: stats, total: data['total'] as int? ?? items.length);
  }

  Future<void> removeApplication({required int id, required bool isJob}) async {
    if (isJob) {
      await dio.delete('talent/applications/jobs/$id');
    } else {
      await dio.delete('talent/applications/trainings/$id');
    }
  }
}
