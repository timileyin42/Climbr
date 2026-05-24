import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { RequireAuth, RequireRole, RequireVerified } from '@/lib/auth/guards'

// ── Route lazy (React Router handles Suspense) ───────────────────────────────
const Landing        = () => import('@/features/public/Landing')
const Login          = () => import('@/features/auth/Login')
const SignUp         = () => import('@/features/auth/SignUp')
const ForgotPassword = () => import('@/features/auth/ForgotPassword')
const ResetPassword  = () => import('@/features/auth/ResetPassword')
const VerifyEmail    = () => import('@/features/auth/VerifyEmail')
const Onboarding     = () => import('@/features/auth/Onboarding')

// ── React.lazy (for use inside JSX guards — Suspense is in AppShell) ─────────
const TalentDashboard   = lazy(() => import('@/features/talent/dashboard/Dashboard').then((m) => ({ default: m.Component })))
const EmployerDashboard = lazy(() => import('@/features/employer/dashboard/Dashboard').then((m) => ({ default: m.Component })))
const TrainerDashboard  = lazy(() => import('@/features/trainer/dashboard/Dashboard').then((m) => ({ default: m.Component })))
const AdminDashboard    = lazy(() => import('@/features/admin/dashboard/Dashboard').then((m) => ({ default: m.Component })))

// ── Placeholder component for unbuilt pages ─────────────────────────────────
function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-[var(--color-text-secondary)]">
      <p className="text-[16px] font-[500]">{name} — coming soon</p>
    </div>
  )
}

// ── Guarded wrappers ─────────────────────────────────────────────────────────
function TalentOnly({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireVerified>
        <RequireRole role="talent">{children}</RequireRole>
      </RequireVerified>
    </RequireAuth>
  )
}
function EmployerOnly({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireVerified>
        <RequireRole role="employer">{children}</RequireRole>
      </RequireVerified>
    </RequireAuth>
  )
}
function TrainerOnly({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireVerified>
        <RequireRole role="trainer">{children}</RequireRole>
      </RequireVerified>
    </RequireAuth>
  )
}
function AdminOnly({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireRole role="admin">{children}</RequireRole>
    </RequireAuth>
  )
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

  // Marketing pages (no shell)
  { path: '/for-employers', element: <Placeholder name="For Employers" /> },
  { path: '/for-trainers',  element: <Placeholder name="For Trainers" /> },
  { path: '/faq',           element: <Placeholder name="FAQ" /> },
  { path: '/contact',       element: <Placeholder name="Contact" /> },
  { path: '/privacy',       element: <Placeholder name="Privacy Policy" /> },
  { path: '/terms',         element: <Placeholder name="Terms of Service" /> },

  // ── Authenticated shell ────────────────────────────────────────────────────
  {
    element: <AppShell />,
    children: [
      // Talent routes
      {
        path: '/dashboard',
        element: <TalentOnly><TalentDashboard /></TalentOnly>,
      },

      {
        path: '/jobs',
        element: <TalentOnly><Placeholder name="Job Listings" /></TalentOnly>,
      },
      {
        path: '/jobs/:id',
        element: <TalentOnly><Placeholder name="Job Detail" /></TalentOnly>,
      },
      {
        path: '/trainings',
        element: <TalentOnly><Placeholder name="Trainings" /></TalentOnly>,
      },
      {
        path: '/trainings/:id',
        element: <TalentOnly><Placeholder name="Training Detail" /></TalentOnly>,
      },
      {
        path: '/discover',
        element: <TalentOnly><Placeholder name="Discover" /></TalentOnly>,
      },
      {
        path: '/applications',
        element: <TalentOnly><Placeholder name="My Applications" /></TalentOnly>,
      },
      {
        path: '/saved',
        element: <TalentOnly><Placeholder name="Saved" /></TalentOnly>,
      },
      {
        path: '/profile',
        element: <TalentOnly><Placeholder name="My Profile" /></TalentOnly>,
      },
      {
        path: '/settings',
        element: <RequireAuth><Placeholder name="Settings" /></RequireAuth>,
      },

      // Employer routes
      {
        path: '/employer/dashboard',
        element: <EmployerOnly><EmployerDashboard /></EmployerOnly>,
      },
      {
        path: '/employer/jobs',
        element: <EmployerOnly><Placeholder name="My Jobs" /></EmployerOnly>,
      },
      {
        path: '/employer/jobs/new',
        element: <EmployerOnly><Placeholder name="Post New Job" /></EmployerOnly>,
      },
      {
        path: '/employer/jobs/:id',
        element: <EmployerOnly><Placeholder name="Job Detail (Employer)" /></EmployerOnly>,
      },
      {
        path: '/employer/applicants',
        element: <EmployerOnly><Placeholder name="Applicants" /></EmployerOnly>,
      },
      {
        path: '/employer/credits',
        element: <EmployerOnly><Placeholder name="Credits" /></EmployerOnly>,
      },
      {
        path: '/employer/settings',
        element: <EmployerOnly><Placeholder name="Employer Settings" /></EmployerOnly>,
      },

      // Trainer routes
      {
        path: '/trainer/dashboard',
        element: <TrainerOnly><TrainerDashboard /></TrainerOnly>,
      },
      {
        path: '/trainer/trainings',
        element: <TrainerOnly><Placeholder name="My Trainings" /></TrainerOnly>,
      },
      {
        path: '/trainer/trainings/new',
        element: <TrainerOnly><Placeholder name="Post New Training" /></TrainerOnly>,
      },
      {
        path: '/trainer/applicants',
        element: <TrainerOnly><Placeholder name="Applicants" /></TrainerOnly>,
      },
      {
        path: '/trainer/credits',
        element: <TrainerOnly><Placeholder name="Credits" /></TrainerOnly>,
      },
      {
        path: '/trainer/settings',
        element: <TrainerOnly><Placeholder name="Trainer Settings" /></TrainerOnly>,
      },

      // Admin routes
      {
        path: '/admin/dashboard',
        element: <AdminOnly><AdminDashboard /></AdminOnly>,
      },
      {
        path: '/admin/users',
        element: <AdminOnly><Placeholder name="Users" /></AdminOnly>,
      },
      {
        path: '/admin/content',
        element: <AdminOnly><Placeholder name="Content" /></AdminOnly>,
      },
      {
        path: '/admin/payments',
        element: <AdminOnly><Placeholder name="Payments" /></AdminOnly>,
      },
      {
        path: '/admin/pricing',
        element: <AdminOnly><Placeholder name="Pricing" /></AdminOnly>,
      },
      {
        path: '/admin/reports',
        element: <AdminOnly><Placeholder name="Reports" /></AdminOnly>,
      },
      {
        path: '/admin/contact',
        element: <AdminOnly><Placeholder name="Contact Submissions" /></AdminOnly>,
      },
      {
        path: '/admin/admins',
        element: <AdminOnly><Placeholder name="Admin Users" /></AdminOnly>,
      },
      {
        path: '/admin/settings',
        element: <AdminOnly><Placeholder name="Admin Settings" /></AdminOnly>,
      },

      // 403
      { path: '/403', element: <Placeholder name="403 — Access Denied" /> },
    ],
  },

  // Fallback
  { path: '*', element: <Placeholder name="404 — Page Not Found" /> },
])
