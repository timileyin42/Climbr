import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/saved_models.dart';
import '../../data/repositories/saved_repository.dart';
import '../saved_tab/saved_provider.dart';

class ApplicationsState {
  final List<ApplicationItem> items;
  final ApplicationStats?     stats;
  final bool                  loading;
  final String?               error;
  final String                statusFilter; // '' | 'in_review' | 'shortlisted' | 'rejected'

  const ApplicationsState({
    this.items  = const [],
    this.stats,
    this.loading = true,
    this.error,
    this.statusFilter = '',
  });

  ApplicationsState copyWith({
    List<ApplicationItem>? items,
    ApplicationStats?      stats,
    bool?                  loading,
    String?                error,
    String?                statusFilter,
  }) => ApplicationsState(
    items:        items        ?? this.items,
    stats:        stats        ?? this.stats,
    loading:      loading      ?? this.loading,
    error:        error,
    statusFilter: statusFilter ?? this.statusFilter,
  );
}

class ApplicationsNotifier extends StateNotifier<ApplicationsState> {
  final SavedRepository _repo;
  ApplicationsNotifier(this._repo) : super(const ApplicationsState()) { fetch(); }

  Future<void> fetch({String? filter}) async {
    final f = filter ?? state.statusFilter;
    state = state.copyWith(loading: true, error: null, statusFilter: f);
    try {
      final result = await _repo.getApplications(
        statusFilter: f.isEmpty ? null : f,
      );
      state = state.copyWith(items: result.items, stats: result.stats, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  void setFilter(String f) => fetch(filter: f);

  Future<void> removeApplication(ApplicationItem item) async {
    // Optimistic remove
    state = state.copyWith(items: state.items.where((a) => a.id != item.id).toList());
    try {
      await _repo.removeApplication(id: item.id, isJob: item.isJob);
    } catch (_) {
      await fetch();
    }
  }
}

final applicationsProvider =
    StateNotifierProvider<ApplicationsNotifier, ApplicationsState>(
  (ref) => ApplicationsNotifier(ref.read(savedRepoProvider)),
);
