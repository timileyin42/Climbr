import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { talentApi } from '@/lib/api/endpoints/talent'

export const talentKeys = {
  dashboard:       ['talent', 'dashboard'] as const,
  profile:         ['talent', 'profile'] as const,
  applications:    (p?: object) => ['talent', 'applications', p] as const,
  savedJobs:       ['talent', 'saved-jobs'] as const,
  savedTrainings:  ['talent', 'saved-trainings'] as const,
}

export function useTalentDashboard() {
  return useQuery({ queryKey: talentKeys.dashboard, queryFn: talentApi.dashboard })
}

export function useTalentProfile() {
  return useQuery({ queryKey: talentKeys.profile, queryFn: talentApi.profile })
}

export function useUpdateTalentProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: talentApi.updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: talentKeys.profile })
      toast.success('Profile updated')
    },
    onError: () => toast.error('Failed to save changes'),
  })
}

export function useApplications(params?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: talentKeys.applications(params),
    queryFn:  () => talentApi.applications(params),
  })
}

export function useApplyJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: talentApi.applyJob,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: talentKeys.applications() })
      qc.invalidateQueries({ queryKey: talentKeys.dashboard })
      toast.success('Application submitted!')
    },
    onError: () => toast.error('Failed to apply — try again'),
  })
}

export function useApplyTraining() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: talentApi.applyTraining,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: talentKeys.applications() })
      qc.invalidateQueries({ queryKey: talentKeys.dashboard })
      toast.success('Application submitted!')
    },
    onError: () => toast.error('Failed to apply — try again'),
  })
}

export function useRemoveApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, type }: { id: number; type: 'job' | 'training' }) =>
      type === 'job' ? talentApi.removeJobApplication(id) : talentApi.removeTrainingApplication(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: talentKeys.applications() })
      qc.invalidateQueries({ queryKey: talentKeys.dashboard })
      toast.success('Application removed')
    },
    onError: () => toast.error('Failed to remove application'),
  })
}

export function useSavedJobs() {
  return useQuery({ queryKey: talentKeys.savedJobs, queryFn: talentApi.savedJobs })
}

export function useSaveJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: talentApi.saveJob,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: talentKeys.savedJobs })
      qc.invalidateQueries({ queryKey: talentKeys.dashboard })
    },
  })
}

export function useUnsaveJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: talentApi.unsaveJob,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: talentKeys.savedJobs })
      qc.invalidateQueries({ queryKey: talentKeys.dashboard })
    },
  })
}

export function useSavedTrainings() {
  return useQuery({ queryKey: talentKeys.savedTrainings, queryFn: talentApi.savedTrainings })
}
