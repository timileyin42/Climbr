import { api } from '@/lib/api/client'
import type { Job, Training } from './jobs'

// ── Types ────────────────────────────────────────────────────────────────────

export interface Skill { id: number; name: string; category?: string }
export interface Education {
  id: number; institution: string; degree: string; field_of_study: string
  start_year: number; end_year?: number; current?: boolean
}
export interface WorkExperience {
  id: number; company: string; position: string; description?: string
  start_date: string; end_date?: string; is_current?: boolean; location?: string
}
export interface Certificate { id: number; name: string; issuer: string; issue_date?: string; url?: string }
export interface Hobby { id: number; name: string }
export interface Language { id: number; name: string; proficiency?: string }

export interface TalentProfile {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string | null
  bio: string | null
  profile: {
    summary: string | null
    education: Education[]
    work_experience: WorkExperience[]
    skills: Skill[]
    certificates: Certificate[]
    hobbies: Hobby[]
    languages: Language[]
  }
}

export interface QuickAction { label: string; icon?: string; route: string }

export interface TalentDashboard {
  total_applications: number
  total_trainings: number
  total_saved_jobs: number
  applications_in_review: number
  shortlisted_applications: number
  featured_jobs: Job[]
  profile_completion: number
  quick_actions: QuickAction[]
}

export interface Application {
  id: number
  type: 'job' | 'training'
  title: string
  company: string
  status: string
  created_at: string
}

export interface SavedJob { id: number; job: Job }
export interface SavedTraining { id: number; training: Training }

// ── API calls ────────────────────────────────────────────────────────────────

export const talentApi = {
  dashboard: () => api.get('talent/dashboard').json<TalentDashboard>(),

  profile:       () => api.get('talent/profile').json<TalentProfile>(),
  updateProfile: (body: Record<string, unknown>) => api.put('talent/profile', { json: body }).json<TalentProfile>(),

  applyJob:       (jobId: number)      => api.post(`talent/jobs/${jobId}/apply`).json<void>(),
  applyTraining:  (trainingId: number) => api.post(`talent/trainings/${trainingId}/apply`).json<void>(),

  applications: (params?: { status?: string; type?: string; skip?: number; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) qs.set(k, String(v)) })
    return api.get(`talent/applications${qs.size ? `?${qs}` : ''}`).json<{
      applications: Application[]
      stats: { total_applications: number; in_review: number; accepted: number; rejected: number }
    }>()
  },

  removeJobApplication:      (id: number) => api.delete(`talent/applications/jobs/${id}`).json<void>(),
  removeTrainingApplication: (id: number) => api.delete(`talent/applications/trainings/${id}`).json<void>(),

  savedJobs:    () => api.get('talent/saved-jobs').json<SavedJob[]>(),
  saveJob:      (jobId: number) => api.post(`talent/saved-jobs/${jobId}`).json<void>(),
  unsaveJob:    (savedJobId: number) => api.delete(`talent/saved-jobs/${savedJobId}`).json<void>(),

  savedTrainings:  () => api.get('talent/saved-trainings').json<SavedTraining[]>(),
  saveTraining:    (id: number) => api.post(`talent/saved-trainings/${id}`).json<void>(),
  unsaveTraining:  (id: number) => api.delete(`talent/saved-trainings/${id}`).json<void>(),

  // Profile sub-sections
  addEducation:       (body: Partial<Education>) => api.post('talent/profile/education', { json: body }).json<Education>(),
  updateEducation:    (id: number, body: Partial<Education>) => api.put(`talent/profile/education/${id}`, { json: body }).json<Education>(),
  deleteEducation:    (id: number) => api.delete(`talent/profile/education/${id}`).json<void>(),

  addWorkExperience:    (body: Partial<WorkExperience>) => api.post('talent/profile/work-experience', { json: body }).json<WorkExperience>(),
  updateWorkExperience: (id: number, body: Partial<WorkExperience>) => api.put(`talent/profile/work-experience/${id}`, { json: body }).json<WorkExperience>(),
  deleteWorkExperience: (id: number) => api.delete(`talent/profile/work-experience/${id}`).json<void>(),
}
