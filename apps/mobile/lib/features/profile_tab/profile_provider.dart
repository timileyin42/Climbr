import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/profile_view_models.dart';
import '../../core/network/api_client.dart';

// ── Repository ────────────────────────────────────────────────────────────────

class ProfileViewRepository {
  Future<FullProfile> getFullProfile() async {
    final res = await dio.get('talent/profile');
    return FullProfile.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> updateName({required String firstName, required String lastName}) async {
    await dio.put('talent/profile', data: {'first_name': firstName, 'last_name': lastName});
  }

  Future<void> updateBio(String bio) async {
    await dio.put('talent/profile', data: {'bio': bio});
  }

  Future<void> changePassword({required String current, required String newPw}) async {
    await dio.put('talent/profile/change-password', data: {
      'current_password': current,
      'new_password':     newPw,
    });
  }

  Future<void> deleteEducation(int id)    => dio.delete('talent/profile/education/$id');
  Future<void> deleteWorkExp(int id)      => dio.delete('talent/profile/work-experience/$id');
  Future<void> deleteCertificate(int id)  => dio.delete('talent/profile/certificates/$id');
  Future<void> deleteSkill(int id)        => dio.delete('talent/profile/skills/$id');
  Future<void> deleteHobby(int id)        => dio.delete('talent/profile/hobbies/$id');
  Future<void> deleteLanguage(int id)     => dio.delete('talent/profile/languages/$id');
}

final profileViewRepoProvider =
    Provider<ProfileViewRepository>((_) => ProfileViewRepository());

// ── State ─────────────────────────────────────────────────────────────────────

class ProfileViewState {
  final FullProfile? profile;
  final bool         loading;
  final String?      error;
  final bool         saving;   // for name/bio saves

  const ProfileViewState({this.profile, this.loading = true, this.error, this.saving = false});

  ProfileViewState copyWith({FullProfile? profile, bool? loading, String? error, bool? saving}) =>
      ProfileViewState(
        profile: profile ?? this.profile,
        loading: loading ?? this.loading,
        error:   error,
        saving:  saving  ?? this.saving,
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class ProfileViewNotifier extends StateNotifier<ProfileViewState> {
  final ProfileViewRepository _repo;
  ProfileViewNotifier(this._repo) : super(const ProfileViewState()) { fetch(); }

  Future<void> fetch() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final p = await _repo.getFullProfile();
      state = state.copyWith(profile: p, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<bool> updateName({required String first, required String last}) async {
    state = state.copyWith(saving: true);
    try {
      await _repo.updateName(firstName: first, lastName: last);
      await fetch();
      state = state.copyWith(saving: false);
      return true;
    } catch (_) { state = state.copyWith(saving: false); return false; }
  }

  Future<bool> updateBio(String bio) async {
    state = state.copyWith(saving: true);
    try {
      await _repo.updateBio(bio);
      await fetch();
      state = state.copyWith(saving: false);
      return true;
    } catch (_) { state = state.copyWith(saving: false); return false; }
  }

  Future<bool> changePassword({required String current, required String newPw}) async {
    state = state.copyWith(saving: true);
    try {
      await _repo.changePassword(current: current, newPw: newPw);
      state = state.copyWith(saving: false);
      return true;
    } on DioException catch (e) {
      state = state.copyWith(saving: false,
        error: (e.response?.data as Map?)?['detail']?.toString() ?? 'Password change failed');
      return false;
    }
  }

  Future<void> _deleteAndRefetch(Future<void> Function() op) async {
    try { await op(); await fetch(); } catch (_) {}
  }

  Future<void> deleteEducation(int id)   => _deleteAndRefetch(() => _repo.deleteEducation(id));
  Future<void> deleteWorkExp(int id)     => _deleteAndRefetch(() => _repo.deleteWorkExp(id));
  Future<void> deleteCertificate(int id) => _deleteAndRefetch(() => _repo.deleteCertificate(id));
  Future<void> deleteSkill(int id)       => _deleteAndRefetch(() => _repo.deleteSkill(id));
  Future<void> deleteHobby(int id)       => _deleteAndRefetch(() => _repo.deleteHobby(id));
  Future<void> deleteLanguage(int id)    => _deleteAndRefetch(() => _repo.deleteLanguage(id));
}

final profileViewProvider =
    StateNotifierProvider<ProfileViewNotifier, ProfileViewState>(
  (ref) => ProfileViewNotifier(ref.read(profileViewRepoProvider)),
);
