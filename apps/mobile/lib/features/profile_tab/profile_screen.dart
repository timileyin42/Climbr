import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import '../../core/network/upload_service.dart';
import '../../data/models/profile_models.dart';
import '../../data/models/profile_view_models.dart';
import '../onboarding/onboarding_provider.dart';
import '../saved_tab/saved_provider.dart';
import 'profile_provider.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  File? _localPhoto;      // shows instantly after picking
  bool  _uploadingPhoto = false;

  Future<void> _pickAndUploadPhoto() async {
    final xFile = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
      maxWidth: 800,
    );
    if (xFile == null || !mounted) return;

    // Show the picked image immediately — don't wait for the upload
    setState(() {
      _localPhoto      = File(xFile.path);
      _uploadingPhoto  = true;
    });

    final url = await UploadService.uploadProfileImage(File(xFile.path));
    if (mounted) {
      setState(() => _uploadingPhoto = false);
      if (url != null) {
        // Refresh profile in background so server URL is cached for next session
        ref.read(profileViewProvider.notifier).fetch();
      } else {
        // Upload failed — revert the preview
        setState(() => _localPhoto = null);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Upload failed. Please try again.'),
            backgroundColor: ClimbrColors.statusRejected),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state      = ref.watch(profileViewProvider);
    final notifier   = ref.read(profileViewProvider.notifier);
    final savedJobs  = ref.watch(savedJobsProvider).jobs.length;
    final savedTs    = ref.watch(savedTrainingsProvider).trainings.length;

    if (state.loading) {
      return const Scaffold(
        backgroundColor: ClimbrColors.bgSecondary,
        body: Center(child: CircularProgressIndicator(color: ClimbrColors.brandCyan)),
      );
    }

    final p = state.profile;
    if (p == null) {
      return Scaffold(
        backgroundColor: ClimbrColors.bgSecondary,
        body: Center(
          child: ElevatedButton(
            onPressed: notifier.fetch,
            child: const Text('Reload profile'),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: RefreshIndicator(
        color: ClimbrColors.brandCyan,
        onRefresh: notifier.fetch,
        child: CustomScrollView(
          slivers: [
            // ── Header ──────────────────────────────────────────────────
            SliverToBoxAdapter(
              child: Container(
                color: ClimbrColors.bgPrimary,
                padding: EdgeInsets.fromLTRB(Sp.s6, MediaQuery.paddingOf(context).top + Sp.s5, Sp.s6, Sp.s5),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text('My Profile', style: ClimbrText.h1.copyWith(color: ClimbrColors.textPrimary)),
                        ),
                        // Settings gear
                        GestureDetector(
                          onTap: () => context.push('/settings'),
                          child: Container(
                            width: 40, height: 40,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: ClimbrColors.bgSecondary,
                              border: Border.all(color: ClimbrColors.border),
                            ),
                            child: const Icon(Icons.settings_outlined, size: 20, color: ClimbrColors.textSecondary),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: Sp.s5),

                    // Avatar + name
                    Row(
                      children: [
                        GestureDetector(
                          onTap: _uploadingPhoto ? null : _pickAndUploadPhoto,
                          child: Stack(
                            children: [
                              Container(
                                width: 72, height: 72,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: ClimbrColors.brandCyan,
                                  border: Border.all(color: ClimbrColors.brandCyanSoft, width: 3),
                                ),
                                child: _uploadingPhoto
                                    ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                                    : _localPhoto != null
                                        ? ClipOval(child: Image.file(_localPhoto!, fit: BoxFit.cover))
                                        : p.profileImageUrl != null
                                        ? ClipOval(child: Image.network(p.profileImageUrl!, fit: BoxFit.cover))
                                        : Center(
                                            child: Text(
                                              p.firstName.isNotEmpty ? p.firstName[0].toUpperCase() : '?',
                                              style: const TextStyle(
                                                fontFamily: 'Inter', fontSize: 28,
                                                fontWeight: FontWeight.w800, color: Colors.white,
                                              ),
                                            ),
                                          ),
                              ),
                              Positioned(
                                bottom: 0, right: 0,
                                child: Container(
                                  width: 24, height: 24,
                                  decoration: const BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: ClimbrColors.brandNavy,
                                  ),
                                  child: const Icon(Icons.camera_alt_outlined, size: 12, color: Colors.white),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(width: Sp.s4),

                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(p.fullName, style: ClimbrText.h2.copyWith(color: ClimbrColors.textPrimary)),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: ClimbrColors.brandCyanSoft,
                                  borderRadius: BorderRadius.circular(Radii.pill),
                                ),
                                child: Text('Talent', style: ClimbrText.caption.copyWith(color: ClimbrColors.brandCyan, fontWeight: FontWeight.w700)),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: Sp.s4),

                    // Profile completion ring
                    _CompletionBar(pct: p.profileCompletion),

                    const SizedBox(height: Sp.s4),

                    // Saved counts strip
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _SavedPill(icon: Icons.work_outline_rounded, count: savedJobs, label: 'Saved Jobs'),
                        const SizedBox(width: Sp.s3),
                        _SavedPill(icon: Icons.school_outlined, count: savedTs, label: 'Trainings'),
                      ],
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 350.ms),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: Sp.s4)),

            // ── Bio ──────────────────────────────────────────────────────
            _SectionSliver(
              title: 'Bio',
              onEdit: () => _editBio(context, ref, p.bio ?? ''),
              child: p.bio != null && p.bio!.isNotEmpty
                  ? Text(p.bio!, style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary, height: 1.6))
                  : _AddHint('Add a short bio'),
            ),

            // ── Work Experience ───────────────────────────────────────────
            _SectionSliver(
              title: 'Work Experience',
              onEdit: () => _showAddWork(context, ref),
              child: p.workExperience.isEmpty
                  ? _AddHint('Add work experience')
                  : Column(
                      children: p.workExperience.map((w) => _WorkCard(
                        entry: w,
                        onDelete: () => notifier.deleteWorkExp(w.id),
                      )).toList(),
                    ),
            ),

            // ── Education ────────────────────────────────────────────────
            _SectionSliver(
              title: 'Education',
              onEdit: () => _showAddEducation(context, ref),
              child: p.education.isEmpty
                  ? _AddHint('Add education')
                  : Column(
                      children: p.education.map((e) => _EduCard(
                        entry: e,
                        onDelete: () => notifier.deleteEducation(e.id),
                      )).toList(),
                    ),
            ),

            // ── Skills ───────────────────────────────────────────────────
            _SectionSliver(
              title: 'Skills',
              onEdit: () => _showAddChips(context, ref, 'skills'),
              child: p.skills.isEmpty
                  ? _AddHint('Add skills')
                  : Wrap(
                      spacing: Sp.s2, runSpacing: Sp.s2,
                      children: p.skills.map((s) => _RemovableChip(
                        label: s.name,
                        color: ClimbrColors.brandCyan,
                        bg:    ClimbrColors.brandCyanSoft,
                        onDelete: () => notifier.deleteSkill(s.id),
                      )).toList(),
                    ),
            ),

            // ── Certificates ──────────────────────────────────────────────
            _SectionSliver(
              title: 'Certificates',
              onEdit: () => _showAddCert(context, ref),
              child: p.certificates.isEmpty
                  ? _AddHint('Add certificates')
                  : Column(
                      children: p.certificates.map((c) => _CertRow(
                        entry: c,
                        onDelete: () => notifier.deleteCertificate(c.id),
                      )).toList(),
                    ),
            ),

            // ── Hobbies ───────────────────────────────────────────────────
            _SectionSliver(
              title: 'Hobbies',
              onEdit: () => _showAddChips(context, ref, 'hobbies'),
              child: p.hobbies.isEmpty
                  ? _AddHint('Add hobbies')
                  : Wrap(
                      spacing: Sp.s2, runSpacing: Sp.s2,
                      children: p.hobbies.map((h) => _RemovableChip(
                        label: h.name,
                        color: ClimbrColors.brandPink,
                        bg:    const Color(0xFFFDE8F3),
                        onDelete: () => notifier.deleteHobby(h.id),
                      )).toList(),
                    ),
            ),

            // ── Languages ─────────────────────────────────────────────────
            _SectionSliver(
              title: 'Languages',
              onEdit: () => _showAddLanguage(context, ref),
              child: p.languages.isEmpty
                  ? _AddHint('Add languages')
                  : Wrap(
                      spacing: Sp.s2, runSpacing: Sp.s2,
                      children: p.languages.map((l) => _RemovableChip(
                        label: '${l.name} · ${l.proficiency}',
                        color: ClimbrColors.statusShortlisted,
                        bg:    ClimbrColors.statusShortlistedBg,
                        onDelete: () => notifier.deleteLanguage(l.id),
                  )).toList(),
                ),
              ),

            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  void _editBio(BuildContext context, WidgetRef ref, String current) {
    final ctrl = TextEditingController(text: current);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
        child: Container(
          padding: const EdgeInsets.all(Sp.s6),
          decoration: const BoxDecoration(
            color: ClimbrColors.bgPrimary,
            borderRadius: BorderRadius.vertical(top: Radius.circular(Radii.xl2)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 36, height: 4, decoration: BoxDecoration(color: ClimbrColors.border, borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: Sp.s4),
              Text('Edit Bio', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
              const SizedBox(height: Sp.s3),
              TextField(
                controller: ctrl,
                maxLines: 5,
                maxLength: 300,
                style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
                decoration: InputDecoration(
                  hintText: 'Tell employers about yourself…',
                  hintStyle: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textTertiary),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(Radii.md), borderSide: const BorderSide(color: ClimbrColors.border)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Radii.md), borderSide: const BorderSide(color: ClimbrColors.border)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Radii.md), borderSide: const BorderSide(color: ClimbrColors.brandCyan, width: 1.5)),
                  filled: true, fillColor: ClimbrColors.bgPrimary,
                  contentPadding: const EdgeInsets.all(Sp.s4),
                ),
              ),
              const SizedBox(height: Sp.s4),
              SizedBox(
                width: double.infinity, height: 50,
                child: ElevatedButton(
                  onPressed: () async {
                    Navigator.pop(context);
                    await ref.read(profileViewProvider.notifier).updateBio(ctrl.text.trim());
                  },
                  child: const Text('Save Bio', style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w700, fontSize: 15)),
                ),
              ),
            ],
          ),
        ),
      ),
    ).whenComplete(() => ctrl.dispose());
  }

  // ── Add Work Experience ─────────────────────────────────────────────────────
  void _showAddWork(BuildContext context, WidgetRef ref) {
    final co = TextEditingController(), ro = TextEditingController();
    final sd = TextEditingController(), ed = TextEditingController();
    final de = TextEditingController();
    bool curr = false;
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
      builder: (_) => StatefulBuilder(builder: (ctx, setS) => _Sheet(
        title: 'Add Work Experience',
        onSave: () async {
          Navigator.pop(context);
          await ref.read(profileRepoProvider).addWorkExperience(WorkExperienceRequest(
            company: co.text, role: ro.text,
            startDate: sd.text, endDate: curr ? null : ed.text.isEmpty ? null : ed.text,
            description: de.text.isEmpty ? null : de.text, isCurrent: curr,
          ));
          ref.read(profileViewProvider.notifier).fetch();
        },
        child: Column(children: [
          _SField('Company', co, 'e.g. Google'),
          const SizedBox(height: Sp.s3),
          _SField('Job title', ro, 'e.g. Product Manager'),
          const SizedBox(height: Sp.s3),
          Row(children: [
            Expanded(child: _SField('Start (MM/YYYY)', sd, '03/2022')),
            const SizedBox(width: Sp.s3),
            Expanded(child: _SField('End (MM/YYYY)', ed, '01/2024', enabled: !curr)),
          ]),
          const SizedBox(height: Sp.s3),
          GestureDetector(
            onTap: () => setS(() => curr = !curr),
            child: Row(children: [
              AnimatedContainer(duration: const Duration(milliseconds: 180),
                width: 20, height: 20,
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(4),
                  color: curr ? ClimbrColors.brandCyan : Colors.transparent,
                  border: Border.all(color: curr ? ClimbrColors.brandCyan : ClimbrColors.border)),
                child: curr ? const Icon(Icons.check, size: 14, color: Colors.white) : null),
              const SizedBox(width: Sp.s2),
              Text('I currently work here', style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary)),
            ]),
          ),
          const SizedBox(height: Sp.s3),
          _SField('Description (optional)', de, 'What did you achieve?', maxLines: 3),
        ]),
      )),
    ).whenComplete(() { co.dispose(); ro.dispose(); sd.dispose(); ed.dispose(); de.dispose(); });
  }

  // ── Add Education ───────────────────────────────────────────────────────────
  void _showAddEducation(BuildContext context, WidgetRef ref) {
    final in_ = TextEditingController(), de = TextEditingController();
    final fi = TextEditingController(), sy = TextEditingController(), ey = TextEditingController();
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
      builder: (_) => _Sheet(
        title: 'Add Education',
        onSave: () async {
          Navigator.pop(context);
          await ref.read(profileRepoProvider).addEducation(EducationRequest(
            institution: in_.text, degree: de.text,
            fieldOfStudy: fi.text, startYear: sy.text, endYear: ey.text.isEmpty ? null : ey.text,
          ));
          ref.read(profileViewProvider.notifier).fetch();
        },
        child: Column(children: [
          _SField('Institution', in_, 'e.g. University of Lagos'),
          const SizedBox(height: Sp.s3),
          _SField('Degree', de, 'e.g. B.Sc Computer Science'),
          const SizedBox(height: Sp.s3),
          _SField('Field of study', fi, 'e.g. Software Engineering'),
          const SizedBox(height: Sp.s3),
          Row(children: [
            Expanded(child: _SField('Start year', sy, '2019', inputType: TextInputType.number)),
            const SizedBox(width: Sp.s3),
            Expanded(child: _SField('End year', ey, '2023 (blank = present)', inputType: TextInputType.number)),
          ]),
        ]),
      ),
    ).whenComplete(() { in_.dispose(); de.dispose(); fi.dispose(); sy.dispose(); ey.dispose(); });
  }

  // ── Add Certificate ─────────────────────────────────────────────────────────
  void _showAddCert(BuildContext context, WidgetRef ref) {
    final na = TextEditingController(), is_ = TextEditingController();
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
      builder: (_) => _Sheet(
        title: 'Add Certificate',
        onSave: () async {
          Navigator.pop(context);
          await ref.read(profileRepoProvider).addCertificate(CertificateRequest(
            name: na.text, issuingOrganization: is_.text,
          ));
          ref.read(profileViewProvider.notifier).fetch();
        },
        child: Column(children: [
          _SField('Certificate name', na, 'e.g. AWS Cloud Practitioner'),
          const SizedBox(height: Sp.s3),
          _SField('Issuing organisation', is_, 'e.g. Amazon Web Services'),
        ]),
      ),
    ).whenComplete(() { na.dispose(); is_.dispose(); });
  }

  // ── Add Skills or Hobbies (chips) ───────────────────────────────────────────
  void _showAddChips(BuildContext context, WidgetRef ref, String type) {
    final ctrl = TextEditingController();
    final chips = <String>[];
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
      builder: (_) => StatefulBuilder(builder: (ctx, setS) => _Sheet(
        title: type == 'skills' ? 'Add Skills' : 'Add Hobbies',
        onSave: () async {
          Navigator.pop(context);
          for (final c in chips) {
            if (type == 'skills') {
              await ref.read(profileRepoProvider).addSkill(SkillRequest(name: c));
            } else {
              await ref.read(profileRepoProvider).addHobby(HobbyRequest(name: c));
            }
          }
          ref.read(profileViewProvider.notifier).fetch();
        },
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          TextField(
            controller: ctrl,
            textInputAction: TextInputAction.done,
            onSubmitted: (v) {
              final parts = v.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty);
              setS(() { chips.addAll(parts); ctrl.clear(); });
            },
            onChanged: (v) { if (v.endsWith(',')) { final parts = v.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty); setS(() { chips.addAll(parts); ctrl.clear(); }); } },
            style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
            decoration: InputDecoration(
              hintText: type == 'skills' ? 'e.g. Flutter, Python…' : 'e.g. Football, Reading…',
              prefixIcon: const Icon(Icons.add_circle_outline, size: 18, color: ClimbrColors.textTertiary),
            ),
          ),
          if (chips.isNotEmpty) ...[
            const SizedBox(height: Sp.s3),
            Wrap(spacing: Sp.s2, runSpacing: Sp.s2, children: chips.map((c) => GestureDetector(
              onTap: () => setS(() => chips.remove(c)),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: Sp.s3, vertical: 6),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(Radii.pill),
                  color: (type == 'skills' ? ClimbrColors.brandCyan : ClimbrColors.brandPink).withValues(alpha: 0.08),
                ),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Text(c, style: ClimbrText.caption.copyWith(color: type == 'skills' ? ClimbrColors.brandCyan : ClimbrColors.brandPink, fontWeight: FontWeight.w600)),
                  const SizedBox(width: 4),
                  Icon(Icons.close, size: 12, color: type == 'skills' ? ClimbrColors.brandCyan : ClimbrColors.brandPink),
                ]),
              ),
            )).toList()),
          ],
          const SizedBox(height: Sp.s2),
          Text('Type and press Enter, or separate with commas', style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary)),
        ]),
      )),
    ).whenComplete(() => ctrl.dispose());
  }

  // ── Add Language ────────────────────────────────────────────────────────────
  void _showAddLanguage(BuildContext context, WidgetRef ref) {
    final na = TextEditingController();
    String prof = 'conversational';
    const levels = ['basic', 'conversational', 'professional', 'native'];
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
      builder: (_) => StatefulBuilder(builder: (ctx, setS) => _Sheet(
        title: 'Add Language',
        onSave: () async {
          Navigator.pop(context);
          if (na.text.trim().isEmpty) return;
          await ref.read(profileRepoProvider).addLanguage(LanguageRequest(name: na.text.trim(), proficiency: prof));
          ref.read(profileViewProvider.notifier).fetch();
        },
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          _SField('Language', na, 'e.g. Yoruba, French…'),
          const SizedBox(height: Sp.s4),
          Text('Proficiency', style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary)),
          const SizedBox(height: Sp.s2),
          Wrap(spacing: Sp.s2, runSpacing: Sp.s2, children: levels.map((l) => GestureDetector(
            onTap: () => setS(() => prof = l),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              padding: const EdgeInsets.symmetric(horizontal: Sp.s4, vertical: 10),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(Radii.pill),
                color: prof == l ? ClimbrColors.brandCyan : ClimbrColors.bgPrimary,
                border: Border.all(color: prof == l ? ClimbrColors.brandCyan : ClimbrColors.border),
              ),
              child: Text(l[0].toUpperCase() + l.substring(1),
                style: ClimbrText.label.copyWith(color: prof == l ? Colors.white : ClimbrColors.textSecondary)),
            ),
          )).toList()),
        ]),
      )),
    ).whenComplete(() => na.dispose());
  }
}

// ── Reusable sheet + field helpers ────────────────────────────────────────────

class _Sheet extends StatelessWidget {
  final String     title;
  final Widget     child;
  final VoidCallback onSave;
  const _Sheet({required this.title, required this.child, required this.onSave});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: Container(
        padding: const EdgeInsets.all(Sp.s6),
        decoration: const BoxDecoration(
          color: ClimbrColors.bgPrimary,
          borderRadius: BorderRadius.vertical(top: Radius.circular(Radii.xl2)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 36, height: 4,
              decoration: BoxDecoration(color: ClimbrColors.border, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: Sp.s4),
            Text(title, style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
            const SizedBox(height: Sp.s4),
            child,
            const SizedBox(height: Sp.s5),
            SizedBox(
              width: double.infinity, height: 50,
              child: ElevatedButton(
                onPressed: onSave,
                child: const Text('Save', style: TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SField extends StatelessWidget {
  final String label, hint;
  final TextEditingController ctrl;
  final int maxLines;
  final bool enabled;
  final TextInputType? inputType;
  const _SField(this.label, this.ctrl, this.hint, {this.maxLines = 1, this.enabled = true, this.inputType});

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(label, style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary)),
      const SizedBox(height: Sp.s2),
      TextField(
        controller: ctrl,
        enabled: enabled,
        maxLines: maxLines,
        keyboardType: inputType,
        style: ClimbrText.bodyMd.copyWith(color: enabled ? ClimbrColors.textPrimary : ClimbrColors.textTertiary),
        decoration: InputDecoration(hintText: hint),
      ),
    ],
  );
}

// ── Section sliver ────────────────────────────────────────────────────────────

class _SectionSliver extends StatelessWidget {
  final String    title;
  final Widget    child;
  final VoidCallback? onEdit;
  const _SectionSliver({required this.title, required this.child, this.onEdit});

  @override
  Widget build(BuildContext context) {
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, Sp.s4),
        padding: const EdgeInsets.all(Sp.s5),
        decoration: BoxDecoration(
          color: ClimbrColors.bgPrimary,
          borderRadius: BorderRadius.circular(Radii.xl),
          border: Border.all(color: ClimbrColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: Text(title, style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary))),
                if (onEdit != null)
                  GestureDetector(
                    onTap: onEdit,
                    child: Text('Edit', style: ClimbrText.label.copyWith(color: ClimbrColors.brandCyan)),
                  ),
              ],
            ),
            const SizedBox(height: Sp.s3),
            child,
          ],
        ),
      ).animate().fadeIn(duration: 300.ms),
    );
  }
}

// ── Entry cards ───────────────────────────────────────────────────────────────

class _WorkCard extends StatelessWidget {
  final WorkEntry    entry;
  final VoidCallback onDelete;
  const _WorkCard({required this.entry, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: Sp.s4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: ClimbrColors.brandCyanSoft,
              border: Border.all(color: ClimbrColors.brandCyan.withValues(alpha: 0.25)),
            ),
            child: Center(child: Text(entry.company[0].toUpperCase(), style: ClimbrText.label.copyWith(color: ClimbrColors.brandCyan))),
          ),
          const SizedBox(width: Sp.s3),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(entry.position, style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary)),
              Text(entry.company, style: ClimbrText.bodySm.copyWith(color: ClimbrColors.brandCyan)),
              Text(entry.dateRange, style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary)),
              if (entry.description != null && entry.description!.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(entry.description!, maxLines: 2, overflow: TextOverflow.ellipsis,
                    style: ClimbrText.caption.copyWith(color: ClimbrColors.textSecondary)),
              ],
            ]),
          ),
          GestureDetector(
            onTap: onDelete,
            child: const Icon(Icons.close_rounded, size: 18, color: ClimbrColors.textTertiary),
          ),
        ],
      ),
    );
  }
}

class _EduCard extends StatelessWidget {
  final EducationEntry entry;
  final VoidCallback   onDelete;
  const _EduCard({required this.entry, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: Sp.s4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(Radii.md),
              color: ClimbrColors.brandOrangeSoft,
            ),
            child: const Center(child: Icon(Icons.school_outlined, size: 18, color: ClimbrColors.brandOrange)),
          ),
          const SizedBox(width: Sp.s3),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(entry.institution, style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary)),
              Text(entry.degree, style: ClimbrText.bodySm.copyWith(color: ClimbrColors.textSecondary)),
              if (entry.fieldOfStudy != null)
                Text(entry.fieldOfStudy!, style: ClimbrText.caption.copyWith(color: ClimbrColors.textSecondary)),
              Text(entry.dateRange, style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary)),
            ]),
          ),
          GestureDetector(
            onTap: onDelete,
            child: const Icon(Icons.close_rounded, size: 18, color: ClimbrColors.textTertiary),
          ),
        ],
      ),
    );
  }
}

class _CertRow extends StatefulWidget {
  final CertEntry    entry;
  final VoidCallback onDelete;
  const _CertRow({required this.entry, required this.onDelete});

  @override
  State<_CertRow> createState() => _CertRowState();
}

class _CertRowState extends State<_CertRow> {
  bool    _uploading = false;
  bool    _uploaded  = false;
  String? _fileName;

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    );
    if (result == null || result.files.isEmpty || result.files.first.path == null) return;
    final file = result.files.first;
    setState(() { _uploading = true; _fileName = file.name; });
    final url = await UploadService.uploadCertificate(widget.entry.id, File(file.path!));
    if (mounted) setState(() { _uploading = false; _uploaded = url != null; });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: Sp.s3),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(
              _uploaded ? Icons.verified_rounded : Icons.verified_outlined,
              size: 18,
              color: _uploaded ? ClimbrColors.statusAccepted : ClimbrColors.statusAccepted,
            ),
            const SizedBox(width: Sp.s2),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(widget.entry.name, style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary)),
                Text(widget.entry.issuingOrganization, style: ClimbrText.caption.copyWith(color: ClimbrColors.textSecondary)),
              ]),
            ),
            // Upload file button
            GestureDetector(
              onTap: _uploading ? null : _pickFile,
              child: _uploading
                  ? const SizedBox(width: 16, height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: ClimbrColors.brandCyan))
                  : Icon(
                      _uploaded ? Icons.attach_file_rounded : Icons.upload_file_outlined,
                      size: 18,
                      color: _uploaded ? ClimbrColors.statusAccepted : ClimbrColors.brandCyan,
                    ),
            ),
            const SizedBox(width: Sp.s2),
            GestureDetector(onTap: widget.onDelete, child: const Icon(Icons.close_rounded, size: 18, color: ClimbrColors.textTertiary)),
          ]),
          if (_fileName != null) ...[
            const SizedBox(height: 3),
            Padding(
              padding: const EdgeInsets.only(left: 26),
              child: Text(
                _uploaded ? '✓ $_fileName' : _fileName!,
                style: ClimbrText.caption.copyWith(
                  color: _uploaded ? ClimbrColors.statusAccepted : ClimbrColors.textTertiary,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ── Removable chip ────────────────────────────────────────────────────────────

class _RemovableChip extends StatelessWidget {
  final String   label;
  final Color    color;
  final Color    bg;
  final VoidCallback onDelete;
  const _RemovableChip({required this.label, required this.color, required this.bg, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: Sp.s3, vertical: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(Radii.pill),
        color: bg,
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Text(label, style: ClimbrText.caption.copyWith(color: color, fontWeight: FontWeight.w600)),
        const SizedBox(width: 4),
        GestureDetector(onTap: onDelete, child: Icon(Icons.close_rounded, size: 13, color: color)),
      ]),
    );
  }
}

// ── Completion bar ────────────────────────────────────────────────────────────

class _CompletionBar extends StatelessWidget {
  final int pct;
  const _CompletionBar({required this.pct});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          Expanded(child: Text('Profile completion', style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary))),
          Text('$pct%', style: ClimbrText.caption.copyWith(color: ClimbrColors.brandCyan, fontWeight: FontWeight.w700)),
        ]),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(Radii.pill),
          child: LinearProgressIndicator(
            value: pct / 100,
            minHeight: 6,
            backgroundColor: ClimbrColors.bgTertiary,
            valueColor: const AlwaysStoppedAnimation<Color>(ClimbrColors.brandCyan),
          ),
        ),
      ],
    );
  }
}

// ── Saved pill ────────────────────────────────────────────────────────────────

class _SavedPill extends StatelessWidget {
  final IconData icon;
  final int      count;
  final String   label;
  const _SavedPill({required this.icon, required this.count, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: Sp.s3, vertical: 8),
      decoration: BoxDecoration(
        color: ClimbrColors.bgTertiary,
        borderRadius: BorderRadius.circular(Radii.pill),
        border: Border.all(color: ClimbrColors.border),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 14, color: ClimbrColors.textSecondary),
        const SizedBox(width: 5),
        Text('$count $label', style: ClimbrText.caption.copyWith(color: ClimbrColors.textSecondary)),
      ]),
    );
  }
}

// ── Add hint ──────────────────────────────────────────────────────────────────

class _AddHint extends StatelessWidget {
  final String text;
  const _AddHint(this.text);
  @override
  Widget build(BuildContext context) =>
      Text(text, style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textTertiary, fontStyle: FontStyle.italic));
}
