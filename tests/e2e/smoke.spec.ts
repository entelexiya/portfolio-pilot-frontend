import { expect, test } from '@playwright/test'

const E2E_USER_EMAIL = process.env.E2E_USER_EMAIL
const E2E_USER_PASSWORD = process.env.E2E_USER_PASSWORD
const E2E_VERIFIER_EMAIL = process.env.E2E_VERIFIER_EMAIL || E2E_USER_EMAIL
const API_URL =
  process.env.E2E_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://portfolio-pilot-api.vercel.app'

function uniqueTitle() {
  return `E2E Achievement ${Date.now()}`
}

test('landing page is reachable', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /your portfolio,?/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /start building free/i })).toBeVisible()
})

test.describe('critical flow: login -> create -> request verification -> verify', () => {
  test.skip(
    !E2E_USER_EMAIL || !E2E_USER_PASSWORD,
    'E2E_USER_EMAIL and E2E_USER_PASSWORD are required for critical smoke flow'
  )

  test('user can complete verification smoke flow', async ({ page, request, baseURL }) => {
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    await page.goto('/login')
    await page.getByPlaceholder('Email').fill(E2E_USER_EMAIL!)
    await page.getByPlaceholder('Password').fill(E2E_USER_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/dashboard/)
    await page.getByRole('button', { name: /add achievement/i }).click()

    const title = uniqueTitle()
    await page.getByPlaceholder('e.g., IOI Gold Medal 2025').fill(title)
    await page.getByRole('button', { name: /create achievement/i }).click()

    await expect(page.getByText(title)).toBeVisible()

    const requestVerificationButton = page
      .getByRole('button', { name: /request verification/i })
      .first()
    await requestVerificationButton.click({ force: true })
    await page.getByPlaceholder('teacher@school.edu.kz').fill(E2E_VERIFIER_EMAIL!)
    await page.getByRole('button', { name: /send request/i }).click()

    const accessToken = await page.evaluate(() => {
      const key = Object.keys(localStorage).find((k) => k.includes('auth-token'))
      if (!key) return null

      const raw = localStorage.getItem(key)
      if (!raw) return null

      try {
        const parsed = JSON.parse(raw) as
          | { access_token?: string; currentSession?: { access_token?: string } }
          | null
        return parsed?.access_token || parsed?.currentSession?.access_token || null
      } catch {
        return null
      }
    })

    expect(accessToken).toBeTruthy()

    const achRes = await request.get(
      `${API_URL}/api/achievements?userId=me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    expect(achRes.ok()).toBeTruthy()
    const achJson = (await achRes.json()) as { data?: Array<{ id: string; title: string }> }
    const created = (achJson.data || []).find((a) => a.title === title)
    expect(created?.id).toBeTruthy()

    const reqRes = await request.post(`${API_URL}/api/verification/request`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        achievementId: created!.id,
        verifierEmail: E2E_VERIFIER_EMAIL,
        message: 'E2E smoke verification request',
      },
    })
    expect(reqRes.ok()).toBeTruthy()
    const reqJson = (await reqRes.json()) as { verifyUrl?: string; data?: { verifyUrl?: string } }
    const verifyUrlRaw = reqJson.verifyUrl || reqJson.data?.verifyUrl
    expect(verifyUrlRaw).toBeTruthy()

    const token = verifyUrlRaw!.split('/').pop()
    expect(token).toBeTruthy()

    await page.goto(`${baseURL}/verify/${token}`)
    await expect(page.getByText(/verify student achievement/i)).toBeVisible()
    await page.getByRole('button', { name: /^confirm$/i }).click()
    await expect(page.getByText(/achievement verified/i)).toBeVisible()
  })
})
