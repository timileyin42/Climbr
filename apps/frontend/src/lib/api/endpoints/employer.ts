import { api } from '@/lib/api/client'
import type { Job, JobDetail } from './jobs'

// ── Types ────────────────────────────────────────────────────────────────────

export interface PricingPackage { id: number; plan: string; price: number; quantity: number; currency: string; description: string }
export interface EmployerInfo   { message: string; benefits: string[]; pricing: PricingPackage[] }
export interface Applicant {
  id: number; talent_id: number; user_id: number | null; first_name: string; last_name: string
  email: string; status: string; applied_at: string
  resume_url: string | null; avatar_url: string | null
  profile: Record<string, unknown>
}
export interface ApplicantsResponse {
  job_id: number; job_title: string; applications: Applicant[]
  page: number; limit: number; total_applications: number
}
export interface JobCreate {
  title: string; description: string; industry: string; location: string
  job_type: string; experience_level?: string; company_size?: string
  salary_min?: number; salary_max?: number; highlights?: string
}

// ── API calls ────────────────────────────────────────────────────────────────

export const employerApi = {
  info:    () => api.get('employer/info').json<EmployerInfo>(),
  credits: () => api.get('employer/credits').json<{ job_credits: number; free_posts_remaining: number }>(),

  purchase: (packageId: number) =>
    api.post('employer/purchase', { json: { package_id: packageId } }).json<{
      authorization_url: string; reference: string; amount: number; credits_to_add: number
    }>(),

  confirmPayment: (reference: string) =>
    api.post('employer/confirm-payment', { json: { reference } }).json<{
      credits_added: number; total_credits: number; payment_status: string
    }>(),

  jobs:      (status?: string) => {
    const qs = status ? `?status=${status}` : ''
    return api.get(`employer/jobs${qs}`).json<{ jobs: Job[]; total: number }>()
  },
  job:       (id: number) => api.get(`employer/jobs/${id}`).json<JobDetail>(),
  createJob: (body: JobCreate) => api.post('employer/jobs', { json: body }).json<{ message: string; job_id: number }>(),
  updateJob: (id: number, body: Partial<JobCreate>) => api.put(`employer/jobs/${id}`, { json: body }).json<void>(),
  renewJob:  (id: number) => api.post(`employer/jobs/${id}/renew`).json<void>(),

  applicants:  (jobId: number, page = 1, limit = 20) =>
    api.get(`employer/jobs/${jobId}/applicants?page=${page}&limit=${limit}`).json<ApplicantsResponse>(),
  accept:      (jobId: number, applicantId: number) => api.post(`employer/jobs/${jobId}/applicants/${applicantId}/accept`).json<void>(),
  shortlist:   (jobId: number, applicantId: number) => api.post(`employer/jobs/${jobId}/applicants/${applicantId}/shortlist`).json<void>(),
  reject:      (jobId: number, applicantId: number) => api.post(`employer/jobs/${jobId}/applicants/${applicantId}/reject`).json<void>(),

  getLogo:     () => api.get('employer/profile/logo').json<{ logo_url: string | null }>(),
  uploadLogo:  (file: File) => {
    const fd = new FormData(); fd.append('file', file)
    return api.post('employer/profile/logo', { body: fd }).json<{ logo_url: string }>()
  },
}
