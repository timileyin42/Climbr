import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'

// ── Lazy pages ──────────────────────────────────────────────────────────────
const Landing = () => import('@/features/public/Landing')
const Login = () => import('@/features/auth/Login')
const SignUp = () => import('@/features/auth/SignUp')
const TalentDashboard = () => import('@/features/talent/dashboard/Dashboard')
const EmployerDashboard = () => import('@/features/employer/dashboard/Dashboard')
const TrainerDashboard = () => import('@/features/trainer/dashboard/Dashboard')
const AdminDashboard = () => import('@/features/admin/dashboard/Dashboard')

// ── Placeholder component for unbuilt pages ─────────────────────────────────
function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-[var(--color-text-secondary)]">
      <p className="text-[16px] font-[500]">{name} — coming soon</p>
    </div>
  )
}

export const router = createBrowserRouter([
  // Public pages (no shell)
  { path: '/', lazy: Landing },
  { path: '/login', lazy: Login },
  { path: '/signup', lazy: SignUp },
  { path: '/forgot-password', element: <Placeholder name="Forgot Password" /> },
  { path: '/reset-password', element: <Placeholder name="Reset Password" /> },
  { path: '/verify-email', element: <Placeholder name="Verify Email" /> },
  { path: '/for-employers', element: <Placeholder name="For Employers" /> },
  { path: '/for-trainers', element: <Placeholder name="For Trainers" /> },
  { path: '/faq', element: <Placeholder name="FAQ" /> },
  { path: '/contact', element: <Placeholder name="Contact" /> },
  { path: '/privacy', element: <Placeholder name="Privacy Policy" /> },
  { path: '/terms', element: <Placeholder name="Terms of Service" /> },

  // Authenticated shell
  {
    element: <AppShell />,
    children: [
      // Talent
      { path: '/dashboard', lazy: TalentDashboard },
      { path: '/jobs', element: <Placeholder name="Job Listings" /> },
      { path: '/jobs/:id', element: <Placeholder name="Job Detail" /> },
      { path: '/trainings', element: <Placeholder name="Trainings" /> },
      { path: '/trainings/:id', element: <Placeholder name="Training Detail" /> },
      { path: '/discover', element: <Placeholder name="Discover" /> },
      { path: '/applications', element: <Placeholder name="My Applications" /> },
      { path: '/saved', element: <Placeholder name="Saved" /> },
      { path: '/profile', element: <Placeholder name="My Profile" /> },
      { path: '/settings', element: <Placeholder name="Settings" /> },

      // Employer
      { path: '/employer/dashboard', lazy: EmployerDashboard },
      { path: '/employer/jobs', element: <Placeholder name="My Jobs" /> },
      { path: '/employer/jobs/new', element: <Placeholder name="Post New Job" /> },
      { path: '/employer/jobs/:id', element: <Placeholder name="Job Detail (Employer)" /> },
      { path: '/employer/applicants', element: <Placeholder name="Applicants" /> },
      { path: '/employer/credits', element: <Placeholder name="Credits" /> },
      { path: '/employer/settings', element: <Placeholder name="Employer Settings" /> },

      // Trainer
      { path: '/trainer/dashboard', lazy: TrainerDashboard },
      { path: '/trainer/trainings', element: <Placeholder name="My Trainings" /> },
      { path: '/trainer/trainings/new', element: <Placeholder name="Post New Training" /> },
      { path: '/trainer/applicants', element: <Placeholder name="Applicants" /> },
      { path: '/trainer/credits', element: <Placeholder name="Credits" /> },
      { path: '/trainer/settings', element: <Placeholder name="Trainer Settings" /> },

      // Admin
      { path: '/admin/dashboard', lazy: AdminDashboard },
      { path: '/admin/users', element: <Placeholder name="Users" /> },
      { path: '/admin/content', element: <Placeholder name="Content" /> },
      { path: '/admin/payments', element: <Placeholder name="Payments" /> },
      { path: '/admin/pricing', element: <Placeholder name="Pricing" /> },
      { path: '/admin/reports', element: <Placeholder name="Reports" /> },
      { path: '/admin/contact', element: <Placeholder name="Contact Submissions" /> },
      { path: '/admin/admins', element: <Placeholder name="Admin Users" /> },
      { path: '/admin/settings', element: <Placeholder name="Admin Settings" /> },
    ],
  },

  // Fallbacks
  { path: '*', element: <Placeholder name="404 — Page Not Found" /> },
])
