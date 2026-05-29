import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/jobs_models.dart';
import '../../data/repositories/jobs_repository.dart';

final listingsRepoProvider = Provider<JobsRepository>((_) => JobsRepository());

// ── Job listings ──────────────────────────────────────────────────────────────

class JobsListState {
  final List<Job> jobs;
  final bool      loading;
  final String?   error;
  final int       page;
  final bool      hasMore;

  const JobsListState({
    this.jobs = const [], this.loading = true,
    this.error, this.page = 1, this.hasMore = true,
  });

  JobsListState copyWith({
    List<Job>? jobs, bool? loading, String? error, int? page, bool? hasMore,
  }) => JobsListState(
    jobs:    jobs    ?? this.jobs,
    loading: loading ?? this.loading,
    error:   error,
    page:    page    ?? this.page,
    hasMore: hasMore ?? this.hasMore,
  );
}

class JobsListNotifier extends StateNotifier<JobsListState> {
  final JobsRepository _repo;
  String _search = '', _jobType = '', _location = '';

  JobsListNotifier(this._repo) : super(const JobsListState()) { fetch(); }

  Future<void> fetch({bool reset = true}) async {
    if (reset) state = state.copyWith(loading: true, page: 1, jobs: [], error: null);
    try {
      final jobs = await _repo.getJobs(
        page: reset ? 1 : state.page,
        limit: 20,
        search:  _search.isEmpty  ? null : _search,
        jobType: _jobType.isEmpty  ? null : _jobType,
        location: _location.isEmpty ? null : _location,
      );
      state = state.copyWith(
        jobs:    reset ? jobs : [...state.jobs, ...jobs],
        loading: false,
        page:    (reset ? 1 : state.page) + 1,
        hasMore: jobs.length == 20,
      );
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  void search(String q)    { _search  = q;  fetch(); }
  void filterType(String t){ _jobType = t;  fetch(); }
  void filterLoc(String l) { _location = l; fetch(); }
  void clear()             { _search = _jobType = _location = ''; fetch(); }
}

final jobsListProvider =
    StateNotifierProvider<JobsListNotifier, JobsListState>(
  (ref) => JobsListNotifier(ref.read(listingsRepoProvider)),
);

// ── Job detail ────────────────────────────────────────────────────────────────

class JobDetailState {
  final JobDetail? job;
  final bool       loading;
  final String?    error;
  final bool       applied;
  final bool       saved;

  const JobDetailState({this.job, this.loading = true, this.error, this.applied = false, this.saved = false});

  JobDetailState copyWith({JobDetail? job, bool? loading, String? error, bool? applied, bool? saved}) =>
      JobDetailState(
        job:     job     ?? this.job,
        loading: loading ?? this.loading,
        error:   error,
        applied: applied ?? this.applied,
        saved:   saved   ?? this.saved,
      );
}

class JobDetailNotifier extends StateNotifier<JobDetailState> {
  final JobsRepository _repo;
  final int            _jobId;

  JobDetailNotifier(this._repo, this._jobId) : super(const JobDetailState()) { fetch(); }

  Future<void> fetch() async {
    try {
      final j = await _repo.getJobDetail(_jobId);
      state = state.copyWith(job: j, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<bool> apply({String? coverLetter}) async {
    try {
      await _repo.applyJob(_jobId, coverLetter: coverLetter);
      state = state.copyWith(applied: true);
      return true;
    } catch (_) { return false; }
  }

  Future<void> save() async {
    await _repo.saveJob(_jobId);
    state = state.copyWith(saved: true);
  }
}

final jobDetailProvider =
    StateNotifierProvider.family<JobDetailNotifier, JobDetailState, int>(
  (ref, id) => JobDetailNotifier(ref.read(listingsRepoProvider), id),
);

// ── Training listings ─────────────────────────────────────────────────────────

class TrainingsListState {
  final List<Training> trainings;
  final bool           loading;
  final String?        error;

  const TrainingsListState({this.trainings = const [], this.loading = true, this.error});

  TrainingsListState copyWith({List<Training>? trainings, bool? loading, String? error}) =>
      TrainingsListState(
        trainings: trainings ?? this.trainings,
        loading:   loading   ?? this.loading,
        error:     error,
      );
}

class TrainingsListNotifier extends StateNotifier<TrainingsListState> {
  final JobsRepository _repo;
  TrainingsListNotifier(this._repo) : super(const TrainingsListState()) { fetch(); }

  Future<void> fetch({String? search, String? category, String? deliveryMethod}) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final ts = await _repo.getTrainings(limit: 30, search: search, category: category, deliveryMethod: deliveryMethod);
      state = state.copyWith(trainings: ts, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }
}

final trainingsListProvider =
    StateNotifierProvider<TrainingsListNotifier, TrainingsListState>(
  (ref) => TrainingsListNotifier(ref.read(listingsRepoProvider)),
);

// ── Training detail ───────────────────────────────────────────────────────────

class TrainingDetailState {
  final TrainingDetail? training;
  final bool            loading;
  final String?         error;
  final bool            applied;

  const TrainingDetailState({this.training, this.loading = true, this.error, this.applied = false});

  TrainingDetailState copyWith({TrainingDetail? training, bool? loading, String? error, bool? applied}) =>
      TrainingDetailState(
        training: training ?? this.training,
        loading:  loading  ?? this.loading,
        error:    error,
        applied:  applied  ?? this.applied,
      );
}

class TrainingDetailNotifier extends StateNotifier<TrainingDetailState> {
  final JobsRepository _repo;
  final int            _id;

  TrainingDetailNotifier(this._repo, this._id) : super(const TrainingDetailState()) { fetch(); }

  Future<void> fetch() async {
    try {
      final t = await _repo.getTrainingDetail(_id);
      state = state.copyWith(training: t, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<bool> apply() async {
    try {
      await _repo.applyTraining(_id);
      state = state.copyWith(applied: true);
      return true;
    } catch (_) { return false; }
  }
}

final trainingDetailProvider =
    StateNotifierProvider.family<TrainingDetailNotifier, TrainingDetailState, int>(
  (ref, id) => TrainingDetailNotifier(ref.read(listingsRepoProvider), id),
);
