import { test, expect } from '@playwright/test'

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('renders email and password fields', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('renders a submit button', async ({ page }) => {
    const btn = page.getByRole('button', { name: /sign ?in|log ?in/i })
    await expect(btn).toBeVisible()
  })

  test('shows validation errors when submitted empty', async ({ page }) => {
    await page.getByRole('button', { name: /sign ?in|log ?in/i }).click()
    const error = page.locator('[class*="pink"]').first()
    await expect(error).toBeVisible({ timeout: 3000 })
  })

  test('has a link to the sign up page', async ({ page }) => {
    const link = page.getByRole('link', { name: /sign ?up|create|register/i }).first()
    await expect(link).toBeVisible()
  })

  test('has a forgot password link', async ({ page }) => {
    const link = page.getByRole('link', { name: /forgot/i }).first()
    await expect(link).toBeVisible()
  })
})

test.describe('Sign up page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup')
  })

  test('renders role selection on first step', async ({ page }) => {
    await expect(page.getByText(/talent|employer|trainer/i).first()).toBeVisible()
  })
})
