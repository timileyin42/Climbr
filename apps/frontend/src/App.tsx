import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { router } from './router'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: 'bg-white border border-[var(--color-border)] shadow-[var(--shadow-card)] text-[var(--color-text-primary)]',
          },
        }}
      />
    </QueryClientProvider>
    </ErrorBoundary>
  )
}
