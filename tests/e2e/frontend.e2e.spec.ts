import { expect, test } from '@playwright/test'

test.describe('Public site (locale routing)', () => {
  test('redirects the root to Japanese', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/ja$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('shows three visitor pathways', async ({ page }) => {
    await page.goto('/ja')
    const pathways = page.getByRole('region', { name: '3つの入口から' }).getByRole('link')
    await expect(pathways).toHaveCount(3)
  })

  test('switches to English and back', async ({ page }) => {
    await page.goto('/ja')
    await page.getByRole('link', { name: 'English' }).first().click()
    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('link', { name: '日本語' }).first()).toHaveAttribute('hreflang', 'ja')
  })

  test('returns 404 for unsupported locales', async ({ page }) => {
    const response = await page.goto('/bn')
    expect(response?.status()).toBe(404)
  })

  test('mobile menu is keyboard accessible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/ja')
    const toggle = page.getByRole('button', { name: 'メニュー' })
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'メニューを閉じる' })).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'メニュー' })).toHaveAttribute('aria-expanded', 'false')
  })
})
