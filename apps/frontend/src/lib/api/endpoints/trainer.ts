import { api } from '@/lib/api/client'
import type { Training } from './jobs'
import type { PricingPackage, EmployerInfo, Applicant } from './employer'

export type { PricingPackage }

export interface TrainingCreate {
  title: string; description: string; category: string; location?: string
  start_date: string; end_date?: string; cost: number
  delivery_method: string; duration?: string; level?: string
  open_slots?: number; curriculum?: string; highlights?: string
}

export interface TrainerApplicantsResponse {
  training_id: number; training_title: string; applications: Applicant[]
  page: number; limit: number; total_applications: number
}

export const trainerApi = {
  info:    () => api.get('trainer/info').json<EmployerInfo>(),
  credits: () => api.get('trainer/credits').json<{ training_credits: number }>(),

  purchase: (packageId: number) =>
    api.post('trainer/purchase', { json: { package_id: packageId } }).json<{
      authorization_url: string; reference: string; amount: number; credits_to_add: number
    }>(),

  confirmPayment: (reference: string) =>
    api.post('trainer/confirm-payment', { json: { reference } }).json<{
      credits_added: number; total_credits: number; payment_status: string
    }>(),

  trainings:      (status?: string) => {
    const qs = status ? `?status=${status}` : ''
    return api.get(`trainer/trainings${qs}`).json<{ trainings: Training[]; total: number }>()
  },
  training:       (id: number) => api.get(`trainer/trainings/${id}`).json<Training>(),
  createTraining: (body: TrainingCreate) => api.post('trainer/trainings', { json: body }).json<{ message: string; training_id: number }>(),
  updateTraining: (id: number, body: Partial<TrainingCreate>) => api.put(`trainer/trainings/${id}`, { json: body }).json<void>(),
  renewTraining:  (id: number) => api.post(`trainer/trainings/${id}/renew`).json<void>(),

  applicants:  (trainingId: number, page = 1, limit = 20) =>
    api.get(`trainer/trainings/${trainingId}/applicants?page=${page}&limit=${limit}`).json<TrainerApplicantsResponse>(),
  accept:      (trainingId: number, applicantId: number) => api.post(`trainer/trainings/${trainingId}/applicants/${applicantId}/accept`).json<void>(),
  shortlist:   (trainingId: number, applicantId: number) => api.post(`trainer/trainings/${trainingId}/applicants/${applicantId}/shortlist`).json<void>(),
  reject:      (trainingId: number, applicantId: number) => api.post(`trainer/trainings/${trainingId}/applicants/${applicantId}/reject`).json<void>(),
}
