import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import '../../core/network/upload_service.dart';
import 'onboarding_provider.dart';

class OnboardingScreen extends ConsumerWidget {
  const OnboardingScreen({super.key});

  static const _titles = [
    'Tell us about you',
    'Your education',
    'Upload your CV',
    'Certificates',
    'Work experience',
    'Your skills',
    'Your hobbies',
    'Languages',
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(onboardingProvider);

    // Auto-skip: already onboarded
    ref.listen<OnboardingState>(onboardingProvider, (_, next) {
      if (next.done) context.go('/home');
    });

    if (state.checking) {
      return const Scaffold(
        backgroundColor: ClimbrColors.bgSecondary,
        body: Center(child: CircularProgressIndicator(color: ClimbrColors.brandCyan)),
      );
    }

    final step      = state.step;
    final notifier  = ref.read(onboardingProvider.notifier);
    final totalSteps = OnboardingNotifier.totalSteps;

    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: SafeArea(
        child: Column(
          children: [
            // ── Top bar ──────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, 0),
              child: Row(
                children: [
                  // Progress dots
                  Expanded(
                    child: Row(
                      children: List.generate(totalSteps, (i) {
                        final active = i == step;
                        final done   = i < step;
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeOutCubic,
                          width: active ? 24 : 6,
                          height: 6,
                          margin: const EdgeInsets.only(right: 4),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(3),
                            color: active
                                ? ClimbrColors.brandCyan
                                : done
                                    ? ClimbrColors.brandCyan.withValues(alpha: 0.4)
                                    : ClimbrColors.border,
                          ),
                        );
                      }),
                    ),
                  ),
                  const SizedBox(width: Sp.s4),
                  // Step counter
                  Text(
                    '${step + 1} of $totalSteps',
                    style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary),
                  ),
                  const SizedBox(width: Sp.s4),
                  // Skip button
                  GestureDetector(
                    onTap: notifier.skipStep,
                    child: Text(
                      'Skip',
                      style: ClimbrText.label.copyWith(color: ClimbrColors.brandCyan),
                    ),
                  ),
                ],
              ),
            ),

            // ── Title ────────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, 0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  _titles[step],
                  style: ClimbrText.h1.copyWith(color: ClimbrColors.textPrimary),
                ).animate(key: ValueKey(step))
                    .fadeIn(duration: 300.ms)
                    .slideY(begin: 0.08, end: 0, duration: 300.ms, curve: Curves.easeOutCubic),
              ),
            ),

            // ── Error banner ──────────────────────────────────────────────
            if (state.error != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s3, Sp.s6, 0),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: Sp.s4, vertical: Sp.s3),
                  decoration: BoxDecoration(
                    color: ClimbrColors.statusRejectedBg,
                    borderRadius: BorderRadius.circular(Radii.md),
                  ),
                  child: Text(state.error!, style: ClimbrText.bodySm.copyWith(color: ClimbrColors.statusRejected)),
                ),
              ),

            // ── Step content ──────────────────────────────────────────────
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 320),
                transitionBuilder: (child, animation) => FadeTransition(
                  opacity: animation,
                  child: SlideTransition(
                    position: Tween<Offset>(begin: const Offset(0.04, 0), end: Offset.zero)
                        .animate(animation),
                    child: child,
                  ),
                ),
                child: _stepWidget(step, state, notifier, context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _stepWidget(int step, OnboardingState state, OnboardingNotifier notifier, BuildContext ctx) {
    switch (step) {
      case 0: return _Step1Bio(state: state, notifier: notifier, key: const ValueKey(0));
      case 1: return _Step2Education(state: state, notifier: notifier, key: const ValueKey(1));
      case 2: return _Step3Resume(notifier: notifier, key: const ValueKey(2));
      case 3: return _Step4Certificates(state: state, notifier: notifier, key: const ValueKey(3));
      case 4: return _Step5WorkExperience(state: state, notifier: notifier, key: const ValueKey(4));
      case 5: return _Step6Skills(state: state, notifier: notifier, key: const ValueKey(5));
      case 6: return _Step7Hobbies(state: state, notifier: notifier, key: const ValueKey(6));
      case 7: return _Step8Languages(state: state, notifier: notifier, key: const ValueKey(7));
      default: return const SizedBox.shrink();
    }
  }
}

// ── Shared helpers ────────────────────────────────────────────────────────────

class _PrimaryBtn extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  const _PrimaryBtn({required this.label, this.onPressed, this.loading = false});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 54,
      child: ElevatedButton(
        onPressed: loading ? null : onPressed,
        child: loading
            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : Text(label, style: const TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w700)),
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  final String text;
  const _FieldLabel(this.text);
  @override
  Widget build(BuildContext context) =>
      Text(text, style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary));
}

// ── Step 1 — Bio ──────────────────────────────────────────────────────────────

class _Step1Bio extends StatefulWidget {
  final OnboardingState state;
  final OnboardingNotifier notifier;
  const _Step1Bio({required this.state, required this.notifier, super.key});

  @override
  State<_Step1Bio> createState() => _Step1BioState();
}

class _Step1BioState extends State<_Step1Bio> {
  final _bioCtrl = TextEditingController();

  @override
  void dispose() { _bioCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, Sp.s7),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Avatar placeholder
        Center(
          child: Stack(
            children: [
              Container(
                width: 88, height: 88,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: ClimbrColors.brandCyan.withValues(alpha: 0.1),
                  border: Border.all(color: ClimbrColors.brandCyan.withValues(alpha: 0.3)),
                ),
                child: const Icon(Icons.person_outline_rounded, size: 44, color: ClimbrColors.brandCyan),
              ),
              Positioned(
                bottom: 0, right: 0,
                child: Container(
                  width: 28, height: 28,
                  decoration: const BoxDecoration(shape: BoxShape.circle, color: ClimbrColors.brandCyan),
                  child: const Icon(Icons.camera_alt_outlined, size: 14, color: Colors.white),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: Sp.s2),
        Center(
          child: Text(
            'Photo upload coming soon',
            style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary),
          ),
        ),

        const SizedBox(height: Sp.s6),

        const _FieldLabel('Short bio'),
        const SizedBox(height: Sp.s2),
        TextField(
          controller: _bioCtrl,
          maxLines: 5,
          maxLength: 300,
          style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
          decoration: InputDecoration(
            hintText: 'Tell employers a little about yourself — your passion, goals, or what makes you unique…',
            hintStyle: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textTertiary),
            alignLabelWithHint: true,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(Radii.md), borderSide: const BorderSide(color: ClimbrColors.border)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Radii.md), borderSide: const BorderSide(color: ClimbrColors.border)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Radii.md), borderSide: const BorderSide(color: ClimbrColors.brandCyan, width: 1.5)),
            filled: true,
            fillColor: ClimbrColors.bgPrimary,
            contentPadding: const EdgeInsets.all(Sp.s4),
          ),
        ),

        const SizedBox(height: Sp.s6),
        _PrimaryBtn(
          label: 'Save & Continue',
          loading: widget.state.loading,
          onPressed: () => widget.notifier.saveBio(_bioCtrl.text),
        ),
      ]),
    );
  }
}

// ── Step 2 — Education ────────────────────────────────────────────────────────

class _Step2Education extends StatefulWidget {
  final OnboardingState state;
  final OnboardingNotifier notifier;
  const _Step2Education({required this.state, required this.notifier, super.key});

  @override
  State<_Step2Education> createState() => _Step2EducationState();
}

class _Step2EducationState extends State<_Step2Education> {
  final _instCtrl   = TextEditingController();
  final _degCtrl    = TextEditingController();
  final _fieldCtrl  = TextEditingController();
  final _startCtrl  = TextEditingController();
  final _endCtrl    = TextEditingController();

  @override
  void dispose() {
    _instCtrl.dispose(); _degCtrl.dispose();
    _fieldCtrl.dispose(); _startCtrl.dispose(); _endCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, Sp.s7),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const _FieldLabel('Institution'),
        const SizedBox(height: Sp.s2),
        _Input(ctrl: _instCtrl, hint: 'e.g. University of Lagos'),
        const SizedBox(height: Sp.s4),

        const _FieldLabel('Degree'),
        const SizedBox(height: Sp.s2),
        _Input(ctrl: _degCtrl, hint: 'e.g. B.Sc. Computer Science'),
        const SizedBox(height: Sp.s4),

        const _FieldLabel('Field of study'),
        const SizedBox(height: Sp.s2),
        _Input(ctrl: _fieldCtrl, hint: 'e.g. Software Engineering'),
        const SizedBox(height: Sp.s4),

        Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const _FieldLabel('Start year'),
            const SizedBox(height: Sp.s2),
            _Input(ctrl: _startCtrl, hint: '2019', inputType: TextInputType.number),
          ])),
          const SizedBox(width: Sp.s3),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const _FieldLabel('End year'),
            const SizedBox(height: Sp.s2),
            _Input(ctrl: _endCtrl, hint: '2023 (or leave blank)', inputType: TextInputType.number),
          ])),
        ]),

        const SizedBox(height: Sp.s6),
        _PrimaryBtn(
          label: 'Save & Continue',
          loading: widget.state.loading,
          onPressed: () => widget.notifier.saveEducation(
            institution: _instCtrl.text,
            degree:      _degCtrl.text,
            field:       _fieldCtrl.text,
            startYear:   _startCtrl.text,
            endYear:     _endCtrl.text.isEmpty ? null : _endCtrl.text,
          ),
        ),
      ]),
    );
  }
}

// ── Step 3 — Resume (file picker pending Batch 10) ────────────────────────────

class _Step3Resume extends StatefulWidget {
  final OnboardingNotifier notifier;
  const _Step3Resume({required this.notifier, super.key});

  @override
  State<_Step3Resume> createState() => _Step3ResumeState();
}

class _Step3ResumeState extends State<_Step3Resume> {
  String? _fileName;
  bool    _uploading = false;
  bool    _uploaded  = false;

  Future<void> _pick() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx'],
    );
    if (result == null || result.files.isEmpty || result.files.first.path == null) return;
    final file = result.files.first;
    setState(() { _fileName = file.name; _uploading = true; });

    final url = await UploadService.uploadResume(File(file.path!));
    if (mounted) {
      setState(() { _uploading = false; _uploaded = url != null; });
      if (url != null) {
        await Future.delayed(const Duration(milliseconds: 600));
        if (mounted) widget.notifier.proceedFromResume();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, Sp.s7),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(
          'Upload your CV so employers can learn more about your experience.',
          style: ClimbrText.bodyLg.copyWith(color: ClimbrColors.textSecondary, height: 1.55),
        ),
        const SizedBox(height: Sp.s7),

        GestureDetector(
          onTap: _uploading ? null : _pick,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            width: double.infinity, height: 160,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(Radii.lg),
              border: Border.all(
                color: _uploaded ? ClimbrColors.statusAccepted : ClimbrColors.brandCyan,
                width: 1.5,
              ),
              color: _uploaded ? ClimbrColors.statusAcceptedBg : ClimbrColors.bgPrimary,
            ),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              _uploading
                  ? const CircularProgressIndicator(color: ClimbrColors.brandCyan, strokeWidth: 3)
                  : Icon(
                      _uploaded ? Icons.check_circle_outline : Icons.upload_file_outlined,
                      size: 40,
                      color: _uploaded ? ClimbrColors.statusAccepted : ClimbrColors.brandCyan,
                    ),
              const SizedBox(height: Sp.s3),
              Text(
                _uploading ? 'Uploading…'
                    : _uploaded ? 'CV uploaded successfully!'
                    : 'Tap to pick your CV',
                style: ClimbrText.bodyMd.copyWith(
                  color: _uploaded ? ClimbrColors.statusAccepted
                      : _uploading ? ClimbrColors.textTertiary
                      : ClimbrColors.textPrimary,
                ),
              ),
              if (_fileName != null && !_uploading) ...[
                const SizedBox(height: Sp.s2),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: Sp.s3, vertical: 4),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(Radii.pill),
                    color: (_uploaded ? ClimbrColors.statusAccepted : ClimbrColors.brandCyan)
                        .withValues(alpha: 0.08),
                  ),
                  child: Text(
                    _fileName!,
                    style: ClimbrText.caption.copyWith(
                      color: _uploaded ? ClimbrColors.statusAccepted : ClimbrColors.brandCyan,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
              if (!_uploaded && !_uploading && _fileName == null) ...[
                const SizedBox(height: Sp.s2),
                Text('PDF or DOC, up to 10MB',
                    style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary)),
              ],
            ]),
          ),
        ),

        const Spacer(),

        _PrimaryBtn(
          label: _uploaded ? 'Continue' : 'Skip for now',
          onPressed: widget.notifier.proceedFromResume,
        ),
      ]),
    );
  }
}

// ── Step 4 — Certificates ─────────────────────────────────────────────────────

class _Step4Certificates extends StatefulWidget {
  final OnboardingState state;
  final OnboardingNotifier notifier;
  const _Step4Certificates({required this.state, required this.notifier, super.key});

  @override
  State<_Step4Certificates> createState() => _Step4CertificatesState();
}

class _Step4CertificatesState extends State<_Step4Certificates> {
  final _nameCtrl   = TextEditingController();
  final _issuerCtrl = TextEditingController();

  @override
  void dispose() { _nameCtrl.dispose(); _issuerCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, Sp.s7),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const _FieldLabel('Certificate name'),
        const SizedBox(height: Sp.s2),
        _Input(ctrl: _nameCtrl, hint: 'e.g. AWS Cloud Practitioner'),
        const SizedBox(height: Sp.s4),

        const _FieldLabel('Issuing organisation'),
        const SizedBox(height: Sp.s2),
        _Input(ctrl: _issuerCtrl, hint: 'e.g. Amazon Web Services'),
        const SizedBox(height: Sp.s6),

        _PrimaryBtn(
          label: 'Save & Continue',
          loading: widget.state.loading,
          onPressed: () => widget.notifier.saveCertificate(
            name:   _nameCtrl.text,
            issuer: _issuerCtrl.text,
          ),
        ),
      ]),
    );
  }
}

// ── Step 5 — Work Experience ──────────────────────────────────────────────────

class _Step5WorkExperience extends StatefulWidget {
  final OnboardingState state;
  final OnboardingNotifier notifier;
  const _Step5WorkExperience({required this.state, required this.notifier, super.key});

  @override
  State<_Step5WorkExperience> createState() => _Step5WorkExperienceState();
}

class _Step5WorkExperienceState extends State<_Step5WorkExperience> {
  final _companyCtrl = TextEditingController();
  final _roleCtrl    = TextEditingController();
  final _startCtrl   = TextEditingController();
  final _endCtrl     = TextEditingController();
  final _descCtrl    = TextEditingController();
  bool  _isCurrent   = false;

  @override
  void dispose() {
    _companyCtrl.dispose(); _roleCtrl.dispose();
    _startCtrl.dispose(); _endCtrl.dispose(); _descCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, Sp.s7),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const _FieldLabel('Company'),
        const SizedBox(height: Sp.s2),
        _Input(ctrl: _companyCtrl, hint: 'e.g. Andela'),
        const SizedBox(height: Sp.s4),

        const _FieldLabel('Role / title'),
        const SizedBox(height: Sp.s2),
        _Input(ctrl: _roleCtrl, hint: 'e.g. Frontend Engineer'),
        const SizedBox(height: Sp.s4),

        Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const _FieldLabel('Start date'),
            const SizedBox(height: Sp.s2),
            _Input(ctrl: _startCtrl, hint: 'MM/YYYY'),
          ])),
          const SizedBox(width: Sp.s3),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const _FieldLabel('End date'),
            const SizedBox(height: Sp.s2),
            _Input(ctrl: _endCtrl, hint: 'MM/YYYY', enabled: !_isCurrent),
          ])),
        ]),

        const SizedBox(height: Sp.s3),

        // Current role toggle
        GestureDetector(
          onTap: () => setState(() => _isCurrent = !_isCurrent),
          child: Row(children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 20, height: 20,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(4),
                color: _isCurrent ? ClimbrColors.brandCyan : Colors.transparent,
                border: Border.all(color: _isCurrent ? ClimbrColors.brandCyan : ClimbrColors.border),
              ),
              child: _isCurrent
                  ? const Icon(Icons.check, size: 14, color: Colors.white)
                  : null,
            ),
            const SizedBox(width: Sp.s2),
            Text('I currently work here', style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary)),
          ]),
        ),

        const SizedBox(height: Sp.s4),

        const _FieldLabel('Description (optional)'),
        const SizedBox(height: Sp.s2),
        TextField(
          controller: _descCtrl,
          maxLines: 4,
          style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
          decoration: InputDecoration(
            hintText: 'What did you build or achieve in this role?',
            hintStyle: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textTertiary),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(Radii.md), borderSide: const BorderSide(color: ClimbrColors.border)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Radii.md), borderSide: const BorderSide(color: ClimbrColors.border)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Radii.md), borderSide: const BorderSide(color: ClimbrColors.brandCyan, width: 1.5)),
            filled: true, fillColor: ClimbrColors.bgPrimary,
            contentPadding: const EdgeInsets.all(Sp.s4),
          ),
        ),

        const SizedBox(height: Sp.s6),
        _PrimaryBtn(
          label: 'Save & Continue',
          loading: widget.state.loading,
          onPressed: () => widget.notifier.saveWorkExperience(
            company: _companyCtrl.text, role: _roleCtrl.text,
            startDate: _startCtrl.text, endDate: _endCtrl.text.isEmpty ? null : _endCtrl.text,
            description: _descCtrl.text.isEmpty ? null : _descCtrl.text,
            isCurrent: _isCurrent,
          ),
        ),
      ]),
    );
  }
}

// ── Step 6 — Skills ───────────────────────────────────────────────────────────

class _Step6Skills extends StatefulWidget {
  final OnboardingState state;
  final OnboardingNotifier notifier;
  const _Step6Skills({required this.state, required this.notifier, super.key});

  @override
  State<_Step6Skills> createState() => _Step6SkillsState();
}

class _Step6SkillsState extends State<_Step6Skills> {
  final _ctrl  = TextEditingController();
  final _chips = <String>[];

  void _add(String text) {
    final parts = text.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty);
    setState(() { _chips.addAll(parts); });
    _ctrl.clear();
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, Sp.s7),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(
          'Type a skill and press comma or Enter to add it.',
          style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary),
        ),
        const SizedBox(height: Sp.s4),

        TextField(
          controller: _ctrl,
          textInputAction: TextInputAction.done,
          onSubmitted: _add,
          onChanged: (v) { if (v.endsWith(',')) _add(v); },
          style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
          decoration: const InputDecoration(
            hintText: 'e.g. Flutter, Python, UI Design…',
            prefixIcon: Icon(Icons.add_circle_outline, size: 18, color: ClimbrColors.textTertiary),
          ),
        ),

        if (_chips.isNotEmpty) ...[
          const SizedBox(height: Sp.s4),
          Wrap(
            spacing: Sp.s2,
            runSpacing: Sp.s2,
            children: _chips.map((c) => _Chip(
              label: c,
              onDelete: () => setState(() => _chips.remove(c)),
            )).toList(),
          ),
        ],

        const SizedBox(height: Sp.s6),
        _PrimaryBtn(
          label: _chips.isEmpty ? 'Skip for now' : 'Save & Continue',
          loading: widget.state.loading,
          onPressed: () => widget.notifier.saveSkills(_chips),
        ),
      ]),
    );
  }
}

// ── Step 7 — Hobbies ──────────────────────────────────────────────────────────

class _Step7Hobbies extends StatefulWidget {
  final OnboardingState state;
  final OnboardingNotifier notifier;
  const _Step7Hobbies({required this.state, required this.notifier, super.key});

  @override
  State<_Step7Hobbies> createState() => _Step7HobbiesState();
}

class _Step7HobbiesState extends State<_Step7Hobbies> {
  final _ctrl  = TextEditingController();
  final _chips = <String>[];

  void _add(String text) {
    final parts = text.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty);
    setState(() { _chips.addAll(parts); });
    _ctrl.clear();
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, Sp.s7),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(
          'Share what you love doing outside of work — helps employers know you better.',
          style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary),
        ),
        const SizedBox(height: Sp.s4),

        TextField(
          controller: _ctrl,
          textInputAction: TextInputAction.done,
          onSubmitted: _add,
          onChanged: (v) { if (v.endsWith(',')) _add(v); },
          style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
          decoration: const InputDecoration(
            hintText: 'e.g. Reading, Football, Photography…',
            prefixIcon: Icon(Icons.favorite_border, size: 18, color: ClimbrColors.textTertiary),
          ),
        ),

        if (_chips.isNotEmpty) ...[
          const SizedBox(height: Sp.s4),
          Wrap(
            spacing: Sp.s2,
            runSpacing: Sp.s2,
            children: _chips.map((c) => _Chip(
              label: c,
              color: ClimbrColors.brandPink,
              onDelete: () => setState(() => _chips.remove(c)),
            )).toList(),
          ),
        ],

        const SizedBox(height: Sp.s6),
        _PrimaryBtn(
          label: _chips.isEmpty ? 'Skip for now' : 'Save & Continue',
          loading: widget.state.loading,
          onPressed: () => widget.notifier.saveHobbies(_chips),
        ),
      ]),
    );
  }
}

// ── Step 8 — Languages ────────────────────────────────────────────────────────

class _Step8Languages extends StatefulWidget {
  final OnboardingState state;
  final OnboardingNotifier notifier;
  const _Step8Languages({required this.state, required this.notifier, super.key});

  @override
  State<_Step8Languages> createState() => _Step8LanguagesState();
}

class _Step8LanguagesState extends State<_Step8Languages> {
  final _langCtrl = TextEditingController();
  String _proficiency = 'conversational';

  static const _levels = ['basic', 'conversational', 'professional', 'native'];

  @override
  void dispose() { _langCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, Sp.s7),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(
          'Almost there! Tell us what languages you speak.',
          style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary),
        ),
        const SizedBox(height: Sp.s6),

        const _FieldLabel('Language'),
        const SizedBox(height: Sp.s2),
        _Input(ctrl: _langCtrl, hint: 'e.g. Yoruba, French, Igbo…'),
        const SizedBox(height: Sp.s4),

        const _FieldLabel('Proficiency'),
        const SizedBox(height: Sp.s2),
        Wrap(
          spacing: Sp.s2,
          runSpacing: Sp.s2,
          children: _levels.map((l) {
            final active = _proficiency == l;
            return GestureDetector(
              onTap: () => setState(() => _proficiency = l),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsets.symmetric(horizontal: Sp.s4, vertical: 10),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(Radii.pill),
                  color: active ? ClimbrColors.brandCyan : ClimbrColors.bgPrimary,
                  border: Border.all(color: active ? ClimbrColors.brandCyan : ClimbrColors.border),
                ),
                child: Text(
                  l[0].toUpperCase() + l.substring(1),
                  style: ClimbrText.label.copyWith(
                    color: active ? Colors.white : ClimbrColors.textSecondary,
                  ),
                ),
              ),
            );
          }).toList(),
        ),

        const SizedBox(height: Sp.s7),

        // Final CTA — more prominent
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(Sp.s5),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(Radii.xl),
            color: ClimbrColors.brandCyan.withValues(alpha: 0.06),
            border: Border.all(color: ClimbrColors.brandCyan.withValues(alpha: 0.2)),
          ),
          child: Column(children: [
            Text(
              "You're all set! 🎉",
              style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: Sp.s2),
            Text(
              "Your profile is ready. Let's find you something great.",
              style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary),
              textAlign: TextAlign.center,
            ),
          ]),
        ),

        const SizedBox(height: Sp.s5),

        _PrimaryBtn(
          label: _langCtrl.text.isEmpty ? 'Finish setup' : 'Save & finish',
          loading: widget.state.loading,
          onPressed: () {
            if (_langCtrl.text.trim().isEmpty) {
              widget.notifier.skipStep();
            } else {
              widget.notifier.saveLanguage(name: _langCtrl.text.trim(), proficiency: _proficiency);
            }
          },
        ),
      ]),
    );
  }
}

// ── Shared chip ───────────────────────────────────────────────────────────────

class _Chip extends StatelessWidget {
  final String label;
  final Color color;
  final VoidCallback onDelete;

  const _Chip({required this.label, this.color = ClimbrColors.brandCyan, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: Sp.s3, vertical: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(Radii.pill),
        color: color.withValues(alpha: 0.08),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Text(label, style: ClimbrText.caption.copyWith(color: color, fontWeight: FontWeight.w600)),
        const SizedBox(width: 4),
        GestureDetector(
          onTap: onDelete,
          child: Icon(Icons.close, size: 13, color: color),
        ),
      ]),
    );
  }
}

// ── Shared text field ─────────────────────────────────────────────────────────

class _Input extends StatelessWidget {
  final TextEditingController ctrl;
  final String hint;
  final TextInputType? inputType;
  final bool enabled;

  const _Input({required this.ctrl, required this.hint, this.inputType, this.enabled = true});

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: ctrl,
      enabled: enabled,
      keyboardType: inputType,
      style: ClimbrText.bodyMd.copyWith(color: enabled ? ClimbrColors.textPrimary : ClimbrColors.textTertiary),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textTertiary),
      ),
    );
  }
}
