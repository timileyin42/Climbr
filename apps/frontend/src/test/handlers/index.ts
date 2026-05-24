import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:8000'

export const handlers = [
  // Auth
  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({
      access_token: 'test-token-abc',
      token_type:   'bearer',
      user: { id: 1, email: 'test@example.com', first_name: 'Test', last_name: 'User', role: 'talent', is_verified: true },
    })
  ),
  http.post(`${BASE}/auth/register`, () =>
    HttpResponse.json({
      access_token: 'test-token-abc',
      token_type:   'bearer',
      user: { id: 2, email: 'new@example.com', first_name: 'New', last_name: 'User', role: 'talent', is_verified: false },
    })
  ),
  http.post(`${BASE}/auth/logout`, () => HttpResponse.json({ message: 'Logged out' })),

  // Jobs
  http.get(`${BASE}/jobs`, () =>
    HttpResponse.json({
      jobs: [
        { id: 1, title: 'Frontend Engineer', industry: 'Technology', location: 'Lagos', job_type: 'full_time', employer_name: 'Acme Corp', created_at: '2024-01-15T00:00:00Z', applicant_count: 5, salary_min: 150000, salary_max: 350000 },
        { id: 2, title: 'Backend Developer', industry: 'Technology', location: 'Abuja', job_type: 'remote', employer_name: 'Tech Ltd', created_at: '2024-01-10T00:00:00Z', applicant_count: 12 },
      ],
      total: 2,
      page:  1,
      pages: 1,
    })
  ),

  // Talent dashboard
  http.get(`${BASE}/talent/dashboard`, () =>
    HttpResponse.json({
      total_applications: 3, total_trainings: 1, total_saved_jobs: 5,
      applications_in_review: 1, shortlisted_applications: 1,
      featured_jobs: [], profile_completion: 75, quick_actions: [],
    })
  ),

  // Employer
  http.get(`${BASE}/employer/credits`, () => HttpResponse.json({ job_credits: 3 })),
  http.get(`${BASE}/employer/jobs`,    () => HttpResponse.json({ jobs: [], total: 0 })),
]
