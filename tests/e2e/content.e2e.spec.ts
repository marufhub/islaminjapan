import { expect, test } from '@playwright/test'

import { FIXTURE } from '../helpers/fixtures'

test.describe('Published content', () => {
  test('article page shows metadata, references and the translation link', async ({ page }) => {
    await page.goto(`/ja/articles/${FIXTURE.articleSlug}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(FIXTURE.articleTitleJa)
    await expect(page.getByRole('heading', { name: '出典・参考文献' })).toBeVisible()
    await expect(page.getByText(FIXTURE.sourceTitle)).toBeVisible()
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', new RegExp(`/en/articles/${FIXTURE.articleSlug}$`))
    await page.getByRole('link', { name: 'English version' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(FIXTURE.articleTitleEn)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('shows an honest notice when an article is not available in English', async ({ page }) => {
    await page.goto(`/en/articles/${FIXTURE.jaOnlySlug}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('This article is not yet available in English')
    await expect(page.getByRole('link', { name: /Read the Japanese version/ })).toHaveAttribute('href', `/ja/articles/${FIXTURE.jaOnlySlug}`)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })

  test('never shows unpublished drafts to the public', async ({ page }) => {
    const response = await page.goto(`/ja/articles/${FIXTURE.draftSlug}`)
    expect(response?.status()).toBe(404)
  })

  test('article search finds Japanese text without word spacing', async ({ page }) => {
    await page.goto('/ja/articles')
    await page.getByRole('searchbox').fill('ラマダン')
    await page.getByRole('button', { name: '検索' }).click()
    await expect(page.getByRole('link', { name: FIXTURE.articleTitleJa })).toBeVisible()
  })

  test('FAQ search and accordion work', async ({ page }) => {
    await page.goto('/ja/faq')
    await page.getByRole('searchbox').fill('断食')
    await page.getByRole('button', { name: '検索' }).click()
    const question = page.getByText(FIXTURE.faqQuestion)
    await expect(question).toBeVisible()
    await expect(page.getByText('テスト用の回答です。')).toBeVisible()
  })

  test('timeline marks approximate dates and filters by period', async ({ page }) => {
    await page.goto('/ja/islam-in-japan')
    const entry = page.getByRole('listitem').filter({ hasText: FIXTURE.eventTitle })
    await expect(entry).toContainText('1890年頃')
    await page.getByRole('link', { name: '昭和戦後', exact: true }).click()
    await expect(page.getByText(FIXTURE.eventTitle)).toHaveCount(0)
    await page.getByRole('link', { name: '明治', exact: true }).click()
    await expect(page.getByText(FIXTURE.eventTitle)).toBeVisible()
  })

  test('event detail page renders the date and sources', async ({ page }) => {
    await page.goto('/ja/islam-in-japan')
    await page.getByRole('link', { name: FIXTURE.eventTitle }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(FIXTURE.eventTitle)
    await expect(page.getByText(FIXTURE.sourceTitle)).toBeVisible()
  })

  test('history event is hidden in a language it is not published in', async ({ page }) => {
    await page.goto('/en/islam-in-japan')
    await expect(page.getByText(FIXTURE.eventTitle)).toHaveCount(0)
  })
})

test.describe('Contact and preview', () => {
  test('contact form validates and accepts an inquiry', async ({ page }) => {
    await page.goto('/en/contact')
    await page.getByLabel(/^Name/).fill('E2E Visitor')
    await page.getByLabel(/^Email/).fill('not-an-email')
    await page.getByLabel(/^Subject/).fill('Question about prayer')
    await page.getByLabel(/^Message/).fill('How do Muslims pray at work in Japan?')
    // The server rejects implausibly fast submissions; wait like a person would.
    await page.waitForTimeout(3200)
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.locator('form').getByRole('alert')).toHaveText('Please check the highlighted fields.')
    await expect(page.getByLabel(/^Email/)).toHaveAttribute('aria-invalid', 'true')

    await page.getByLabel(/^Email/).fill(FIXTURE.contactEmail)
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.getByRole('status')).toContainText('we have received your message')
  })

  test('draft preview requires a CMS session', async ({ request }) => {
    const response = await request.get('/preview?path=/ja', { maxRedirects: 0 })
    expect(response.status()).toBe(401)
  })

  test('robots.txt blocks crawling until indexing is enabled', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text()
    expect(body).toContain('Disallow: /')
  })
})
