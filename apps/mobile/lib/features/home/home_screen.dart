import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import '../dashboard/dashboard_screen.dart';
import '../discover/discover_screen.dart';
import '../saved_tab/saved_screen.dart';
import '../applications_tab/applications_screen.dart';
import '../messages_tab/messages_screen.dart';
import '../profile_tab/profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  int _tab = 0;

  static const _tabs = [
    _TabItem(icon: Icons.home_outlined,        activeIcon: Icons.home_rounded,           label: 'Home'),
    _TabItem(icon: Icons.style_outlined,       activeIcon: Icons.style_rounded,          label: 'Discover'),
    _TabItem(icon: Icons.bookmark_border,      activeIcon: Icons.bookmark_rounded,       label: 'Saved'),
    _TabItem(icon: Icons.folder_open_outlined, activeIcon: Icons.folder_rounded,         label: 'Applied'),
    _TabItem(icon: Icons.chat_bubble_outline,  activeIcon: Icons.chat_bubble_rounded,    label: 'Chat'),
    _TabItem(icon: Icons.person_outline,       activeIcon: Icons.person_rounded,         label: 'Profile'),
  ];

  static const _screens = [
    DashboardScreen(),
    DiscoverScreen(),
    SavedScreen(),
    ApplicationsScreen(),
    MessagesScreen(),
    ProfileScreen(),
  ];

  void _onTap(int i) {
    if (_tab == i) return;
    setState(() => _tab = i);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: Stack(
        children: [
          // ── Tab content ─────────────────────────────────────────────────
          AnimatedSwitcher(
            duration: 220.ms,
            transitionBuilder: (child, anim) => FadeTransition(opacity: anim, child: child),
            child: KeyedSubtree(key: ValueKey(_tab), child: _screens[_tab]),
          ),

          // ── Floating bottom nav ─────────────────────────────────────────
          Positioned(
            left: Sp.s5, right: Sp.s5, bottom: Sp.s7,
            child: _FloatingNav(
              tabs:    _tabs,
              current: _tab,
              onTap:   _onTap,
            ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.3, end: 0, duration: 500.ms, curve: Curves.easeOutCubic),
          ),
        ],
      ),
    );
  }
}

// ── Floating nav widget ───────────────────────────────────────────────────────

class _FloatingNav extends StatelessWidget {
  final List<_TabItem> tabs;
  final int            current;
  final ValueChanged<int> onTap;

  const _FloatingNav({required this.tabs, required this.current, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(Radii.xl2),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          height: 64,
          decoration: BoxDecoration(
            color: ClimbrColors.brandNavy.withValues(alpha: 0.92),
            borderRadius: BorderRadius.circular(Radii.xl2),
            border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            boxShadow: [
              BoxShadow(
                color: ClimbrColors.brandNavy.withValues(alpha: 0.4),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            children: List.generate(tabs.length, (i) {
              final active = i == current;
              return Expanded(
                child: GestureDetector(
                  onTap: () => onTap(i),
                  behavior: HitTestBehavior.opaque,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    curve: Curves.easeOutCubic,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 200),
                          child: Icon(
                            active ? tabs[i].activeIcon : tabs[i].icon,
                            key: ValueKey(active),
                            size: 22,
                            color: active ? ClimbrColors.brandCyan : Colors.white.withValues(alpha: 0.4),
                          ),
                        ),
                        const SizedBox(height: 2),
                        AnimatedDefaultTextStyle(
                          duration: const Duration(milliseconds: 200),
                          style: ClimbrText.caption.copyWith(
                            color: active ? ClimbrColors.brandCyan : Colors.white.withValues(alpha: 0.4),
                            fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                          ),
                          child: Text(tabs[i].label),
                        ),
                        // Active dot indicator
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          width: active ? 4 : 0,
                          height: active ? 4 : 0,
                          margin: const EdgeInsets.only(top: 2),
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: ClimbrColors.brandCyan,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

// ── Tab model ─────────────────────────────────────────────────────────────────

class _TabItem {
  final IconData icon;
  final IconData activeIcon;
  final String   label;
  const _TabItem({required this.icon, required this.activeIcon, required this.label});
}
