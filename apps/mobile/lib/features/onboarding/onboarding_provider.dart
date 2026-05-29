import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/profile_models.dart';
import '../../data/repositories/profile_repository.dart';

final profileRepoProvider = Provider<ProfileRepository>((ref) => ProfileRepository());

// ── State ─────────────────────────────────────────────────────────────────────

class OnboardingState {
  final int     step;         // 0-based, 0..7
  final bool    loading;
  final bool    checking;     // fetching profile to check auto-skip
  final String? error;
  final bool    done;

  const OnboardingState({
    this.step     = 0,
    this.loading  = false,
    this.checking = true,
    this.error,
    this.done     = false,
  });

  OnboardingState copyWith({
    int?    step,
    bool?   loading,
    bool?   checking,
    String? error,
    bool?   done,
  }) => OnboardingState(
    step:     step     ?? this.step,
    loading:  loading  ?? this.loading,
    checking: checking ?? this.checking,
    error:    error,          // null clears it
    done:     done     ?? this.done,
  );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class OnboardingNotifier extends StateNotifier<OnboardingState> {
  final ProfileRepository _repo;
  static const int totalSteps = 8;

  OnboardingNotifier(this._repo) : super(const OnboardingState()) {
    _checkAutoSkip();
  }

  Future<void> _checkAutoSkip() async {
    try {
      final profile = await _repo.getProfile();
      if (profile.hasBio) {
        // Already set up — skip entire onboarding
        state = state.copyWith(checking: false, done: true);
      } else {
        state = state.copyWith(checking: false);
      }
    } catch (_) {
      // If profile fetch fails, show onboarding anyway
      state = state.copyWith(checking: false);
    }
  }

  void skipStep() {
    if (state.step < totalSteps - 1) {
      state = state.copyWith(step: state.step + 1, error: null);
    } else {
      state = state.copyWith(done: true);
    }
  }

  Future<void> saveBio(String bio) async {
    if (bio.trim().isEmpty) { skipStep(); return; }
    state = state.copyWith(loading: true, error: null);
    try {
      await _repo.updateBio(bio.trim());
      state = state.copyWith(loading: false, step: 1);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> saveEducation({
    required String institution,
    required String degree,
    required String field,
    required String startYear,
    String? endYear,
  }) async {
    state = state.copyWith(loading: true, error: null);
    try {
      await _repo.addEducation(EducationRequest(
        institution: institution,
        degree: degree,
        fieldOfStudy: field,
        startYear: startYear,
        endYear: endYear,
      ));
      state = state.copyWith(loading: false, step: 2);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  // Step 3 — Resume upload requires file_picker (Batch 10)
  // For now skip moves to step 3
  void proceedFromResume() => state = state.copyWith(step: 3);

  Future<void> saveCertificate({
    required String name,
    required String issuer,
  }) async {
    state = state.copyWith(loading: true, error: null);
    try {
      await _repo.addCertificate(CertificateRequest(
        name: name, issuingOrganization: issuer,
      ));
      state = state.copyWith(loading: false, step: 4);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> saveWorkExperience({
    required String company,
    required String role,
    required String startDate,
    String? endDate,
    String? description,
    bool isCurrent = false,
  }) async {
    state = state.copyWith(loading: true, error: null);
    try {
      await _repo.addWorkExperience(WorkExperienceRequest(
        company: company,
        role: role,
        startDate: startDate,
        endDate: isCurrent ? null : endDate,
        description: description,
        isCurrent: isCurrent,
      ));
      state = state.copyWith(loading: false, step: 5);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> saveSkills(List<String> names) async {
    state = state.copyWith(loading: true, error: null);
    try {
      for (final name in names) {
        if (name.trim().isNotEmpty) {
          await _repo.addSkill(SkillRequest(name: name.trim()));
        }
      }
      state = state.copyWith(loading: false, step: 6);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> saveHobbies(List<String> names) async {
    state = state.copyWith(loading: true, error: null);
    try {
      for (final name in names) {
        if (name.trim().isNotEmpty) {
          await _repo.addHobby(HobbyRequest(name: name.trim()));
        }
      }
      state = state.copyWith(loading: false, step: 7);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> saveLanguage({required String name, required String proficiency}) async {
    state = state.copyWith(loading: true, error: null);
    try {
      await _repo.addLanguage(LanguageRequest(name: name, proficiency: proficiency));
      state = state.copyWith(loading: false, done: true);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  void clearError() => state = state.copyWith(error: null);
}

final onboardingProvider =
    StateNotifierProvider<OnboardingNotifier, OnboardingState>(
  (ref) => OnboardingNotifier(ref.read(profileRepoProvider)),
);
