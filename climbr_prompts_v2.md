# Climbr — Claude Code Project Prompts (v2)

> Phase 1 (backend) is unchanged from v1 — use that as-is.
> **This document replaces the Phase 2 (Flutter) prompt** with one grounded in the actual Figma export. Real hex values, real component anatomy, real interaction states.

---

## 📌 Phase 2 — Flutter Mobile App for Climbr

**Paste into Claude Code from inside a fresh directory. Make sure Phase 1 backend is finished, deployed (or running locally), and `openapi.json` + `MOBILE_API_CONTRACT.md` exist.**

---

You are building **Climbr** — the mobile app for a career platform that connects young African talent with jobs and training programs through a swipeable, Tinder-style discovery flow.

The original product was a web app called iRxcruit. The backend (FastAPI, multi-role: Talent / Employer / Trainer / Admin) is complete and renamed to Climbr. This mobile app targets **Talents only**. Employer/Trainer/Admin will remain web-only — gracefully redirect those users if they sign in on mobile.

The web Figma design is the visual source of truth. Your job is to translate it into a **stunning, modern, motion-rich, dark-mode-capable mobile app** that feels native on iOS and Android, not a port of a web design.

This prompt contains everything you need to start building without guessing. Follow it precisely.

---

## 1. Tech stack — fixed, do not deviate

- **Flutter** stable channel, Dart 3.x, sound null safety
- **State**: `flutter_riverpod` v2 (no Provider, Bloc, or GetX)
- **Routing**: `go_router` with typed routes and auth guards
- **HTTP**: `dio` with interceptors (auth, refresh-on-401, request ID, retry)
- **API types**: generate from `openapi.json` (use `openapi_generator` or hand-write under `lib/data/api/`). No `Map<String, dynamic>` outside `data/`.
- **Local storage**: `flutter_secure_storage` for JWT tokens; `hive` for offline cache of jobs/trainings.
- **Forms**: `flutter_hooks` + manual validation. Prefer simple over framework.
- **Images**: `cached_network_image` with `shimmer` placeholders.
- **Motion**: `flutter_animate` for entry/exit choreography; `rive` if assets exist; otherwise pure `AnimationController` for hero swipe-deck physics (do NOT pull a swipe-cards package — every one of them has rough edges and the design has very specific overlay behavior).
- **Haptics**: `flutter` built-in `HapticFeedback`.
- **Push**: `firebase_messaging` (stub backend registration if not ready).
- **Analytics**: `firebase_analytics`.
- **Crash reports**: `firebase_crashlytics`.
- **Lints**: `very_good_analysis`, strict.
- **Tests**: `flutter_test`, `mocktail`, `integration_test`, `golden_toolkit`.

---

## 2. Design system — extracted from the Figma file

These are the **actual values** from the design. Implement them as Dart constants under `lib/app/theme/`. No magic numbers in widgets.

### 2.1 Brand colors

```dart
// Brand
static const brandCyan       = Color(0xFF0CC0DF);  // primary, CTAs, links, swipe-right
static const brandCyanDark   = Color(0xFF09A6C2);  // pressed/hover
static const brandCyanSoft   = Color(0xFFE6F9FC);  // card surfaces, light backgrounds
static const brandPink       = Color(0xFFEC4899);  // swipe-left, destructive, save heart
static const brandOrange     = Color(0xFFFF8A3D);  // tag chips (Full-Time/Internship), hero accents
static const brandOrangeSoft = Color(0xFFFFE8D6);  // chip background fill
static const brandYellow     = Color(0xFFFFC93C);  // testimonial card, accent
static const brandHotPink    = Color(0xFFFF3D7F);  // testimonial card, hero shape
static const brandNavy       = Color(0xFF0F1A1F);  // dark footer, icon circles in hero
```

### 2.2 Neutrals (light mode)

```dart
static const bgPrimary       = Color(0xFFFFFFFF);  // main surface
static const bgSecondary     = Color(0xFFF7F8FA);  // sidebar/screen background
static const bgTertiary      = Color(0xFFF1F3F5);  // chips, empty states
static const border          = Color(0xFFE5E7EB);  // hairline dividers
static const borderStrong    = Color(0xFFD1D5DB);
static const textPrimary     = Color(0xFF0F1A1F);  // titles
static const textSecondary   = Color(0xFF6B7280);  // body, meta
static const textTertiary    = Color(0xFF9CA3AF);  // placeholders, captions
```

### 2.3 Dark mode (you derive this — design didn't ship one, but it should feel native)

```dart
static const darkBgPrimary   = Color(0xFF0B1014);  // main surface (richer than pure black)
static const darkBgSecondary = Color(0xFF12181D);  // elevated cards
static const darkBgTertiary  = Color(0xFF1A2128);  // chips, inputs
static const darkBorder      = Color(0xFF232C35);
static const darkTextPrimary = Color(0xFFF5F7FA);
static const darkTextSecondary = Color(0xFFA0AAB4);
// Brand cyan stays the same — it pops against dark backgrounds beautifully.
// Soft cyan card surface in dark = Color(0xFF0E2A33).
```

### 2.4 Status colors (used in My Applications badges)

```dart
static const statusInReview    = Color(0xFFFFA63D);  // orange dot + soft bg
static const statusInReviewBg  = Color(0xFFFFF1DE);
static const statusAccepted    = Color(0xFF1FBE6E);  // green
static const statusAcceptedBg  = Color(0xFFDFF7E9);
static const statusShortlisted = Color(0xFF7C5CFF);  // purple
static const statusShortlistedBg = Color(0xFFEBE5FF);
static const statusPending     = Color(0xFF0CC0DF);  // cyan
static const statusPendingBg   = Color(0xFFE6F9FC);
static const statusRejected    = Color(0xFFE5484D);  // red
static const statusRejectedBg  = Color(0xFFFCE4E6);
```

### 2.5 Typography

Primary font: **Inter** (fallback: Plus Jakarta Sans, SF Pro on iOS, Roboto on Android).

| Token | Size | Weight | Line height | Use |
|---|---|---|---|---|
| `displayLg` | 40 | 700 | 1.1 | Onboarding "Your future starts here" |
| `displayMd` | 32 | 700 | 1.15 | Big numerics, dashboard stats |
| `h1` | 28 | 700 | 1.2 | Screen titles ("Dashboard", "Job Listings") |
| `h2` | 22 | 600 | 1.25 | Section headers ("Opportunities You Might Like") |
| `h3` | 18 | 600 | 1.3 | Card titles, modal titles |
| `bodyLg` | 16 | 500 | 1.5 | Primary body |
| `bodyMd` | 14 | 400 | 1.5 | Card descriptions, default body |
| `bodySm` | 13 | 400 | 1.45 | Meta lines (location, salary) |
| `label` | 13 | 600 | 1.3 | Button labels, input labels |
| `caption` | 11 | 500 | 1.3 | Chip labels ("Full-Time", "2hrs ago") |

### 2.6 Spacing scale (4pt grid)

```dart
static const space1  = 4.0;
static const space2  = 8.0;
static const space3  = 12.0;
static const space4  = 16.0;
static const space5  = 20.0;
static const space6  = 24.0;
static const space7  = 32.0;
static const space8  = 40.0;
static const space9  = 48.0;
static const space10 = 64.0;
```

### 2.7 Radii

```dart
static const radiusSm  = 8.0;
static const radiusMd  = 12.0;
static const radiusLg  = 16.0;   // cards
static const radiusXl  = 20.0;   // big cards, modals
static const radius2xl = 28.0;   // hero shapes, mobile cards
static const radiusPill = 999.0; // pill buttons, chips, search bar
```

### 2.8 Elevation / shadows

```dart
// Subtle card lift (default cards)
BoxShadow(color: Color(0x0F0F1A1F), blurRadius: 12, offset: Offset(0, 2)),
// Active/floating (swipe card, modal)
BoxShadow(color: Color(0x1F0F1A1F), blurRadius: 24, offset: Offset(0, 8)),
// Hero/feature (CTA cards)
BoxShadow(color: Color(0x14000000), blurRadius: 40, offset: Offset(0, 16)),
```

### 2.9 Component anatomy reference (read carefully)

**Buttons**
- **Primary**: filled `brandCyan`, white label, radius `radiusPill`, height 48, horizontal padding 24. Pressed state: `brandCyanDark`. Disabled: `brandCyan.withOpacity(0.4)`.
- **Secondary / Outlined**: white fill, 1px `border` stroke, `textPrimary` label, otherwise same dims.
- **Dark CTA** (used for "Find Jobs", "View Saved Jobs" headers): filled `textPrimary` (near-black), white label, pill shape.
- **Destructive link**: `brandPink` text, no fill, "× Remove experience" pattern.
- **Tertiary text button**: cyan label, no fill (e.g. "Save", "View all", "Edit").

**Inputs**
- Single-line: white fill, 1px `border` stroke, radius `radiusMd`, height 48, padding-x 16, label above (13/600), placeholder in `textTertiary`. Focus state: cyan border, no fill change.
- Multi-line: same but min-height 96, padding 16.
- Search bar: pill shape (`radiusPill`), search icon left, optional `⌘+K` hint right (mobile shows mic icon instead).

**Tag chips (Full-Time, Internship, Workshop, Bootcamp, etc.)**
- Background `brandOrangeSoft`, text `brandOrange` (the "Full-Time" / "Internship" pattern), or category-colored.
- Height 24, padding-x 10, radius `radiusPill`, text 11/600.
- Time meta ("2hrs ago", "Starts in 1 week") sits beside it in `textSecondary` 13/400.

**Job/Training card** (the core repeated component)
- Container: white, radius `radiusLg`, border 1px `border` OR shadow (use shadow on mobile for lift), padding 16.
- Image/preview area: top, aspect 16:10, `brandCyanSoft` fallback when no image, radius `radiusMd` on top corners.
- Below image: row with tag chip + time + heart bookmark icon (right).
- Then title (h3) + company logo (right).
- Then provider name (bodySm, `textSecondary`).
- Then description (bodyMd, 2 lines max with ellipsis).
- Footer row: location icon + label / salary icon + value, two columns, bodySm.
- Hover/focus state (mobile = tap-and-hold): cyan border, "Apply Now" pill button reveals over image area in `brandOrangeSoft` with `brandOrange` text.

**Status badges** (My Applications)
- Pill shape, height 22, padding-x 10. Format: small colored dot (4×4) + label.
- Use the `status*` color pairs above.

**Swipe deck card** (HERO component, see §4)
- Card: white, radius `radiusXl`, generous padding 20, shadow medium.
- Header: chip + time + heart.
- Image area: square, `brandCyanSoft` fill.
- Body: title (h3) + company logo, company name, 2-line description, location/salary footer.
- During drag-right past 60px: card overlay tints `brandCyan` with smooth opacity ramp; large white-on-cyan text appears top-left: "Bookmark Job for later" (or "Bookmark Training for later"). Heart icon top-left fills.
- During drag-left past 60px: same but `brandPink` and text reads "Skip Job Post" (or "Skip Training Post").
- Card rotates with drag: `rotation = (dragX / screenWidth) * 0.25` radians, clamped.
- Two cards visible behind at scale 0.95 and 0.9, slight Y offset.

**Modals**
- Centered card on dimmed backdrop (`Colors.black.withOpacity(0.4)`).
- Radius `radiusXl`, padding 24, max-width 360 on mobile.
- Title (h3) + body + actions row (or stacked CTAs for success modals).
- Close X top-right or top-left depending on context.

**Toast / snackbar**
- Bottom card, white surface, cyan check icon + 2-line message, close X.
- Slides up from bottom with spring physics. Auto-dismiss 3s.

**Bottom navigation** (mobile primary navigation — the web uses a sidebar; on mobile this becomes bottom tabs)
- 5 tabs: Dashboard / Discover / Saved / Applications / Profile.
- Active: cyan icon + cyan label. Inactive: `textTertiary`.
- Floating pill style on top of a subtle blur backdrop.

---

## 3. Screens to build — full inventory from the Figma export

Build each one. They're grouped by flow. For every screen, the design source lives in the user's Figma export — names below match the frame names.

### Auth & onboarding
1. **Splash** — animated cyan wordmark, fade to next screen
2. **Welcome / Landing** — translate the web "Your future starts here" hero. Cyan curved background, big display headline, "Sign up" / "Log in" buttons, "Real / Relevant / Future-focused" cards as a horizontal carousel below
3. **Log in** — email + password, "Sign in with Google", forgot password link
4. **Sign up** — name + email + password, "Sign up with Google", existing account link
5. **Email verification** — code input or magic link landing
6. **Forgot password** — email input → success state
7. **Profile build (multi-step)** — Step 1: basics (name, photo, bio) / Step 2: education / Step 3: work experience / Step 4: skills + hobbies + languages / Step 5: done + redirect to Discover

### Dashboard
8. **Dashboard** — greeting, 4 stat cards (Total Applications / Total Trainings / In Review / Shortlisted-Accepted), "Ready to make your next move?" hero CTA card with orange background and dual buttons (Start Training / Find Jobs), Quick Actions list, Featured Jobs horizontal scroll

### Discover (THE hero feature)
9. **Discover / Swipe deck** — tab toggle Jobs/Trainings at top, "X left" counter, card stack, Skip/Save buttons at bottom, drag-to-swipe with overlay states (see §4)
10. **Discover empty state** — "You've seen everything. Refresh or adjust filters."

### Listings
11. **Job Listings — grid view** — search + filter + view-toggle, "Opportunities You Might Like" sections with horizontal-scroll cards
12. **Job Listings — list view** — full-width rows with pagination
13. **Job Listings — filtered** — same with filter chips active
14. **Filters bottom sheet** — Location / Type (Full-time/Hybrid/Contract checkboxes with counts) / Industry, Reset + Apply buttons
15. **Search results** — grouped sections ("Recently Added", "Entry-Level Picks")
16. **Search empty state** — "[Term] isn't on Climbr yet. We'll let you know when a job is up!"
17. **Trainings listings** — same patterns as jobs but with Workshop/Bootcamp chips and Online/Location + Fee/Salary fields

### Detail screens
18. **Job detail** — breadcrumb, company logo, title, company name + verified badge, "Applied On" pill, structured sections (Responsibilities / Requirements / Nice to Have / Work-Life Balance / Flexible Work Format / Culture & Growth / Time Off & Sick Leave / Why Join Us), Employer Info card at bottom, sticky bottom action bar with Apply Now (cyan) / Share (outlined)
19. **Training detail** — same structure but: tags row (Remote / Beginner-friendly / Paid), What You'll Learn / Course Outline / Who Should Join / What You'll Get, Learner Reviews carousel, Training Details side card (Format / Start Date / Duration / Cost / Level / Open Slots)
20. **Share modal** — "Pass it on", 5 icon buttons (Chat / Telegram / WhatsApp / E-mail / More), link copy field
21. **Applied success modal** — "You've applied!" with company + role, "Browse More Jobs" / "View My Applications" CTAs, encouraging tagline

### Saved
22. **Saved Jobs** — grid of cards with filled pink heart, filter + search
23. **Saved Trainings** — same

### My Applications
24. **Applications list** — 4 stat cards on top (Total / In Review / Shortlisted-Accepted / Rejected, with active cyan-border state), tab filter (All / In Review / Accepted / Rejected), search, table-style list with Type / Title / Company / Date / Status / overflow menu
25. **Application detail** — breadcrumb, company logo + title, Applied On + status badge, numbered stepper (Applied → In Review → Waiting for response), full profile snapshot, "What Happens Next" explainer, Job Details side card, View Job Post / Browse More Jobs CTAs
26. **Remove application confirmation modal** — title + message + "Don't show again" checkbox + Cancel / Yes, proceed

### Profile
27. **My Profile (view)** — header with name + role + photo + edit avatar overlay, Saved counts strip ("Saved 4 jobs, 2 trainings"), My Activity pill button, Find Jobs CTA, sections: Summary/Bio / Work Experience / Education / General (Skills, Hobbies, Certificates as removable chips). Each section has Edit link in cyan.
28. **My Profile (edit mode)** — all sections expand to forms, Save (cyan link) per section, "× Remove experience" destructive links, sticky bottom Cancel / Save changes bar
29. **My Profile (more menu)** — Edit profile / Print profile dropdown from ⋯
30. **Profile success toast** — bottom-right "Successful! We've saved your changes."

### Settings
31. **Settings — Profile** — sub-nav (Profile/Security/Notifications), avatar upload (drag-drop area + camera button), First name / Last name / Email fields, Cancel / Save
32. **Settings — Security** — password change, 2FA toggle, active sessions list
33. **Settings — Notifications** — toggles per notification type (Email/Push/SMS × Applications/New matches/Marketing)

### Cross-cutting
34. **Notification center** — bell icon opens slide-down panel with notification rows
35. **Universal empty state pattern** — friendly illustration + 1-line copy + CTA
36. **Universal loading pattern** — skeleton shimmers matching real component shape
37. **Universal error pattern** — sad illustration + reason + Retry button
38. **Offline banner** — top toast "You're offline. Showing cached results."

---

## 4. Motion & micro-interactions — make it stunning

This is what separates a 7/10 build from a 10/10 build. Apply liberally but never gratuitously.

### 4.1 Swipe deck (the hero)
- Drag tracking is 1:1 with finger movement, no easing during drag.
- Rotation: `(dragX / screenWidth) * 0.25 rad` (about ±14° at edge).
- Overlay opacity ramps in from 60px drag to 160px drag, then locks at 1.0.
- Past 40% threshold (or velocity > 800 px/s), card animates off-screen along the drag vector + extra angular momentum. Duration ~280ms with `Curves.easeOutCubic`.
- On release before threshold: spring back with `Curves.elasticOut`, ~500ms.
- Cards behind: scale + Y-offset interpolate as the front card moves (the back card grows into the front position).
- Haptic: light impact on threshold cross; medium impact on commit.
- Tap-to-flip: not required, but tap opens detail with a hero animation (card image becomes the detail header).

### 4.2 Screen transitions
- Tab switches (bottom nav): cross-fade, no horizontal slide. 220ms.
- Push to detail: shared-element hero on the card image + parallax on the page content. 320ms cubic.
- Modal: scale-and-fade from 0.95 → 1.0 with backdrop blur ramp. 240ms.
- Toast: spring-up from bottom with overshoot. 380ms.

### 4.3 List entry animations
- Job/training cards stagger in on first paint: 60ms delay between cards, 240ms fade + 12px Y translate. Don't re-run on scroll.
- Skeleton → real card transition: cross-fade 180ms, never a hard swap.

### 4.4 Button presses
- Scale to 0.97 on press, back to 1.0 on release. 80ms in / 120ms out.
- Light haptic on every primary button press.

### 4.5 Pull-to-refresh
- Custom indicator: cyan circle that morphs from a dot into a spinner as you pull. Don't use the platform default — it breaks the design language.

### 4.6 Empty state illustrations
- Subtle floating animation (Y ±4px, 3s loop, eased).
- If illustration assets aren't ready, use animated emoji or simple SVG shapes with `flutter_animate`.

### 4.7 Stats counters
- Dashboard "0% / Total Applications: 5" numbers count up from 0 on screen entry (400ms, easeOutCubic). Cache so it doesn't re-animate on returning to the tab within the same session.

### 4.8 FAQ-style gradient hover (from the landing page)
- The first FAQ item in the web design has a subtle rainbow gradient stroke on hover. On mobile, apply this to the **expanded** state instead — when an FAQ item is open, the border is a slow-rotating conic gradient (cyan → pink → yellow → cyan).

### 4.9 Splash → Welcome
- Wordmark draws on with a path animation (cyan stroke fills letter by letter), then settles. 1.2s total. Hold 400ms. Fade out 240ms.

### 4.10 Discover counter ("14 left")
- Numbers count down with a flip animation when a card is dismissed. ~200ms each.

---

## 5. Dark mode

Dark mode is not a default-flipped version of light — it's a deliberate redesign. Apply these rules:

- **Backgrounds** invert to `darkBgPrimary` (canvas) and `darkBgSecondary` (cards).
- **Brand cyan** keeps its hex — it shines against dark backgrounds.
- **Soft brand surfaces** (the light-cyan card image placeholders) become `Color(0xFF0E2A33)` — a deep cyan-tinted dark.
- **Orange chips** stay vivid but their background goes from `brandOrangeSoft` to `Color(0xFF3D2A18)`.
- **Pink (skip) and cyan (save) overlays** on swipe stay saturated — they pop hard.
- **Shadows** become subtle glow strokes (1px cyan at low opacity) on key surfaces instead of drop shadows, since dark mode shadows mostly disappear.
- **Hero illustration backgrounds** (orange/pink hero shapes on landing) lose some saturation in dark mode — multiply with `Color(0xFF1A1A1A)` overlay at 0.4.
- **Status badge backgrounds** become 15% opacity of the status color over the dark canvas, not the light pastel.

Implement via `ThemeData.light()` and `ThemeData.dark()` factory methods in `lib/app/theme/theme.dart`. All screens consume `Theme.of(context).extension<ClimbrTokens>()` — no light/dark conditionals in widgets.

---

## 6. Project structure

```
climbr_mobile/
├── lib/
│   ├── main.dart
│   ├── app/
│   │   ├── app.dart
│   │   ├── router.dart
│   │   └── theme/
│   │       ├── colors.dart
│   │       ├── typography.dart
│   │       ├── spacing.dart
│   │       ├── motion.dart            # durations, curves
│   │       ├── tokens.dart            # ThemeExtension<ClimbrTokens>
│   │       └── theme.dart             # light + dark factories
│   ├── core/
│   │   ├── env/
│   │   ├── errors/
│   │   ├── network/                   # dio setup, interceptors
│   │   ├── storage/                   # secure storage, hive boxes
│   │   ├── analytics/
│   │   ├── haptics/
│   │   └── utils/
│   ├── data/
│   │   ├── api/                       # generated/typed API client
│   │   ├── models/                    # DTOs
│   │   └── repositories/
│   ├── domain/
│   │   ├── entities/
│   │   └── repositories/
│   ├── shared/
│   │   ├── widgets/                   # buttons, inputs, chips, cards, badges
│   │   ├── illustrations/             # SVG empty states
│   │   └── animations/                # reusable motion helpers
│   └── features/
│       ├── splash/
│       ├── auth/
│       ├── onboarding/
│       ├── dashboard/
│       ├── discover/                  # swipe deck lives here
│       ├── listings/
│       ├── job_detail/
│       ├── training_detail/
│       ├── saved/
│       ├── applications/
│       ├── profile/
│       ├── settings/
│       └── notifications/
├── test/
├── integration_test/
├── assets/
│   ├── images/
│   ├── illustrations/
│   ├── icons/
│   └── fonts/
└── pubspec.yaml
```

Every feature folder: `data/` (if it has unique repo logic), `presentation/screens/`, `presentation/widgets/`, `presentation/controllers/`.

---

## 7. Build order

**Before writing any Dart:**
1. Read `MOBILE_API_CONTRACT.md` and `openapi.json` from the Phase 1 backend output. Confirm base URL for dev/staging/prod.
2. Read this entire prompt twice.
3. Verify all Figma export assets from the user are accessible. If anything is unclear about a screen's behavior, ask before building it.
4. Produce a one-page `BUILD_PLAN.md` listing the milestones below with your time estimate per milestone, and any open questions. **Stop and wait for sign-off.**

**Milestone 1 — Foundation** (the design system itself is the deliverable)
- Project scaffold, all folders, pubspec with locked dependency versions.
- Full theme implementation: `ClimbrTokens` extension with every color/space/radius/typography token from §2.
- Light + dark factories, theme switcher in settings (placeholder).
- Shared widget primitives: `PrimaryButton`, `SecondaryButton`, `DarkButton`, `IconButton`, `TagChip`, `StatusBadge`, `Input`, `SearchBar`, `Card`, `Avatar`, `Toast`, `Modal`, `BottomSheet`.
- Splash screen with logo animation.
- Router skeleton with all routes (most screens are placeholders rendering their name).
- Dio + interceptors wired, even if endpoints aren't called yet.
- Secure storage helper.
- **Deliverable: a "component gallery" debug screen** at `/debug/components` showing every primitive in both light and dark mode side by side. This is what I review before you go further.

**Milestone 2 — Auth + onboarding**
- All auth screens (login, signup, forgot pw, email verify).
- Google sign-in.
- Token refresh interceptor working end-to-end.
- Profile-build multi-step flow with progress indicator at top.
- Role-routing: Talent → main app shell; other roles → "Use the web app" screen with a link.

**Milestone 3 — Discover swipe deck**
- This is the hero. Spend the time.
- Real backend integration via the `/talent/jobs/recommended` + `/talent/trainings/recommended` endpoints from the contract.
- Save/skip endpoints called optimistically with rollback on error.
- All motion details from §4.1 implemented and tuned by hand. Test on a real device.
- Tabs to switch Jobs/Trainings without losing state.
- Empty state when the deck runs out.

**Milestone 4 — Listings + detail screens**
- Grid view, list view, filter sheet, search with grouped results, search empty state.
- Job detail and training detail with shared-element hero from list card.
- Apply flow → confirmation → success modal.
- Share modal.
- Same patterns for trainings.

**Milestone 5 — Dashboard, Saved, Applications, Profile, Settings**
- Dashboard with all 4 stat cards (animated counters), CTA hero card, featured jobs.
- Saved jobs and trainings.
- My Applications with stat cards, tab filter, table list, detail with stepper, remove confirmation.
- Profile view + inline edit + edit avatar.
- Settings with all three sub-screens.
- Notification center as a slide-in panel.

**Milestone 6 — Polish pass**
- Pull-to-refresh on every list (custom indicator).
- Offline cache fallback via Hive.
- Skeleton shimmers on every list and detail screen.
- Toast + snackbar wiring.
- Push notification handling (foreground + tap-to-route).
- Analytics events on every key action (auth events, swipe_right, swipe_left, apply, save, share, profile_edit).
- Crashlytics wired.
- Dark mode QA: every screen reviewed in both modes; fix anything that looks weird.
- Localization scaffolding (English strings extracted into ARB files; no other locales required for v1).
- Accessibility pass: semantics labels, min tap targets 44×44, dynamic type support.

---

## 8. Rules of engagement

- **No `Map<String, dynamic>` outside `data/`.** Everything strongly typed.
- **No hardcoded colors, sizes, or strings in widgets.** Pull from theme tokens or string constants.
- **No business logic in widgets.** Widgets render; controllers (Riverpod) hold state and call repositories.
- **No mock data in shipped screens.** Use mocks only behind `--dart-define=USE_MOCKS=true` for development.
- **Real animations everywhere, but never gratuitous.** If a motion doesn't serve comprehension or delight, cut it.
- **Match the design.** When the export and your instinct disagree, the export wins — ask before deviating.
- **Test on a real device** for swipe-deck physics. Simulators lie about gesture feel.
- **Commit small.** One logical chunk per commit. Descriptive messages.
- **When the OpenAPI schema and this prompt disagree, the schema is authoritative for data shape. This prompt is authoritative for UX and visual design.**
- **When in doubt about anything else, stop and ask.**

---

Begin with the contract + schema read, then write `BUILD_PLAN.md` and stop.
