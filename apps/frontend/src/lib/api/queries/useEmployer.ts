import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { employerApi, type JobCreate } from '@/lib/api/endpoints/employer'

const K = {
  info:       ['employer', 'info']       as const,
  credits:    ['employer', 'credits']    as const,
  jobs:       (s?: string) => ['employer', 'jobs', s] as const,
  applicants: (jid: number) => ['employer', 'applicants', jid] as const,
}

export function useEmployerInfo()    { return useQuery({ queryKey: K.info,    queryFn: employerApi.info }) }
export function useEmployerCredits() { return useQuery({ queryKey: K.credits, queryFn: employerApi.credits, refetchInterval: false }) }
export function useEmployerJobs(status?: string) {
  return useQuery({ queryKey: K.jobs(status), queryFn: () => employerApi.jobs(status) })
}
export function useJobApplicants(jobId: number) {
  return useQuery({ queryKey: K.applicants(jobId), queryFn: () => employerApi.applicants(jobId), enabled: !!jobId })
}

export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: JobCreate) => employerApi.createJob(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employer', 'jobs'] })
      toast.success('Job posted!')
    },
    onError: () => toast.error('Failed to post job'),
  })
}

export function usePurchaseCredits() {
  return useMutation({
    mutationFn: (packageId: number) => employerApi.purchase(packageId),
    onError: () => toast.error('Failed to start payment'),
  })
}

export function useConfirmPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ref: string) => employerApi.confirmPayment(ref),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: K.credits })
      toast.success(`${data.credits_added} credit${data.credits_added > 1 ? 's' : ''} added!`)
    },
    onError: () => toast.error('Payment verification failed'),
  })
}

export function useApplicantAction(jobId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ applicantId, action }: { applicantId: number; action: 'accept' | 'shortlist' | 'reject' }) => {
      if (action === 'accept')    return employerApi.accept(jobId, applicantId)
      if (action === 'shortlist') return employerApi.shortlist(jobId, applicantId)
      return employerApi.reject(jobId, applicantId)
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: K.applicants(jobId) })
      toast.success(`Applicant ${vars.action}ed`)
    },
    onError: () => toast.error('Action failed'),
  })
}
