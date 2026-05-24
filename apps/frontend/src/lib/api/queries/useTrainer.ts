import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { trainerApi, type TrainingCreate } from '@/lib/api/endpoints/trainer'

const K = {
  info:       ['trainer', 'info']        as const,
  credits:    ['trainer', 'credits']     as const,
  trainings:  (s?: string) => ['trainer', 'trainings', s] as const,
  applicants: (tid: number) => ['trainer', 'applicants', tid] as const,
}

export function useTrainerInfo()    { return useQuery({ queryKey: K.info,    queryFn: trainerApi.info }) }
export function useTrainerCredits() { return useQuery({ queryKey: K.credits, queryFn: trainerApi.credits }) }
export function useTrainerTrainings(status?: string) {
  return useQuery({ queryKey: K.trainings(status), queryFn: () => trainerApi.trainings(status) })
}
export function useTrainingApplicants(trainingId: number) {
  return useQuery({ queryKey: K.applicants(trainingId), queryFn: () => trainerApi.applicants(trainingId), enabled: !!trainingId })
}

export function useCreateTraining() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: TrainingCreate) => trainerApi.createTraining(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainer', 'trainings'] })
      toast.success('Training posted!')
    },
    onError: () => toast.error('Failed to post training'),
  })
}

export function usePurchaseTrainerCredits() {
  return useMutation({
    mutationFn: (packageId: number) => trainerApi.purchase(packageId),
    onError: () => toast.error('Failed to start payment'),
  })
}

export function useConfirmTrainerPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ref: string) => trainerApi.confirmPayment(ref),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: K.credits })
      toast.success(`${data.credits_added} credit${data.credits_added > 1 ? 's' : ''} added!`)
    },
    onError: () => toast.error('Payment verification failed'),
  })
}

export function useTrainerApplicantAction(trainingId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ applicantId, action }: { applicantId: number; action: 'accept' | 'shortlist' | 'reject' }) => {
      if (action === 'accept')    return trainerApi.accept(trainingId, applicantId)
      if (action === 'shortlist') return trainerApi.shortlist(trainingId, applicantId)
      return trainerApi.reject(trainingId, applicantId)
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: K.applicants(trainingId) })
      toast.success(`Applicant ${vars.action}ed`)
    },
    onError: () => toast.error('Action failed'),
  })
}
