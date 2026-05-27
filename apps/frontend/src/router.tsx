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
const AdminLogin     = () => import('@/features/auth/AdminLogin')

// ── React.lazy (JSX inside guards — Suspense lives in AppShell) ───────────────
const TalentDashboard   = lazy(() => import('@/features/talent/dashboard/Dashboard').then((m) => ({ default: m.Component })))
const EmployerDashboard = lazy(() => import('@/features/employer/dashboard/Dashboard').then((m) => ({ default: m.Component })))
const TrainerDashboard  = lazy(() => import('@/features/trainer/dashboard/Dashboard').then((m) => ({ default: m.Component })))
const Jobs         = lazy(() => import('@/features/talent/jobs/Jobs').then((m) => ({ default: m.Component })))
const JobDetail    = lazy(() => import('@/features/talent/jobs/JobDetail').then((m) => ({ default: m.Component })))
const Trainings       = lazy(() => import('@/features/talent/trainings/Trainings').then((m) => ({ default: m.Component })))
const TrainingDetail  = lazy(() => import('@/features/talent/trainings/TrainingDetail').then((m) => ({ default: m.Component })))
const Applications = lazy(() => import('@/features/talent/applications/Applications').then((m) => ({ default: m.Component })))
const Saved        = lazy(() => import('@/features/talent/saved/Saved').then((m) => ({ default: m.Component })))
const Profile      = lazy(() => import('@/features/talent/profile/Profile').then((m) => ({ default: m.Component })))
const TalentSettings = lazy(() => import('@/features/talent/settings/Settings').then((m) => ({ default: m.Component })))

// Employer
const EmployerJobs           = lazy(() => import('@/features/employer/jobs/Jobs').then((m) => ({ default: m.Component })))
const EmployerPostJob        = lazy(() => import('@/features/employer/jobs/PostJob').then((m) => ({ default: m.Component })))
const EmployerJobApplicants  = lazy(() => import('@/features/employer/jobs/JobApplicants').then((m) => ({ default: m.Component })))
const EmployerApplicants     = lazy(() => import('@/features/employer/applicants/Applicants').then((m) => ({ default: m.Component })))
const EmployerCredits        = lazy(() => import('@/features/employer/credits/Credits').then((m) => ({ default: m.Component })))
const EmployerSettings       = lazy(() => import('@/features/employer/settings/Settings').then((m) => ({ default: m.Component })))

// Trainer
const TrainerTrainings       = lazy(() => import('@/features/trainer/trainings/Trainings').then((m) => ({ default: m.Component })))
const TrainerPostTraining    = lazy(() => import('@/features/trainer/trainings/PostTraining').then((m) => ({ default: m.Component })))
const TrainerApplicants      = lazy(() => import('@/features/trainer/trainings/TrainingApplicants').then((m) => ({ default: m.Component })))
const TrainerApplicantsOverview = lazy(() => import('@/features/trainer/applicants/Applicants').then((m) => ({ default: m.Component })))
const TrainerCredits         = lazy(() => import('@/features/trainer/credits/Credits').then((m) => ({ default: m.Component })))
const TrainerSettings        = lazy(() => import('@/features/trainer/settings/Settings').then((m) => ({ default: m.Component })))

// Messages (shared across roles)
const MessagesPage = lazy(() => import('@/features/messages/Messages').then((m) => ({ default: m.Component })))

// Admin
const AdminDashboardPage = lazy(() => import('@/features/admin/dashboard/Dashboard').then((m) => ({ default: m.Component })))
const AdminUsers         = lazy(() => import('@/features/admin/users/Users').then((m) => ({ default: m.Component })))
const AdminContent       = lazy(() => import('@/features/admin/content/Content').then((m) => ({ default: m.Component })))
const AdminPayments      = lazy(() => import('@/features/admin/payments/Payments').then((m) => ({ default: m.Component })))
const AdminPricing       = lazy(() => import('@/features/admin/pricing/Pricing').then((m) => ({ default: m.Component })))
const AdminReports       = lazy(() => import('@/features/admin/reports/Reports').then((m) => ({ default: m.Component })))
const AdminAdmins        = lazy(() => import('@/features/admin/admins/Admins').then((m) => ({ default: m.Component })))
const AdminContact       = lazy(() => import('@/features/admin/contact/Contact').then((m) => ({ default: m.Component })))
const AdminSettings      = lazy(() => import('@/features/admin/settings/Settings').then((m) => ({ default: m.Component })))

// ── Placeholder ───────────────────────────────────────────────────────────────
function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-[var(--color-text-secondary)]">
      <p className="text-[16px] font-[500]">{name} — coming soon</p>
    </div>
  )
}

function ErrorPage({ code, title, message }: { code: number; title: string; message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-bg-primary)]">
      <div className="max-w-md text-center">
        <p className="text-[80px] font-[900] text-[var(--color-brand-cyan)] leading-none">{code}</p>
        <h1 className="text-[24px] font-[700] text-[var(--color-text-primary)] mt-4 mb-2">{title}</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mb-8">{message}</p>
        <a href="/" className="inline-flex items-center px-5 py-2.5 rounded-[var(--radius-pill)] text-[14px] font-[600] text-white" style={{ background: 'var(--color-brand-cyan)' }}>
          Go home
        </a>
      </div>
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
  { path: '/admin/login',     lazy: AdminLogin },

  // ── Authenticated shell ────────────────────────────────────────────────────
  {
    element: <AppShell />,
    children: [
      // Talent
      { path: '/dashboard',    element: <TalentOnly><TalentDashboard /></TalentOnly> },
      { path: '/jobs',         element: <TalentOnly><Jobs /></TalentOnly> },
      { path: '/jobs/:id',     element: <TalentOnly><JobDetail /></TalentOnly> },
      { path: '/trainings',    element: <TalentOnly><Trainings /></TalentOnly> },
      { path: '/trainings/:id',element: <TalentOnly><TrainingDetail /></TalentOnly> },
      { path: '/discover',     element: <TalentOnly><Placeholder name="Discover — Swipe" /></TalentOnly> },
      { path: '/applications', element: <TalentOnly><Applications /></TalentOnly> },
      { path: '/saved',        element: <TalentOnly><Saved /></TalentOnly> },
      { path: '/profile',      element: <TalentOnly><Profile /></TalentOnly> },
      { path: '/settings',     element: <RequireAuth><TalentSettings /></RequireAuth> },
      { path: '/messages',     element: <TalentOnly><MessagesPage /></TalentOnly> },

      // Employer
      { path: '/employer/dashboard',              element: <EmployerOnly><EmployerDashboard /></EmployerOnly> },
      { path: '/employer/jobs',                   element: <EmployerOnly><EmployerJobs /></EmployerOnly> },
      { path: '/employer/jobs/new',               element: <EmployerOnly><EmployerPostJob /></EmployerOnly> },
      { path: '/employer/jobs/:id',               element: <EmployerOnly><Placeholder name="Job Detail (Employer)" /></EmployerOnly> },
      { path: '/employer/jobs/:id/applicants',    element: <EmployerOnly><EmployerJobApplicants /></EmployerOnly> },
      { path: '/employer/applicants',             element: <EmployerOnly><EmployerApplicants /></EmployerOnly> },
      { path: '/employer/messages',               element: <EmployerOnly><MessagesPage /></EmployerOnly> },
      { path: '/employer/credits',                element: <EmployerOnly><EmployerCredits /></EmployerOnly> },
      { path: '/employer/settings',               element: <EmployerOnly><EmployerSettings /></EmployerOnly> },

      // Trainer
      { path: '/trainer/dashboard',                        element: <TrainerOnly><TrainerDashboard /></TrainerOnly> },
      { path: '/trainer/trainings',                        element: <TrainerOnly><TrainerTrainings /></TrainerOnly> },
      { path: '/trainer/trainings/new',                    element: <TrainerOnly><TrainerPostTraining /></TrainerOnly> },
      { path: '/trainer/trainings/:id/applicants',         element: <TrainerOnly><TrainerApplicants /></TrainerOnly> },
      { path: '/trainer/applicants',                       element: <TrainerOnly><TrainerApplicantsOverview /></TrainerOnly> },
      { path: '/trainer/messages',                         element: <TrainerOnly><MessagesPage /></TrainerOnly> },
      { path: '/trainer/credits',                          element: <TrainerOnly><TrainerCredits /></TrainerOnly> },
      { path: '/trainer/settings',                         element: <TrainerOnly><TrainerSettings /></TrainerOnly> },

      // Admin
      { path: '/admin/dashboard', element: <AdminOnly><AdminDashboardPage /></AdminOnly> },
      { path: '/admin/users',     element: <AdminOnly><AdminUsers /></AdminOnly> },
      { path: '/admin/content',   element: <AdminOnly><AdminContent /></AdminOnly> },
      { path: '/admin/payments',  element: <AdminOnly><AdminPayments /></AdminOnly> },
      { path: '/admin/pricing',   element: <AdminOnly><AdminPricing /></AdminOnly> },
      { path: '/admin/reports',   element: <AdminOnly><AdminReports /></AdminOnly> },
      { path: '/admin/contact',   element: <AdminOnly><AdminContact /></AdminOnly> },
      { path: '/admin/admins',    element: <AdminOnly><AdminAdmins /></AdminOnly> },
      { path: '/admin/settings',  element: <AdminOnly><AdminSettings /></AdminOnly> },

      { path: '/403', element: <ErrorPage code={403} title="Access Denied" message="You don't have permission to view this page." /> },
    ],
  },

  { path: '*', element: <ErrorPage code={404} title="Page Not Found" message="The page you're looking for doesn't exist or has been moved." /> },
])
