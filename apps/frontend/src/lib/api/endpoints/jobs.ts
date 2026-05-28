import { api } from '@/lib/api/client'

// ── Types ────────────────────────────────────────────────────────────────────

export interface Job {
  id: number
  title: string
  description?: string | null
  industry: string | null
  location: string
  job_type: string
  experience_level: string | null
  company_size: string | null
  salary_min: number | null
  salary_max: number | null
  employer_name: string
  created_at: string
  image_url: string | null
  highlights: string | null
  applicant_count: number
}

export interface JobDetail extends Job {
  description: string
  employer_id: number
  status: string
  expiry_date: string
}

export interface Training {
  id: number
  title: string
  category: string
  location: string | null
  start_date: string
  end_date: string | null
  cost: number
  delivery_method: string
  trainer_name: string
  highlights: string | null
  image_url: string | null
  applicant_count: number
  created_at: string
  description?: string
  duration?: string
  level?: string
  open_slots?: number
  curriculum?: string
  who_should_join?: string
}

export interface JobFilters {
  page?: number
  limit?: number
  search?: string
  location?: string
  job_type?: string
  industry?: string
  experience_level?: string
  sort_by?: string
}

export interface TrainingFilters {
  skip?: number
  limit?: number
  search?: string
  category?: string
  delivery_method?: string
  location?: string
  cost_min?: number
  cost_max?: number
}

// ── API calls ────────────────────────────────────────────────────────────────

function buildParams(obj: Record<string, string | number | undefined>) {
  const p = new URLSearchParams()
  Object.entries(obj).forEach(([k, v]) => { if (v !== undefined) p.set(k, String(v)) })
  return p.size ? `?${p}` : ''
}

export const jobsApi = {
  list: (f?: JobFilters) =>
    api.get(`jobs${buildParams(f as Record<string, string | number | undefined>)}`).json<{
      jobs: Job[]
      pagination: { page: number; limit: number; total: number; pages: number }
    }>(),

  detail: (id: number) => api.get(`jobs/${id}`).json<JobDetail>(),

  recommended: (talentId?: number) =>
    api.get(`jobs/recommended${talentId ? `?talent_id=${talentId}` : ''}`).json<{
      recommended_jobs: Job[]
      total: number
    }>(),

  trainings: (f?: TrainingFilters) =>
    api.get(`trainings${buildParams(f as Record<string, string | number | undefined>)}`).json<{
      trainings: Training[]
      total: number
    }>(),

  trainingDetail: (id: number) => api.get(`trainings/${id}`).json<Training>(),

  recommendedTrainings: (talentId?: number) =>
    api.get(`trainings/recommended${talentId ? `?talent_id=${talentId}` : ''}`).json<{
      recommended_trainings: Training[]
      total: number
    }>(),

  contact: (body: { name: string; email: string; message: string }) =>
    api.post('contact', { json: body }).json<{ message: string; submission_id: number }>(),
}
