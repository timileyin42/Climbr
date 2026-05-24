import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('has a visible heading', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('has a link to the login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /log ?in|sign ?in/i }).first()
    await expect(loginLink).toBeVisible()
  })

  test('navigates to /login when clicking the login link', async ({ page }) => {
    await page.getByRole('link', { name: /log ?in|sign ?in/i }).first().click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('has a link to signup', async ({ page }) => {
    const signupLink = page.getByRole('link', { name: /sign ?up|get started|join/i }).first()
    await expect(signupLink).toBeVisible()
  })

  test('page title contains Climbr', async ({ page }) => {
    await expect(page).toHaveTitle(/climbr/i)
  })
})
