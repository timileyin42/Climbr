import { api } from '@/lib/api/client'
import type { Job, Training } from './jobs'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminDashboard {
  total_talents: number
  total_employers: number
  total_trainers: number
  total_active_jobs: number
  total_active_trainings: number
  total_inactive_jobs: number
  total_inactive_trainings: number
  total_revenue: number
}

export interface AdminTalent {
  id: number; email: string; is_active: boolean; created_at: string
  first_name: string; last_name: string; phone?: string
}
export interface AdminEmployer {
  id: number; email: string; is_active: boolean; created_at: string
  company_name: string; contact_name: string; phone?: string
  industry?: string; job_count: number; job_credits?: number
}
export interface AdminTrainer {
  id: number; email: string; is_active: boolean; created_at: string
  provider_name: string; contact_name: string; phone?: string
  industry?: string; training_count: number; training_credits?: number
}
export interface AdminUser {
  id: number; email: string; is_active: boolean; created_at: string
  first_name: string; last_name: string; updated_at?: string
}
export interface Payment {
  id: number; amount: number; currency: string; status: string
  payment_intent_id: string; user_id: number
  created_at: string; updated_at: string
}

// ── API ───────────────────────────────────────────────────────────────────────

export const adminApi = {
  login: (email: string, password: string) =>
    api.post('admin/login', {
      body: new URLSearchParams({ username: email, password }),
    }).json<{ access_token: string; token_type: string }>(),

  dashboard: () => api.get('admin/dashboard').json<AdminDashboard>(),

  talents: (params?: { name?: string; email?: string; skip?: number; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.name)  qs.set('name', params.name)
    if (params?.email) qs.set('email', params.email)
    qs.set('skip',  String(params?.skip  ?? 0))
    qs.set('limit', String(params?.limit ?? 100))
    return api.get(`admin/talents?${qs}`).json<AdminTalent[]>()
  },
  disableTalent: (id: number) => api.put(`admin/talents/${id}/disable`).json<{ message: string }>(),
  deleteTalent:  (id: number) => api.delete(`admin/talents/${id}`).json<{ message: string }>(),

  employers: (params?: { name?: string; email?: string; skip?: number; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.name)  qs.set('name', params.name)
    if (params?.email) qs.set('email', params.email)
    qs.set('skip',  String(params?.skip  ?? 0))
    qs.set('limit', String(params?.limit ?? 100))
    return api.get(`admin/employers?${qs}`).json<AdminEmployer[]>()
  },
  disableEmployer: (id: number) => api.put(`admin/employers/${id}/disable`).json<{ message: string }>(),
  deleteEmployer:  (id: number) => api.delete(`admin/employers/${id}`).json<{ message: string }>(),
  createEmployer:  (data: { email: string; password: string; company_name: string; contact_name: string }) =>
    api.post('admin/employers', { json: data }).json<{ message: string; user_id: number }>(),

  trainers: (params?: { name?: string; email?: string; skip?: number; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.name)  qs.set('name', params.name)
    if (params?.email) qs.set('email', params.email)
    qs.set('skip',  String(params?.skip  ?? 0))
    qs.set('limit', String(params?.limit ?? 100))
    return api.get(`admin/trainers?${qs}`).json<AdminTrainer[]>()
  },
  disableTrainer: (id: number) => api.put(`admin/trainers/${id}/disable`).json<{ message: string }>(),
  deleteTrainer:  (id: number) => api.delete(`admin/trainers/${id}`).json<{ message: string }>(),
  createTrainer:  (data: { email: string; password: string; first_name: string; last_name: string }) =>
    api.post('admin/trainers', { json: data }).json<{ message: string; user_id: number }>(),

  jobs: (params?: { status?: string; industry?: string; skip?: number; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.status)   qs.set('status', params.status)
    if (params?.industry) qs.set('industry', params.industry)
    qs.set('skip',  String(params?.skip  ?? 0))
    qs.set('limit', String(params?.limit ?? 100))
    return api.get(`admin/jobs?${qs}`).json<Job[]>()
  },
  unpublishJob: (id: number) => api.put(`admin/jobs/${id}/unpublish`).json<{ message: string }>(),
  deleteJob:    (id: number) => api.delete(`admin/jobs/${id}`).json<{ message: string }>(),

  trainings: (params?: { status?: string; category?: string; skip?: number; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.status)   qs.set('status', params.status)
    if (params?.category) qs.set('category', params.category)
    qs.set('skip',  String(params?.skip  ?? 0))
    qs.set('limit', String(params?.limit ?? 100))
    return api.get(`admin/trainings?${qs}`).json<Training[]>()
  },
  unpublishTraining: (id: number) => api.put(`admin/trainings/${id}/unpublish`).json<{ message: string }>(),
  deleteTraining:    (id: number) => api.delete(`admin/trainings/${id}`).json<{ message: string }>(),

  payments: (params?: { user_type?: string; status?: string; skip?: number; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.user_type) qs.set('user_type', params.user_type)
    if (params?.status)    qs.set('status', params.status)
    qs.set('skip',  String(params?.skip  ?? 0))
    qs.set('limit', String(params?.limit ?? 100))
    return api.get(`admin/payments?${qs}`).json<Payment[]>()
  },

  updateJobPricing: (id: number, data: { price?: number; plan_name?: string; job_count?: number; description?: string }) =>
    api.put(`admin/pricing/jobs/${id}`, { json: data }).json<{ message: string }>(),
  updateTrainingPricing: (packageId: number, data: { price?: number; plan_name?: string; training_count?: number; description?: string }) =>
    api.put('admin/pricing/trainings', { json: { package_id: packageId, ...data } }).json<{ message: string }>(),

  downloadReport: (type: string, format: string, startDate?: string, endDate?: string) => {
    const qs = new URLSearchParams({ format })
    if (startDate) qs.set('start_date', startDate)
    if (endDate)   qs.set('end_date', endDate)
    return api.get(`admin/reports/${type}?${qs}`).blob()
  },

  admins:      () => api.get('admin/admins').json<AdminUser[]>(),
  createAdmin: (data: { email: string; password: string; first_name: string; last_name: string }) =>
    api.post('admin/admins', { json: data }).json<AdminUser>(),
}
