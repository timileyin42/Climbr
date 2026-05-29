import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../app/theme/spacing.dart';
import 'discover_provider.dart';

class DiscoverScreen extends ConsumerWidget {
  const DiscoverScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state    = ref.watch(discoverProvider);
    final notifier = ref.read(discoverProvider.notifier);

    return Scaffold(
      backgroundColor: ClimbrColors.bgSecondary,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ──────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, 0),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Discover', style: ClimbrText.h1.copyWith(color: ClimbrColors.textPrimary)),
                        if (!state.loading && state.deck.isNotEmpty)
                          Text(
                            '${state.deck.length} left',
                            style: ClimbrText.bodySm.copyWith(color: ClimbrColors.textTertiary),
                          ).animate(key: ValueKey(state.deck.length))
                              .fadeIn(duration: 200.ms)
                              .slideY(begin: -0.3, end: 0, duration: 200.ms),
                      ],
                    ),
                  ),
                  // Refresh
                  GestureDetector(
                    onTap: notifier.refresh,
                    child: Container(
                      width: 40, height: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: ClimbrColors.bgPrimary,
                        border: Border.all(color: ClimbrColors.border),
                      ),
                      child: const Icon(Icons.refresh_rounded, size: 20, color: ClimbrColors.textSecondary),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: Sp.s4),

            // ── Mode toggle (Jobs / Trainings) ───────────────────────────
            _ModeToggle(
              mode: state.mode,
              onSwitch: notifier.switchMode,
            ).animate().fadeIn(duration: 300.ms),

            const SizedBox(height: Sp.s5),

            // ── Deck area ────────────────────────────────────────────────
            Expanded(
              child: state.loading
                  ? const _DeckSkeleton()
                  : state.error != null
                      ? _ErrorView(error: state.error!, onRetry: notifier.refresh)
                      : state.empty || state.deck.isEmpty
                          ? _EmptyView(onRefresh: notifier.refresh)
                          : _SwipeDeck(
                              items:     state.deck,
                              mode:      state.mode,
                              onSwipeLeft:  () => notifier.dismissTop(saved: false),
                              onSwipeRight: () => notifier.dismissTop(saved: true),
                            ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Mode toggle ────────────────────────────────────────────────────────────────

class _ModeToggle extends StatelessWidget {
  final DeckMode mode;
  final ValueChanged<DeckMode> onSwitch;
  const _ModeToggle({required this.mode, required this.onSwitch});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: Sp.s6),
      height: 44,
      decoration: BoxDecoration(
        color: ClimbrColors.bgTertiary,
        borderRadius: BorderRadius.circular(Radii.pill),
      ),
      child: Row(
        children: DeckMode.values.map((m) {
          final active = m == mode;
          return Expanded(
            child: GestureDetector(
              onTap: () => onSwitch(m),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 220),
                curve: Curves.easeOutCubic,
                margin: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: active ? ClimbrColors.bgPrimary : Colors.transparent,
                  borderRadius: BorderRadius.circular(Radii.pill),
                  boxShadow: active
                      ? [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 8, offset: const Offset(0, 2))]
                      : null,
                ),
                child: Center(
                  child: Text(
                    m == DeckMode.jobs ? 'Jobs' : 'Trainings',
                    style: ClimbrText.label.copyWith(
                      color: active ? ClimbrColors.textPrimary : ClimbrColors.textTertiary,
                    ),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ── Swipe deck ────────────────────────────────────────────────────────────────

class _SwipeDeck extends StatelessWidget {
  final List<DeckItem> items;
  final DeckMode       mode;
  final VoidCallback   onSwipeLeft;
  final VoidCallback   onSwipeRight;

  const _SwipeDeck({
    required this.items,
    required this.mode,
    required this.onSwipeLeft,
    required this.onSwipeRight,
  });

  @override
  Widget build(BuildContext context) {
    final visible = items.take(3).toList();

    return Column(
      children: [
        // ── Card stack ─────────────────────────────────────────────────
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: Sp.s5),
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Back card (scale 0.90, offset 16px down)
                if (visible.length >= 3)
                  _StaticCard(item: visible[2], scale: 0.90, yOffset: 16),

                // Middle card (scale 0.95, offset 8px down)
                if (visible.length >= 2)
                  _StaticCard(item: visible[1], scale: 0.95, yOffset: 8),

                // Front card — draggable
                _DraggableCard(
                  key: ValueKey(visible.first.id),
                  item:         visible.first,
                  mode:         mode,
                  onSwipeLeft:  onSwipeLeft,
                  onSwipeRight: onSwipeRight,
                ),
              ],
            ),
          ),
        ),

        // ── Action buttons ─────────────────────────────────────────────
        Padding(
          padding: const EdgeInsets.fromLTRB(Sp.s6, Sp.s5, Sp.s6, 96),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _ActionBtn(
                icon: Icons.close_rounded,
                color: ClimbrColors.brandPink,
                onTap: onSwipeLeft,
              ),
              const SizedBox(width: Sp.s7),
              _ActionBtn(
                icon: Icons.bookmark_add_outlined,
                color: ClimbrColors.brandCyan,
                onTap: onSwipeRight,
                large: true,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ── Static background card ────────────────────────────────────────────────────

class _StaticCard extends StatelessWidget {
  final DeckItem item;
  final double   scale;
  final double   yOffset;
  const _StaticCard({required this.item, required this.scale, required this.yOffset});

  @override
  Widget build(BuildContext context) {
    return Transform.translate(
      offset: Offset(0, yOffset),
      child: Transform.scale(
        scale: scale,
        child: _CardBody(item: item, dragX: 0),
      ),
    );
  }
}

// ── Draggable front card ──────────────────────────────────────────────────────

class _DraggableCard extends StatefulWidget {
  final DeckItem     item;
  final DeckMode     mode;
  final VoidCallback onSwipeLeft;
  final VoidCallback onSwipeRight;

  const _DraggableCard({
    super.key,
    required this.item,
    required this.mode,
    required this.onSwipeLeft,
    required this.onSwipeRight,
  });

  @override
  State<_DraggableCard> createState() => _DraggableCardState();
}

class _DraggableCardState extends State<_DraggableCard>
    with SingleTickerProviderStateMixin {
  double _dx = 0, _dy = 0;
  bool _throwing = false;

  late final AnimationController _ctrl;
  late Animation<Offset> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 500));
    _anim = Tween<Offset>(begin: Offset.zero, end: Offset.zero).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.elasticOut),
    );
    _ctrl.addListener(() {
      if (!_throwing) setState(() { _dx = _anim.value.dx; _dy = _anim.value.dy; });
    });
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  void _onPanUpdate(DragUpdateDetails d) {
    if (_throwing) return;
    setState(() { _dx += d.delta.dx; _dy += d.delta.dy; });

    // Haptic at threshold crossing
    final w = MediaQuery.sizeOf(context).width;
    final thr = w * 0.40;
    if (_dx.abs() > thr && _dx.abs() - d.delta.dx.abs() <= thr) {
      HapticFeedback.lightImpact();
    }
  }

  void _onPanEnd(DragEndDetails d) {
    if (_throwing) return;
    final w   = MediaQuery.sizeOf(context).width;
    final thr = w * 0.40;
    final vel = d.velocity.pixelsPerSecond.dx;

    final shouldThrow = _dx.abs() > thr || vel.abs() > 800;
    if (shouldThrow) {
      _throwCard(vel);
    } else {
      _springBack();
    }
  }

  void _springBack() {
    _anim = Tween<Offset>(
      begin: Offset(_dx, _dy),
      end:   Offset.zero,
    ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.elasticOut));
    _ctrl.forward(from: 0);
  }

  void _throwCard(double velocityX) {
    _throwing = true;
    final w   = MediaQuery.sizeOf(context).width;
    final dir = (_dx > 0 || velocityX > 0) ? 1.0 : -1.0;

    HapticFeedback.mediumImpact();

    final throwAnim = Tween<Offset>(
      begin: Offset(_dx, _dy),
      end:   Offset(dir * w * 2, _dy + 100),
    ).animate(CurvedAnimation(
      parent: _ctrl,
      curve:  Curves.easeOutCubic,
    ));

    _ctrl.duration = const Duration(milliseconds: 280);
    _ctrl.addListener(() => setState(() {
      _dx = throwAnim.value.dx;
      _dy = throwAnim.value.dy;
    }));

    _ctrl.forward(from: 0).then((_) {
      if (dir > 0) {
        widget.onSwipeRight();
      } else {
        widget.onSwipeLeft();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final w     = MediaQuery.sizeOf(context).width;
    final angle = (_dx / w) * 0.25;
    // Overlay opacity ramps from 60px to 160px
    final raw   = ((_dx.abs() - 60) / 100).clamp(0.0, 1.0);
    final isRight = _dx > 0;

    return GestureDetector(
      onPanUpdate: _onPanUpdate,
      onPanEnd:    _onPanEnd,
      child: Transform.translate(
        offset: Offset(_dx, _dy),
        child: Transform.rotate(
          angle: angle,
          child: Stack(
            children: [
              // Card body
              _CardBody(item: widget.item, dragX: _dx),

              // Right overlay (cyan — Bookmark)
              if (raw > 0 && isRight)
                Positioned.fill(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(Radii.xl2),
                    child: Container(
                      color: ClimbrColors.brandCyan.withValues(alpha: raw * 0.5),
                      alignment: Alignment.topLeft,
                      padding: const EdgeInsets.all(Sp.s5),
                      child: Opacity(
                        opacity: raw,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.bookmark_added_rounded, color: Colors.white, size: 36),
                            const SizedBox(height: Sp.s2),
                            Text(
                              'Bookmark ${widget.mode == DeckMode.jobs ? 'Job' : 'Training'}\nfor later',
                              style: ClimbrText.h3.copyWith(color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),

              // Left overlay (pink — Skip)
              if (raw > 0 && !isRight)
                Positioned.fill(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(Radii.xl2),
                    child: Container(
                      color: ClimbrColors.brandPink.withValues(alpha: raw * 0.5),
                      alignment: Alignment.topRight,
                      padding: const EdgeInsets.all(Sp.s5),
                      child: Opacity(
                        opacity: raw,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const Icon(Icons.close_rounded, color: Colors.white, size: 36),
                            const SizedBox(height: Sp.s2),
                            Text(
                              'Skip ${widget.mode == DeckMode.jobs ? 'Job Post' : 'Training'}',
                              style: ClimbrText.h3.copyWith(color: Colors.white),
                              textAlign: TextAlign.right,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Card body ─────────────────────────────────────────────────────────────────

class _CardBody extends StatelessWidget {
  final DeckItem item;
  final double   dragX;
  const _CardBody({required this.item, required this.dragX});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: ClimbrColors.bgPrimary,
        borderRadius: BorderRadius.circular(Radii.xl2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Banner image area ────────────────────────────────────────
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(Radii.xl2)),
            child: Container(
              height: 180,
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end:   Alignment.bottomRight,
                  colors: [Color(0xFFE6F7FB), Color(0xFFC8EBEF)],
                ),
              ),
              child: Stack(
                children: [
                  // Subtle watermark letter
                  Positioned(
                    right: -20, bottom: -20,
                    child: Text(
                      item.provider.isNotEmpty ? item.provider[0].toUpperCase() : '?',
                      style: const TextStyle(
                        fontFamily: 'Inter', fontSize: 120,
                        fontWeight: FontWeight.w800,
                        color: Color(0x120CC0DF),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Card content ─────────────────────────────────────────────
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(Sp.s4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badge row
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: ClimbrColors.brandOrangeSoft,
                          borderRadius: BorderRadius.circular(Radii.pill),
                        ),
                        child: Text(
                          item.typeLabel,
                          style: ClimbrText.caption.copyWith(
                            color: ClimbrColors.brandOrange,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      if (item.timeAgo.isNotEmpty) ...[
                        const SizedBox(width: Sp.s2),
                        Text(item.timeAgo, style: ClimbrText.caption.copyWith(color: ClimbrColors.textTertiary)),
                      ],
                      const Spacer(),
                      // Save heart — filled when dragging right
                      Icon(
                        dragX > 40 ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                        size: 20,
                        color: dragX > 40 ? ClimbrColors.brandCyan : ClimbrColors.textTertiary,
                      ),
                    ],
                  ),

                  const SizedBox(height: Sp.s3),

                  // Title + logo
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary, height: 1.2),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              item.provider,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: ClimbrText.bodySm.copyWith(color: ClimbrColors.brandCyan),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: Sp.s3),
                      // Logo initial
                      Container(
                        width: 40, height: 40,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: ClimbrColors.brandCyanSoft,
                          border: Border.all(color: ClimbrColors.brandCyan.withValues(alpha: 0.25)),
                        ),
                        child: Center(
                          child: Text(
                            item.provider.isNotEmpty ? item.provider[0].toUpperCase() : '?',
                            style: ClimbrText.label.copyWith(color: ClimbrColors.brandCyan),
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Description
                  if (item.description != null && item.description!.isNotEmpty) ...[
                    const SizedBox(height: Sp.s2),
                    Text(
                      item.description!,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary),
                    ),
                  ],

                  const Spacer(),

                  // Footer: location + salary
                  Row(
                    children: [
                      if (item.location.isNotEmpty) ...[
                        const Icon(Icons.location_on_outlined, size: 14, color: ClimbrColors.textTertiary),
                        const SizedBox(width: 3),
                        Expanded(
                          child: Text(
                            item.location,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: ClimbrText.caption.copyWith(color: ClimbrColors.textSecondary),
                          ),
                        ),
                      ],
                      if (item.salary.isNotEmpty) ...[
                        const SizedBox(width: Sp.s2),
                        Text(item.salary, style: ClimbrText.caption.copyWith(color: ClimbrColors.textSecondary, fontWeight: FontWeight.w600)),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Action buttons ────────────────────────────────────────────────────────────

class _ActionBtn extends StatelessWidget {
  final IconData   icon;
  final Color      color;
  final VoidCallback onTap;
  final bool       large;
  const _ActionBtn({required this.icon, required this.color, required this.onTap, this.large = false});

  @override
  Widget build(BuildContext context) {
    final size = large ? 64.0 : 52.0;
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: Container(
        width: size, height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: ClimbrColors.bgPrimary,
          border: Border.all(color: color.withValues(alpha: 0.3), width: 1.5),
          boxShadow: [
            BoxShadow(color: color.withValues(alpha: 0.15), blurRadius: 12, offset: const Offset(0, 4)),
          ],
        ),
        child: Icon(icon, color: color, size: large ? 28 : 22),
      ),
    );
  }
}

// ── Empty / skeleton / error states ──────────────────────────────────────────

class _EmptyView extends StatelessWidget {
  final VoidCallback onRefresh;
  const _EmptyView({required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: Sp.s6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: ClimbrColors.brandCyanSoft,
              ),
              child: const Icon(Icons.done_all_rounded, size: 40, color: ClimbrColors.brandCyan),
            )
                .animate(onPlay: (c) => c.repeat(reverse: true))
                .moveY(begin: 0, end: -6, duration: 2400.ms, curve: Curves.easeInOut),
            const SizedBox(height: Sp.s4),
            Text("You've seen everything!", style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
            const SizedBox(height: Sp.s2),
            Text(
              'Check back later for new listings, or refresh to reload.',
              style: ClimbrText.bodyMd.copyWith(color: ClimbrColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: Sp.s5),
            SizedBox(
              width: 160, height: 48,
              child: ElevatedButton(
                onPressed: onRefresh,
                child: const Text('Refresh', style: TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DeckSkeleton extends StatelessWidget {
  const _DeckSkeleton();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: Sp.s5),
      child: Container(
        decoration: BoxDecoration(
          color: ClimbrColors.bgPrimary,
          borderRadius: BorderRadius.circular(Radii.xl2),
          border: Border.all(color: ClimbrColors.border),
        ),
      ).animate(onPlay: (c) => c.repeat(reverse: true))
          .shimmer(duration: 1200.ms, color: ClimbrColors.bgTertiary),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;
  const _ErrorView({required this.error, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.wifi_off_rounded, size: 56, color: ClimbrColors.textTertiary),
          const SizedBox(height: Sp.s3),
          Text('Could not load', style: ClimbrText.h3.copyWith(color: ClimbrColors.textPrimary)),
          const SizedBox(height: Sp.s5),
          SizedBox(
            width: 140, height: 46,
            child: ElevatedButton(onPressed: onRetry, child: const Text('Retry')),
          ),
        ],
      ),
    );
  }
}
