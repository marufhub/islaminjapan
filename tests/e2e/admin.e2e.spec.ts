import { expect, test, type Page } from '@playwright/test'

import { login } from '../helpers/login'
import { cleanupTestUser, seedTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()
    const context = await browser.newContext()
    page = await context.newPage()
    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('shows the content collections', async () => {
    await page.goto('/admin/collections/articles')
    await expect(page.locator('h1', { hasText: 'Articles' }).first()).toBeVisible()
  })

  test('opens the article editor with workflow controls', async () => {
    await page.goto('/admin/collections/articles/create')
    await expect(page.locator('input[name="title"]')).toBeVisible()
    await expect(page.getByText('Editorial status').first()).toBeVisible()
  })
})
