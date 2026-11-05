import { expect, test } from '@playwright/test'
import { answer, current, start } from './helpers'

// Visual review captures: run with SCREENS=1 npx playwright test screens
// (SCREENS_TOPIC picks one lesson; by default every lesson and the mock test).
test.skip(!process.env.SCREENS, 'screenshots only on request')

const TOPICS = process.env.SCREENS_TOPIC ? [process.env.SCREENS_TOPIC] : ['case', 'letters', 'words', 'writing', 'missing']

test('capture the splash, home and results', async ({ page }, info) => {
  test.setTimeout(120_000)
  const shot = (name: string) => page.screenshot({ path: `test-results/screens/${info.project.name}-${name}.png`, fullPage: true })
  await page.goto('/')
  await page.waitForTimeout(1500)
  await shot('1-splash')
  await start(page)
  await page.waitForTimeout(1200)
  await shot('2-home')
  await page.locator('.test-banner').click()
  for (let n = 0; n < 10; n += 1) {
    await page.waitForTimeout(500)
    if (n === 0) await page.screenshot({ path: `test-results/screens/${info.project.name}-3-test-first.png` })
    await answer(page, n % 4 !== 3)
    await page.locator('.next-button').click()
  }
  await expect(page.locator('.results-card')).toBeVisible()
  await page.waitForTimeout(2600)
  await shot('4-results')
})

for (const topic of TOPICS) {
  test(`capture every question style of ${topic}`, async ({ page }, info) => {
    test.setTimeout(240_000)
    await start(page)
    const seen = new Set<string>()
    for (let round = 0; round < 3; round += 1) {
      await page.locator(`.topic-card[data-topic="${topic}"]`).click()
      for (let n = 0; n < 8; n += 1) {
        await page.waitForTimeout(900)
        const { question } = await current(page, false)
        const fresh = !seen.has(question.format)
        if (fresh) await page.screenshot({ path: `test-results/screens/${topic}-${info.project.name}-${question.format}-a.png` })
        await answer(page, fresh ? seen.size % 2 === 0 : true)
        if (fresh) {
          await page.waitForTimeout(1300)
          await page.screenshot({ path: `test-results/screens/${topic}-${info.project.name}-${question.format}-b.png` })
          seen.add(question.format)
        }
        await page.locator('.next-button').click()
      }
      await expect(page.locator('.results-card')).toBeVisible()
      await page.getByRole('button', { name: /الدروس/ }).click()
    }
  })
}
