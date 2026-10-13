import { expect, test, type Page } from '@playwright/test'

import { login } from '../helpers/login'
import { cleanupTestUser, seedTestUser, studioTestUser } from '../helpers/seedUser'

test.describe('AI Content Studio', () => {
  test.describe.configure({ mode: 'serial' })
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser(studioTestUser)
    page = await (await browser.newContext()).newPage()
    await login({ page, user: studioTestUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser(studioTestUser)
  })

  test('requires a CMS session', async ({ browser }) => {
    const anonymous = await (await browser.newContext()).newPage()
    await anonymous.goto('/admin/ai-studio')
    await expect(anonymous).toHaveURL(/\/admin\/login/)
  })

  test('API endpoints reject anonymous requests', async ({ request }) => {
    const response = await request.post('/api/ai-studio/generate', { data: { action: 'topics', language: 'ja', focus: '' } })
    expect(response.status()).toBe(401)
    expect((await response.json()).error.kind).toBe('unauthorized')
  })

  test('shows the studio with an honest not-configured state', async () => {
    test.skip(Boolean(process.env.ANTHROPIC_API_KEY), 'Only meaningful without an API key')
    await page.goto('/admin/ai-studio')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('AI Content Studio')
    await expect(page.getByText(/AI generation is not configured/)).toBeVisible()
    await page.getByLabel('Topic', { exact: true }).fill('What is Ramadan?')
    await expect(page.getByRole('button', { name: '1. Generate outline' })).toBeDisabled()
  })

  /** Calls the API from inside the admin page, like the studio does (browser sends Origin / Sec-Fetch-Site). */
  const inPageFetch = (path: string, body?: unknown) =>
    page.evaluate(
      async ({ path, body }) => {
        const response = await fetch(path, {
          method: body === undefined ? 'GET' : 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: body === undefined ? undefined : JSON.stringify(body),
        })
        return { status: response.status, json: await response.json() }
      },
      { path, body },
    )

  test('generate endpoint explains what is missing when no API key is set', async () => {
    test.skip(Boolean(process.env.ANTHROPIC_API_KEY), 'Only meaningful without an API key')
    await page.goto('/admin/ai-studio')
    const status = await inPageFetch('/api/ai-studio/status')
    expect(status.json.data).toMatchObject({ configured: false })
    const response = await inPageFetch('/api/ai-studio/generate', { action: 'topics', language: 'ja', focus: '' })
    expect(response.status).toBe(503)
    expect(response.json.error).toMatchObject({ kind: 'not_configured' })
  })

  test('rejects malformed requests with a validation error', async () => {
    const response = await inPageFetch('/api/ai-studio/generate', { action: 'draft', brief: { topic: '' } })
    expect(response.status).toBe(400)
    expect(response.json.error.kind).toBe('invalid_request')
  })

  test('cookie auth is refused for non-browser clients without origin headers (CSRF protection)', async () => {
    const response = await page.request.get('/api/ai-studio/status')
    expect(response.status()).toBe(401)
  })

  test('the admin navigation links to the studio', async () => {
    await page.goto('/admin')
    await expect(page.getByRole('link', { name: 'AI Content Studio' })).toHaveAttribute('href', '/admin/ai-studio')
  })
})
