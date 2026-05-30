import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import '../auth/auth_provider.dart';
import 'profile_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  int _section = 0; // 0=Profile, 1=Security, 2=Notifications

  @override
  Widget build(BuildContext context) {
    final state    = ref.watch(profileViewProvider);
    final notifier = ref.read(profileViewProvider.notifier);
    final p        = state.profile;

    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ──────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, 0),
              child: Row(children: [
                GestureDetector(
                  onTap: () => context.pop(),
                  child: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: ClimbrColors.textPrimary),
                ),
                const SizedBox(width: Sp.s3),
                Text('Settings', style: ClimbrText.h2.copyWith(color: ClimbrColors.textPrimary)),
              ]),
            ).animate().fadeIn(duration: 300.ms),

            const SizedBox(height: Sp.s4),

            // ── Section tabs ─────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: Sp.s5),
              child: Container(
                height: 44,
                decoration: BoxDecoration(color: ClimbrColors.bgTertiary, borderRadius: BorderRadius.circular(Radii.pill)),
                child: Row(
                  children: List.generate(
                    3,
                    (i) {
                      const labels = ['Profile', 'Security', 'Notifications'];
                      return Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _section = i),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            margin: const EdgeInsets.all(3),
                            decoration: BoxDecoration(
                              color: _section == i ? ClimbrColors.bgPrimary : Colors.transparent,
                              borderRadius: BorderRadius.circular(Radii.pill),
                              boxShadow: _section == i
                                  ? [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 8, offset: const Offset(0, 2))]
                                  : null,
                            ),
                            child: Center(
                              child: Text(
                                labels[i],
                                style: ClimbrText.caption.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: _section == i ? ClimbrColors.textPrimary : ClimbrColors.textTertiary,
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),

            const SizedBox(height: Sp.s5),

            Expanded(
              child: AnimatedSwitcher(
                duration: 220.ms,
                transitionBuilder: (child, anim) => FadeTransition(opacity: anim, child: child),
                child: _section == 0
                    ? _ProfileSection(key: const ValueKey(0), p: p, notifier: notifier, saving: state.saving)
                    : _section == 1
                        ? _SecuritySection(key: const ValueKey(1), notifier: notifier, saving: state.saving)
                        : _NotificationsSection(key: const ValueKey(2)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Profile section ───────────────────────────────────────────────────────────

class _ProfileSection extends ConsumerStatefulWidget {
  final dynamic    p;
  final ProfileViewNotifier notifier;
  final bool       saving;
  const _ProfileSection({super.key, required this.p, required this.notifier, required this.saving});

  @override
  ConsumerState<_ProfileSection> createState() => _ProfileSectionState();
}

class _ProfileSectionState extends ConsumerState<_ProfileSection> {
  final _firstCtrl = TextEditingController();
  final _lastCtrl  = TextEditingController();
  bool _initialised = false;

  @override
  void didUpdateWidget(_ProfileSection old) {
    super.didUpdateWidget(old);
    if (!_initialised && widget.p != null) {
      _firstCtrl.text = widget.p.firstName ?? '';
      _lastCtrl.text  = widget.p.lastName  ?? '';
      _initialised = true;
    }
  }

  @override
  void initState() {
    super.initState();
    if (widget.p != null) {
      _firstCtrl.text = widget.p.firstName ?? '';
      _lastCtrl.text  = widget.p.lastName  ?? '';
      _initialised = true;
    }
  }

  @override
  void dispose() { _firstCtrl.dispose(); _lastCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar placeholder strip
          Container(
            padding: const EdgeInsets.all(Sp.s4),
            decoration: BoxDecoration(
              color: ClimbrColors.bgPrimary,
              borderRadius: BorderRadius.circular(Radii.xl),
              border: Border.all(color: ClimbrColors.border),
            ),
            child: Row(children: [
              Container(
                width: 56, height: 56,
                decoration: const BoxDecoration(shape: BoxShape.circle, color: ClimbrColors.brandCyan),
                child: Center(
                  child: Text(
                    widget.p?.firstName?.isNotEmpty == true ? widget.p.firstName[0].toUpperCase() : '?',
                    style: ClimbrText.h3.copyWith(color: Colors.white),
                  ),
                ),
              ),
              const SizedBox(width: Sp.s3),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Profile photo', style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary)),
                  Text('Photo upload coming in Batch 10', style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary)),
                ]),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: Sp.s3, vertical: 6),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(Radii.pill),
                  border: Border.all(color: ClimbrColors.border),
                ),
                child: Text('Change', style: ClimbrText.caption.copyWith(color: ClimbrColors.textSecondary)),
              ),
            ]),
          ),

          const SizedBox(height: Sp.s4),

          // Name fields
          Container(
            padding: const EdgeInsets.all(Sp.s5),
            decoration: BoxDecoration(
              color: ClimbrColors.bgPrimary,
              borderRadius: BorderRadius.circular(Radii.xl),
              border: Border.all(color: ClimbrColors.border),
            ),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Personal details', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
              const SizedBox(height: Sp.s4),

              Row(children: [
                Expanded(child: _Field(label: 'First name', ctrl: _firstCtrl, hint: 'Ada')),
                const SizedBox(width: Sp.s3),
                Expanded(child: _Field(label: 'Last name',  ctrl: _lastCtrl,  hint: 'Okonkwo')),
              ]),

              const SizedBox(height: Sp.s4),

              // Email read-only
              Text('Email', style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary)),
              const SizedBox(height: Sp.s2),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: Sp.s4, vertical: 14),
                decoration: BoxDecoration(
                  color: ClimbrColors.bgSecondary,
                  borderRadius: BorderRadius.circular(Radii.md),
                  border: Border.all(color: ClimbrColors.border),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(widget.p?.email ?? '', style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textTertiary)),
                  const SizedBox(height: 2),
                  Text('Contact support to change your email', style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary)),
                ]),
              ),

              const SizedBox(height: Sp.s4),

              // CV / Resume upload
              _ResumeUploadRow(),

              const SizedBox(height: Sp.s5),

              SizedBox(
                width: double.infinity, height: 50,
                child: ElevatedButton(
                  onPressed: widget.saving ? null : () async {
                    final ok = await widget.notifier.updateName(
                      first: _firstCtrl.text.trim(),
                      last:  _lastCtrl.text.trim(),
                    );
                    if (ok && context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: const Text('Profile updated'),
                          backgroundColor: ClimbrColors.statusAccepted,
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Radii.md)),
                        ),
                      );
                    }
                  },
                  child: widget.saving
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Save Changes', style: TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w700)),
                ),
              ),
            ]),
          ),
        ],
      ),
    );
  }
}

// ── Security section ──────────────────────────────────────────────────────────

class _SecuritySection extends ConsumerStatefulWidget {
  final ProfileViewNotifier notifier;
  final bool saving;
  const _SecuritySection({super.key, required this.notifier, required this.saving});

  @override
  ConsumerState<_SecuritySection> createState() => _SecuritySectionState();
}

class _SecuritySectionState extends ConsumerState<_SecuritySection> {
  final _curCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _cfmCtrl = TextEditingController();
  bool _obscureCur = true, _obscureNew = true, _obscureCfm = true;
  String? _localErr;

  @override
  void dispose() { _curCtrl.dispose(); _newCtrl.dispose(); _cfmCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, 100),
      child: Container(
        padding: const EdgeInsets.all(Sp.s5),
        decoration: BoxDecoration(
          color: ClimbrColors.bgPrimary,
          borderRadius: BorderRadius.circular(Radii.xl),
          border: Border.all(color: ClimbrColors.border),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Change Password', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
          const SizedBox(height: Sp.s4),

          _PasswordField(label: 'Current password', ctrl: _curCtrl, obscure: _obscureCur,
            onToggle: () => setState(() => _obscureCur = !_obscureCur)),
          const SizedBox(height: Sp.s4),

          _PasswordField(label: 'New password', ctrl: _newCtrl, obscure: _obscureNew,
            onToggle: () => setState(() => _obscureNew = !_obscureNew)),
          const SizedBox(height: Sp.s4),

          _PasswordField(label: 'Confirm new password', ctrl: _cfmCtrl, obscure: _obscureCfm,
            onToggle: () => setState(() => _obscureCfm = !_obscureCfm)),

          if (_localErr != null) ...[
            const SizedBox(height: Sp.s3),
            Text(_localErr!, style: ClimbrText.bodySm.copyWith(color: ClimbrColors.statusRejected)),
          ],

          const SizedBox(height: Sp.s5),

          SizedBox(
            width: double.infinity, height: 50,
            child: ElevatedButton(
              onPressed: widget.saving ? null : _submit,
              child: widget.saving
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Update Password', style: TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w700)),
            ),
          ),

          const SizedBox(height: Sp.s5),

          const Divider(),

          const SizedBox(height: Sp.s4),

          // Sign out
          GestureDetector(
            onTap: () async {
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) context.go('/welcome');
            },
            child: Row(children: [
              const Icon(Icons.logout_rounded, size: 20, color: ClimbrColors.statusRejected),
              const SizedBox(width: Sp.s3),
              Text('Sign out', style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.statusRejected, fontWeight: FontWeight.w600)),
            ]),
          ),
        ]),
      ),
    );
  }

  Future<void> _submit() async {
    setState(() => _localErr = null);
    if (_newCtrl.text != _cfmCtrl.text) {
      setState(() => _localErr = 'Passwords do not match');
      return;
    }
    if (_newCtrl.text.length < 8) {
      setState(() => _localErr = 'Password must be at least 8 characters');
      return;
    }
    final ok = await widget.notifier.changePassword(current: _curCtrl.text, newPw: _newCtrl.text);
    if (ok && mounted) {
      _curCtrl.clear(); _newCtrl.clear(); _cfmCtrl.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Password updated'),
          backgroundColor: ClimbrColors.statusAccepted,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Radii.md)),
        ),
      );
    }
  }
}

// ── Notifications section ─────────────────────────────────────────────────────

class _NotificationsSection extends StatefulWidget {
  const _NotificationsSection({super.key});

  @override
  State<_NotificationsSection> createState() => _NotificationsSectionState();
}

class _NotificationsSectionState extends State<_NotificationsSection> {
  final Map<String, bool> _enabled = {
    'Job Updates':                       true,
    'Training Alerts':                   true,
    'Application Status Updates':        true,
    'Saved Job & Training Reminders':    false,
    'System Notifications':              true,
  };

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(Sp.s5, 0, Sp.s5, 100),
      child: Container(
        decoration: BoxDecoration(
          color: ClimbrColors.bgPrimary,
          borderRadius: BorderRadius.circular(Radii.xl),
          border: Border.all(color: ClimbrColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(Sp.s5, Sp.s5, Sp.s5, Sp.s3),
              child: Text('Notification preferences', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
            ),
            ..._enabled.entries.map((e) {
              return Column(
                children: [
                  const Divider(height: 1, indent: Sp.s5, endIndent: Sp.s5),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: Sp.s5, vertical: Sp.s4),
                    child: Row(children: [
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(e.key, style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary)),
                          Text('In-app + email', style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary)),
                        ]),
                      ),
                      Switch(
                        value: e.value,
                        onChanged: (v) => setState(() => _enabled[e.key] = v),
                        activeThumbColor: ClimbrColors.brandCyan,
                        trackColor: WidgetStateProperty.resolveWith((s) =>
                          s.contains(WidgetState.selected)
                            ? ClimbrColors.brandCyanSoft
                            : ClimbrColors.bgTertiary),
                      ),
                    ]),
                  ),
                ],
              );
            }),
            const SizedBox(height: Sp.s3),
          ],
        ),
      ),
    );
  }
}

// ── Shared widgets ────────────────────────────────────────────────────────────

class _Field extends StatelessWidget {
  final String label;
  final TextEditingController ctrl;
  final String hint;
  const _Field({required this.label, required this.ctrl, required this.hint});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary)),
        const SizedBox(height: Sp.s2),
        TextField(
          controller: ctrl,
          style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
          textCapitalization: TextCapitalization.words,
          decoration: InputDecoration(hintText: hint),
        ),
      ],
    );
  }
}

class _PasswordField extends StatelessWidget {
  final String label;
  final TextEditingController ctrl;
  final bool obscure;
  final VoidCallback onToggle;
  const _PasswordField({required this.label, required this.ctrl, required this.obscure, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary)),
        const SizedBox(height: Sp.s2),
        TextField(
          controller: ctrl,
          obscureText: obscure,
          style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textPrimary),
          decoration: InputDecoration(
            hintText: '••••••••',
            suffixIcon: GestureDetector(
              onTap: onToggle,
              child: Icon(obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                size: 18, color: ClimbrColors.textTertiary),
            ),
          ),
        ),
      ],
    );
  }
}

// ── Resume upload row (file_picker pending DKImagePickerController fix) ───────

class _ResumeUploadRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('CV / Resume', style: ClimbrText.label.copyWith(color: ClimbrColors.textPrimary)),
        const SizedBox(height: Sp.s2),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: Sp.s4, vertical: 14),
          decoration: BoxDecoration(
            color: ClimbrColors.bgSecondary,
            borderRadius: BorderRadius.circular(Radii.md),
            border: Border.all(color: ClimbrColors.border),
          ),
          child: Row(children: [
            const Icon(Icons.upload_file_outlined, size: 18, color: ClimbrColors.textTertiary),
            const SizedBox(width: Sp.s2),
            Expanded(
              child: Text(
                'PDF or DOC upload coming soon',
                style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textTertiary),
              ),
            ),
            Text('Upload', style: ClimbrText.label.copyWith(color: ClimbrColors.textTertiary)),
          ]),
        ),
      ],
    );
  }
}
