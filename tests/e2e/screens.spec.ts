import { expect, test } from '@playwright/test'
import { answer, start } from './helpers'

// Visual review captures: run with SCREENS=1 npx playwright test screens
// (SCREENS_TOPIC picks the lesson, default missing).
const path = '/'
const topic = process.env.SCREENS_TOPIC ?? 'missing'
test.skip(!process.env.SCREENS, 'screenshots only on request')

test('capture every screen', async ({ page }, info) => {
  test.setTimeout(120_000)
  const shot = (name: string) => page.screenshot({ path: `test-results/screens/${topic}-${info.project.name}-${name}.png`, fullPage: !name.match(/question|correct|wrong|q4/) })
  await page.goto(path)
  await page.waitForTimeout(1500)
  await shot('1-splash')
  await start(page, path)
  await page.waitForTimeout(1200)
  await shot('2-home')
  await page.locator(`.topic-card[data-topic="${topic}"]`).click()
  await page.waitForTimeout(1200)
  await shot('3-topic')
  await page.locator('.mode-learn').click()
  await page.waitForTimeout(1500)
  await shot('4-learn')
  await page.locator('.learn-next').click()
  await page.waitForTimeout(1500)
  await shot('4b-learn')
  await page.locator('.round-button').first().click()
  await page.locator('.mode-practice').click()
  await page.waitForTimeout(1300)
  await shot('5-question')
  await answer(page, true)
  await page.waitForTimeout(1200)
  await shot('6-correct')
  await page.locator('.next-button').click()
  await page.waitForTimeout(1300)
  await shot('7-question2')
  await answer(page, false)
  await page.waitForTimeout(1500)
  await shot('8-wrong')
  for (let n = 2; n < 8; n += 1) {
    await page.locator('.next-button').click()
    await answer(page, n % 3 !== 0)
    if (n === 4) await shot(`9-q${n}`)
  }
  await page.locator('.next-button').click()
  await expect(page.locator('.results-card')).toBeVisible()
  await page.waitForTimeout(2500)
  await shot('10-results')
})

test('capture a matching board', async ({ page }, info) => {
  test.setTimeout(180_000)
  const shot = (name: string) => page.screenshot({ path: `test-results/screens/board-${topic}-${info.project.name}-${name}.png` })
  await start(page, path)
  await page.locator(`.topic-card[data-topic="${topic}"]`).click()
  for (let round = 0; round < 4; round += 1) {
    await page.locator('.mode-practice').click()
    for (let n = 0; n < 8; n += 1) {
      await page.waitForTimeout(700)
      const board = page.locator('section.question .match-board')
      if (await board.count()) {
        const left = board.locator('.match-left')
        const pairId = await left.first().getAttribute('data-pair')
        await left.first().click()
        await page.waitForTimeout(400)
        await shot('1-selected')
        await board.locator(`.match-right[data-pair="${pairId}"]`).click()
        await page.waitForTimeout(700)
        await shot('2-one-line')
        await answer(page, true)
        await page.waitForTimeout(1400)
        await shot('3-done')
        return
      }
      await answer(page, true)
      await page.locator('.next-button').click()
    }
    await page.getByRole('button', { name: /الدروس/ }).click()
    await page.locator(`.topic-card[data-topic="${topic}"]`).click()
  }
  throw new Error('No matching board came up')
})
