import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/saved_models.dart';
import '../../data/repositories/saved_repository.dart';

final savedRepoProvider = Provider<SavedRepository>((_) => SavedRepository());

// ── Saved jobs ────────────────────────────────────────────────────────────────

class SavedJobsState {
  final List<SavedJob> jobs;
  final bool           loading;
  final String?        error;

  const SavedJobsState({this.jobs = const [], this.loading = true, this.error});

  SavedJobsState copyWith({List<SavedJob>? jobs, bool? loading, String? error}) =>
      SavedJobsState(jobs: jobs ?? this.jobs, loading: loading ?? this.loading, error: error);
}

class SavedJobsNotifier extends StateNotifier<SavedJobsState> {
  final SavedRepository _repo;
  SavedJobsNotifier(this._repo) : super(const SavedJobsState()) { fetch(); }

  Future<void> fetch() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final jobs = await _repo.getSavedJobs();
      state = state.copyWith(jobs: jobs, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  /// Returns the removed SavedJob so the caller can offer Undo.
  SavedJob? optimisticRemove(int savedJobId) {
    final idx = state.jobs.indexWhere((j) => j.id == savedJobId);
    if (idx == -1) return null;
    final removed = state.jobs[idx];
    state = state.copyWith(jobs: [...state.jobs]..removeAt(idx));
    return removed;
  }

  Future<void> unsave(int savedJobId) async {
    try { await _repo.unsaveJob(savedJobId); } catch (_) { fetch(); }
  }

  Future<void> resave(int jobId) async {
    await _repo.resaveJob(jobId);
    await fetch();
  }
}

final savedJobsProvider =
    StateNotifierProvider<SavedJobsNotifier, SavedJobsState>(
  (ref) => SavedJobsNotifier(ref.read(savedRepoProvider)),
);

// ── Saved trainings ───────────────────────────────────────────────────────────

class SavedTrainingsState {
  final List<SavedTraining> trainings;
  final bool                loading;

  const SavedTrainingsState({this.trainings = const [], this.loading = true});

  SavedTrainingsState copyWith({List<SavedTraining>? trainings, bool? loading}) =>
      SavedTrainingsState(trainings: trainings ?? this.trainings, loading: loading ?? this.loading);
}

class SavedTrainingsNotifier extends StateNotifier<SavedTrainingsState> {
  final SavedRepository _repo;
  SavedTrainingsNotifier(this._repo) : super(const SavedTrainingsState()) { fetch(); }

  Future<void> fetch() async {
    state = state.copyWith(loading: true);
    try {
      final ts = await _repo.getSavedTrainings();
      state = state.copyWith(trainings: ts, loading: false);
    } catch (_) {
      state = state.copyWith(loading: false);
    }
  }
}

final savedTrainingsProvider =
    StateNotifierProvider<SavedTrainingsNotifier, SavedTrainingsState>(
  (ref) => SavedTrainingsNotifier(ref.read(savedRepoProvider)),
);
