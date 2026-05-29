import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../data/models/dashboard_models.dart';
import '../../core/network/api_client.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class DashboardState {
  final DashboardStats? stats;
  final bool    loading;
  final String? error;

  const DashboardState({this.stats, this.loading = true, this.error});

  DashboardState copyWith({DashboardStats? stats, bool? loading, String? error}) =>
      DashboardState(
        stats:   stats   ?? this.stats,
        loading: loading ?? this.loading,
        error:   error,
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class DashboardNotifier extends StateNotifier<DashboardState> {
  DashboardNotifier() : super(const DashboardState()) {
    fetch();
  }

  Future<void> fetch() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final res  = await dio.get('talent/dashboard');
      final stats = DashboardStats.fromJson(res.data as Map<String, dynamic>);
      state = state.copyWith(stats: stats, loading: false);
    } on DioException catch (e) {
      final msg = (e.response?.data as Map?)?['detail']?.toString() ?? 'Failed to load dashboard';
      state = state.copyWith(loading: false, error: msg);
    }
  }
}

final dashboardProvider =
    StateNotifierProvider<DashboardNotifier, DashboardState>(
  (_) => DashboardNotifier(),
);
