import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsApi, type JobFilters, type TrainingFilters } from '@/lib/api/endpoints/jobs'

export const jobKeys = {
  all:           ['jobs'] as const,
  lists:         () => [...jobKeys.all, 'list'] as const,
  list:          (f: JobFilters) => [...jobKeys.lists(), f] as const,
  detail:        (id: number) => [...jobKeys.all, 'detail', id] as const,
  recommended:   () => [...jobKeys.all, 'recommended'] as const,
  trainings:     ['trainings'] as const,
  trainingLists: () => [...jobKeys.trainings, 'list'] as const,
  trainingList:  (f: TrainingFilters) => [...jobKeys.trainingLists(), f] as const,
  trainingDetail:(id: number) => [...jobKeys.trainings, 'detail', id] as const,
}

export function useJobs(filters: JobFilters = {}) {
  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn:  () => jobsApi.list(filters),
  })
}

export function useJob(id: number) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn:  () => jobsApi.detail(id),
    enabled:  !!id,
  })
}

export function useRecommendedJobs(talentId?: number) {
  return useQuery({
    queryKey: [...jobKeys.recommended(), talentId],
    queryFn:  () => jobsApi.recommended(talentId),
  })
}

export function useTrainings(filters: TrainingFilters = {}) {
  return useQuery({
    queryKey: jobKeys.trainingList(filters),
    queryFn:  () => jobsApi.trainings(filters),
  })
}

export function useTraining(id: number) {
  return useQuery({
    queryKey: jobKeys.trainingDetail(id),
    queryFn:  () => jobsApi.trainingDetail(id),
    enabled:  !!id,
  })
}

export function useContact() {
  return useMutation({
    mutationFn: jobsApi.contact,
  })
}

export function useRecommendedTrainings(talentId?: number) {
  return useQuery({
    queryKey: [...jobKeys.trainings, 'recommended', talentId],
    queryFn:  () => jobsApi.recommendedTrainings(talentId),
  })
}
