import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api/endpoints/admin'
import { employerApi } from '@/lib/api/endpoints/employer'
import { trainerApi } from '@/lib/api/endpoints/trainer'

const K = {
  dashboard:  ['admin', 'dashboard']                              as const,
  talents:    (f?: object) => ['admin', 'talents', f]            as const,
  employers:  (f?: object) => ['admin', 'employers', f]          as const,
  trainers:   (f?: object) => ['admin', 'trainers', f]           as const,
  jobs:       (f?: object) => ['admin', 'jobs', f]               as const,
  trainings:  (f?: object) => ['admin', 'trainings', f]          as const,
  payments:   (f?: object) => ['admin', 'payments', f]           as const,
  jobPricing:      ['admin', 'pricing', 'jobs']                  as const,
  trainingPricing: ['admin', 'pricing', 'trainings']             as const,
  admins:     ['admin', 'admins']                                as const,
}

export function useAdminDashboard()  { return useQuery({ queryKey: K.dashboard, queryFn: adminApi.dashboard }) }

export function useAdminTalents(f?: Parameters<typeof adminApi.talents>[0]) {
  return useQuery({ queryKey: K.talents(f), queryFn: () => adminApi.talents(f) })
}
export function useAdminEmployers(f?: Parameters<typeof adminApi.employers>[0]) {
  return useQuery({ queryKey: K.employers(f), queryFn: () => adminApi.employers(f) })
}
export function useAdminTrainers(f?: Parameters<typeof adminApi.trainers>[0]) {
  return useQuery({ queryKey: K.trainers(f), queryFn: () => adminApi.trainers(f) })
}
export function useAdminJobs(f?: Parameters<typeof adminApi.jobs>[0]) {
  return useQuery({ queryKey: K.jobs(f), queryFn: () => adminApi.jobs(f) })
}
export function useAdminTrainings(f?: Parameters<typeof adminApi.trainings>[0]) {
  return useQuery({ queryKey: K.trainings(f), queryFn: () => adminApi.trainings(f) })
}
export function useAdminPayments(f?: Parameters<typeof adminApi.payments>[0]) {
  return useQuery({ queryKey: K.payments(f), queryFn: () => adminApi.payments(f) })
}
export function useJobPricing()      { return useQuery({ queryKey: K.jobPricing,      queryFn: employerApi.info }) }
export function useTrainingPricing() { return useQuery({ queryKey: K.trainingPricing, queryFn: trainerApi.info  }) }
export function useAdmins()          { return useQuery({ queryKey: K.admins,           queryFn: adminApi.admins  }) }

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useAdminTalentAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'disable' | 'delete' }) =>
      action === 'disable' ? adminApi.disableTalent(id) : adminApi.deleteTalent(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'talents'] }); toast.success('Done') },
    onError: () => toast.error('Action failed'),
  })
}
export function useAdminEmployerAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'disable' | 'delete' }) =>
      action === 'disable' ? adminApi.disableEmployer(id) : adminApi.deleteEmployer(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'employers'] }); toast.success('Done') },
    onError: () => toast.error('Action failed'),
  })
}
export function useAdminTrainerAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'disable' | 'delete' }) =>
      action === 'disable' ? adminApi.disableTrainer(id) : adminApi.deleteTrainer(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'trainers'] }); toast.success('Done') },
    onError: () => toast.error('Action failed'),
  })
}
export function useCreateEmployer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.createEmployer,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'employers'] }); toast.success('Employer created') },
    onError: () => toast.error('Failed to create employer'),
  })
}
export function useCreateTrainer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.createTrainer,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'trainers'] }); toast.success('Trainer created') },
    onError: () => toast.error('Failed to create trainer'),
  })
}
export function useAdminJobAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'unpublish' | 'delete' }) =>
      action === 'unpublish' ? adminApi.unpublishJob(id) : adminApi.deleteJob(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'jobs'] }); toast.success('Done') },
    onError: () => toast.error('Action failed'),
  })
}
export function useAdminTrainingAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'unpublish' | 'delete' }) =>
      action === 'unpublish' ? adminApi.unpublishTraining(id) : adminApi.deleteTraining(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'trainings'] }); toast.success('Done') },
    onError: () => toast.error('Action failed'),
  })
}
export function useUpdateJobPricing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof adminApi.updateJobPricing>[1] }) =>
      adminApi.updateJobPricing(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: K.jobPricing }); toast.success('Package updated') },
    onError: () => toast.error('Update failed'),
  })
}
export function useUpdateTrainingPricing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof adminApi.updateTrainingPricing>[1] }) =>
      adminApi.updateTrainingPricing(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: K.trainingPricing }); toast.success('Package updated') },
    onError: () => toast.error('Update failed'),
  })
}
export function useCreateAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.createAdmin,
    onSuccess: () => { qc.invalidateQueries({ queryKey: K.admins }); toast.success('Admin created') },
    onError: () => toast.error('Failed to create admin'),
  })
}
