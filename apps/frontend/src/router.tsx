import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { RequireAuth, RequireRole, RequireVerified } from '@/lib/auth/guards'

// ── Route lazy (React Router handles Suspense) ────────────────────────────────
const Landing        = () => import('@/features/public/Landing')
const Login          = () => import('@/features/auth/Login')
const SignUp         = () => import('@/features/auth/SignUp')
const ForgotPassword = () => import('@/features/auth/ForgotPassword')
const ResetPassword  = () => import('@/features/auth/ResetPassword')
const VerifyEmail    = () => import('@/features/auth/VerifyEmail')
const Onboarding     = () => import('@/features/auth/Onboarding')
const ForEmployers   = () => import('@/features/public/ForEmployers')
const ForTrainers    = () => import('@/features/public/ForTrainers')
const FAQ            = () => import('@/features/public/FAQ')
const Contact        = () => import('@/features/public/Contact')
const Privacy        = () => import('@/features/public/Privacy')
const Terms          = () => import('@/features/public/Terms')

// ── React.lazy (JSX inside guards — Suspense lives in AppShell) ───────────────
const TalentDashboard   = lazy(() => import('@/features/talent/dashboard/Dashboard').then((m) => ({ default: m.Component })))
const EmployerDashboard = lazy(() => import('@/features/employer/dashboard/Dashboard').then((m) => ({ default: m.Component })))
const TrainerDashboard  = lazy(() => import('@/features/trainer/dashboard/Dashboard').then((m) => ({ default: m.Component })))
const AdminDashboard    = lazy(() => import('@/features/admin/dashboard/Dashboard').then((m) => ({ default: m.Component })))
const Jobs         = lazy(() => import('@/features/talent/jobs/Jobs').then((m) => ({ default: m.Component })))
const JobDetail    = lazy(() => import('@/features/talent/jobs/JobDetail').then((m) => ({ default: m.Component })))
const Trainings    = lazy(() => import('@/features/talent/trainings/Trainings').then((m) => ({ default: m.Component })))
const Applications = lazy(() => import('@/features/talent/applications/Applications').then((m) => ({ default: m.Component })))
const Saved        = lazy(() => import('@/features/talent/saved/Saved').then((m) => ({ default: m.Component })))
const Profile      = lazy(() => import('@/features/talent/profile/Profile').then((m) => ({ default: m.Component })))
const TalentSettings = lazy(() => import('@/features/talent/settings/Settings').then((m) => ({ default: m.Component })))

// Employer
const EmployerJobs           = lazy(() => import('@/features/employer/jobs/Jobs').then((m) => ({ default: m.Component })))
const EmployerPostJob        = lazy(() => import('@/features/employer/jobs/PostJob').then((m) => ({ default: m.Component })))
const EmployerJobApplicants  = lazy(() => import('@/features/employer/jobs/JobApplicants').then((m) => ({ default: m.Component })))
const EmployerCredits        = lazy(() => import('@/features/employer/credits/Credits').then((m) => ({ default: m.Component })))
const EmployerSettings       = lazy(() => import('@/features/employer/settings/Settings').then((m) => ({ default: m.Component })))

// Trainer
const TrainerTrainings       = lazy(() => import('@/features/trainer/trainings/Trainings').then((m) => ({ default: m.Component })))
const TrainerPostTraining    = lazy(() => import('@/features/trainer/trainings/PostTraining').then((m) => ({ default: m.Component })))
const TrainerApplicants      = lazy(() => import('@/features/trainer/trainings/TrainingApplicants').then((m) => ({ default: m.Component })))
const TrainerCredits         = lazy(() => import('@/features/trainer/credits/Credits').then((m) => ({ default: m.Component })))
const TrainerSettings        = lazy(() => import('@/features/trainer/settings/Settings').then((m) => ({ default: m.Component })))

// ── Placeholder ───────────────────────────────────────────────────────────────
function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-[var(--color-text-secondary)]">
      <p className="text-[16px] font-[500]">{name} — coming soon</p>
    </div>
  )
}

// ── Role guards ───────────────────────────────────────────────────────────────
function TalentOnly({ children }: { children: React.ReactNode }) {
  return <RequireAuth><RequireVerified><RequireRole role="talent">{children}</RequireRole></RequireVerified></RequireAuth>
}
function EmployerOnly({ children }: { children: React.ReactNode }) {
  return <RequireAuth><RequireVerified><RequireRole role="employer">{children}</RequireRole></RequireVerified></RequireAuth>
}
function TrainerOnly({ children }: { children: React.ReactNode }) {
  return <RequireAuth><RequireVerified><RequireRole role="trainer">{children}</RequireRole></RequireVerified></RequireAuth>
}
function AdminOnly({ children }: { children: React.ReactNode }) {
  return <RequireAuth><RequireRole role="admin">{children}</RequireRole></RequireAuth>
}

export const router = createBrowserRouter([
  // ── Public (no shell) ──────────────────────────────────────────────────────
  { path: '/',                lazy: Landing },
  { path: '/login',           lazy: Login },
  { path: '/signup',          lazy: SignUp },
  { path: '/forgot-password', lazy: ForgotPassword },
  { path: '/reset-password',  lazy: ResetPassword },
  { path: '/verify-email',    lazy: VerifyEmail },
  { path: '/onboarding',      lazy: Onboarding },
  { path: '/for-employers',   lazy: ForEmployers },
  { path: '/for-trainers',    lazy: ForTrainers },
  { path: '/faq',             lazy: FAQ },
  { path: '/contact',         lazy: Contact },
  { path: '/privacy',         lazy: Privacy },
  { path: '/terms',           lazy: Terms },

  // ── Authenticated shell ────────────────────────────────────────────────────
  {
    element: <AppShell />,
    children: [
      // Talent
      { path: '/dashboard',    element: <TalentOnly><TalentDashboard /></TalentOnly> },
      { path: '/jobs',         element: <TalentOnly><Jobs /></TalentOnly> },
      { path: '/jobs/:id',     element: <TalentOnly><JobDetail /></TalentOnly> },
      { path: '/trainings',    element: <TalentOnly><Trainings /></TalentOnly> },
      { path: '/trainings/:id',element: <TalentOnly><Placeholder name="Training Detail" /></TalentOnly> },
      { path: '/discover',     element: <TalentOnly><Placeholder name="Discover — Swipe" /></TalentOnly> },
      { path: '/applications', element: <TalentOnly><Applications /></TalentOnly> },
      { path: '/saved',        element: <TalentOnly><Saved /></TalentOnly> },
      { path: '/profile',      element: <TalentOnly><Profile /></TalentOnly> },
      { path: '/settings',     element: <RequireAuth><TalentSettings /></RequireAuth> },

      // Employer
      { path: '/employer/dashboard',              element: <EmployerOnly><EmployerDashboard /></EmployerOnly> },
      { path: '/employer/jobs',                   element: <EmployerOnly><EmployerJobs /></EmployerOnly> },
      { path: '/employer/jobs/new',               element: <EmployerOnly><EmployerPostJob /></EmployerOnly> },
      { path: '/employer/jobs/:id',               element: <EmployerOnly><Placeholder name="Job Detail (Employer)" /></EmployerOnly> },
      { path: '/employer/jobs/:id/applicants',    element: <EmployerOnly><EmployerJobApplicants /></EmployerOnly> },
      { path: '/employer/credits',                element: <EmployerOnly><EmployerCredits /></EmployerOnly> },
      { path: '/employer/settings',               element: <EmployerOnly><EmployerSettings /></EmployerOnly> },

      // Trainer
      { path: '/trainer/dashboard',                        element: <TrainerOnly><TrainerDashboard /></TrainerOnly> },
      { path: '/trainer/trainings',                        element: <TrainerOnly><TrainerTrainings /></TrainerOnly> },
      { path: '/trainer/trainings/new',                    element: <TrainerOnly><TrainerPostTraining /></TrainerOnly> },
      { path: '/trainer/trainings/:id/applicants',         element: <TrainerOnly><TrainerApplicants /></TrainerOnly> },
      { path: '/trainer/credits',                          element: <TrainerOnly><TrainerCredits /></TrainerOnly> },
      { path: '/trainer/settings',                         element: <TrainerOnly><TrainerSettings /></TrainerOnly> },

      // Admin
      { path: '/admin/dashboard', element: <AdminOnly><AdminDashboard /></AdminOnly> },
      { path: '/admin/users',     element: <AdminOnly><Placeholder name="Users" /></AdminOnly> },
      { path: '/admin/content',   element: <AdminOnly><Placeholder name="Content" /></AdminOnly> },
      { path: '/admin/payments',  element: <AdminOnly><Placeholder name="Payments" /></AdminOnly> },
      { path: '/admin/pricing',   element: <AdminOnly><Placeholder name="Pricing" /></AdminOnly> },
      { path: '/admin/reports',   element: <AdminOnly><Placeholder name="Reports" /></AdminOnly> },
      { path: '/admin/contact',   element: <AdminOnly><Placeholder name="Contact Submissions" /></AdminOnly> },
      { path: '/admin/admins',    element: <AdminOnly><Placeholder name="Admin Users" /></AdminOnly> },
      { path: '/admin/settings',  element: <AdminOnly><Placeholder name="Admin Settings" /></AdminOnly> },

      { path: '/403', element: <Placeholder name="403 — Access Denied" /> },
    ],
  },

  { path: '*', element: <Placeholder name="404 — Page Not Found" /> },
])
