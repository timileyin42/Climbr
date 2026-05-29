import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/jobs_models.dart';
import '../../data/repositories/jobs_repository.dart';

enum DeckMode { jobs, trainings }

final jobsRepoProvider = Provider<JobsRepository>((ref) => JobsRepository());

// ── Deck item (union of Job | Training) ───────────────────────────────────────

class DeckItem {
  final Job?      job;
  final Training? training;
  DeckItem.fromJob(Job j) : job = j, training = null;
  DeckItem.fromTraining(Training t) : training = t, job = null;

  bool get isJob => job != null;
  String get title       => job?.title          ?? training?.title       ?? '';
  String get provider    => job?.employerName   ?? training?.trainerName ?? '';
  String get location    => job?.location       ?? training?.location    ?? '';
  String get typeLabel   => job?.formattedType  ?? training?.formattedDelivery ?? '';
  String get salary      => job?.formattedSalary ?? training?.formattedCost ?? '';
  String? get description => job?.description  ?? training?.description;
  String? get highlights  => job?.highlights   ?? training?.highlights;
  String get timeAgo     => job?.timeAgo()      ?? '';
  int get id             => job?.id             ?? training?.id          ?? 0;
}

// ── State ─────────────────────────────────────────────────────────────────────

class DiscoverState {
  final DeckMode    mode;
  final List<DeckItem> deck;
  final bool        loading;
  final bool        empty;
  final String?     error;

  const DiscoverState({
    this.mode    = DeckMode.jobs,
    this.deck    = const [],
    this.loading = true,
    this.empty   = false,
    this.error,
  });

  DiscoverState copyWith({
    DeckMode?      mode,
    List<DeckItem>? deck,
    bool?          loading,
    bool?          empty,
    String?        error,
  }) => DiscoverState(
    mode:    mode    ?? this.mode,
    deck:    deck    ?? this.deck,
    loading: loading ?? this.loading,
    empty:   empty   ?? this.empty,
    error:   error,
  );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class DiscoverNotifier extends StateNotifier<DiscoverState> {
  final JobsRepository _repo;
  DiscoverNotifier(this._repo) : super(const DiscoverState()) {
    fetch();
  }

  Future<void> fetch() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final jobs = await _repo.getJobs(limit: 30);
      final items = jobs.map(DeckItem.fromJob).toList();
      state = state.copyWith(loading: false, deck: items, empty: items.isEmpty);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> fetchTrainings() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final ts = await _repo.getTrainings(limit: 30);
      final items = ts.map(DeckItem.fromTraining).toList();
      state = state.copyWith(loading: false, deck: items, empty: items.isEmpty);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  void switchMode(DeckMode mode) {
    if (state.mode == mode) return;
    state = state.copyWith(mode: mode, deck: [], loading: true);
    if (mode == DeckMode.jobs) {
      fetch();
    } else {
      fetchTrainings();
    }
  }

  /// Removes the top card. [saved] true = swipe right (bookmark).
  Future<void> dismissTop({required bool saved}) async {
    final deck = state.deck;
    if (deck.isEmpty) return;
    final top = deck.first;

    // Optimistically remove from deck
    state = state.copyWith(deck: deck.sublist(1), empty: deck.length <= 1);

    // API call in background
    if (saved && top.isJob) {
      try { await _repo.saveJob(top.id); } catch (_) {}
    }
  }

  void refresh() {
    state = state.copyWith(deck: [], loading: true, empty: false);
    if (state.mode == DeckMode.jobs) {
      fetch();
    } else {
      fetchTrainings();
    }
  }
}

final discoverProvider = StateNotifierProvider<DiscoverNotifier, DiscoverState>(
  (ref) => DiscoverNotifier(ref.read(jobsRepoProvider)),
);
