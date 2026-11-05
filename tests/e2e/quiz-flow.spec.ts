import { expect, test } from '@playwright/test'
import { PRACTICE_SIZE, TEST_SIZE } from '../../src/domain/round'
import { answer, current, noHorizontalScroll, start, trace } from './helpers'

test('home lists the card’s five parts in order and the mock test, in Arabic RTL', async ({ page }) => {
  await start(page)
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('.topic-card')).toHaveCount(5)
  await expect(page.locator('.topic-card').evaluateAll((cards) => cards.map((card) => card.getAttribute('data-topic')))).resolves.toEqual([
    'case',
    'letters',
    'words',
    'writing',
    'missing',
  ])
  await expect(page.locator('.test-banner')).toBeVisible()
  await expect(page.locator('.preview-badge').first()).toBeVisible()
  await noHorizontalScroll(page)
})

test('a lesson starts straight away with the test’s instruction line and the Arabic help', async ({ page }) => {
  await start(page)
  await page.locator('.topic-card[data-topic="words"]').click()
  await expect(page.locator('.paper-instruction')).toHaveText('Circle the correct word')
  await expect(page.locator('.paper-help p')).toHaveText('نختار الكلمة الصحيحة حسب الصورة')
  await expect(page.locator('.option-word')).toHaveCount(3)
})

test('a full missing-letter round writes the letter in, gives stars and a review of misses', async ({ page }) => {
  test.setTimeout(150_000)
  await start(page)
  await page.locator('.topic-card[data-topic="missing"]').click()
  for (let n = 0; n < PRACTICE_SIZE; n += 1) {
    const correct = n !== 2 && n !== 5
    await answer(page, correct)
    await expect(page.locator(correct ? '.feedback-good' : '.feedback-miss')).toBeVisible()
    await expect(page.locator('.letter-key.is-correct, .letter-key.is-reveal')).toHaveCount(1)
    await expect(page.locator('.letter-key')).toHaveCount(6)
    await noHorizontalScroll(page)
    await page.locator('.next-button').click()
  }
  await expect(page.locator('.results-card')).toBeVisible()
  await expect(page.locator('.results-number')).toHaveText('٦')
  await expect(page.locator('.review-item')).toHaveCount(2)
  await page.getByRole('button', { name: /الدروس/ }).click()
  await expect(page.locator('.topic-card[data-topic="missing"] .star-icon.is-filled')).toHaveCount(2)
})

test('the matching board is chosen top first, has one extra item, and joins pairs with lines', async ({ page }) => {
  test.setTimeout(120_000)
  await start(page)
  await page.locator('.topic-card[data-topic="case"]').click()
  for (let n = 0; n < PRACTICE_SIZE; n += 1) {
    const { section, question } = await current(page, false)
    if (question.kind === 'match') {
      // The bottom row answers the top: tapping it first only points back up.
      await section.locator('.match-bottom').first().click()
      await expect(section.locator('.match-row-top.nudge')).toHaveCount(1)
      await expect(section.locator('.match-item.is-selected')).toHaveCount(0)
      const tops = await section.locator('.match-top').count()
      await expect(section.locator('.match-bottom')).toHaveCount(tops + 1)
      await answer(page, false)
      await expect(page.locator('.feedback-miss')).toBeVisible()
      await noHorizontalScroll(page)
      return
    }
    await answer(page, true)
    await page.locator('.next-button').click()
  }
  throw new Error('No matching board in the round')
})

test('copying: writing over the grey letters completes it; scribbling twice does not', async ({ page }) => {
  test.setTimeout(150_000)
  await start(page)
  await page.locator('.topic-card[data-topic="writing"]').click()
  const first = await current(page)
  await trace(page, first.section)
  await expect(page.locator('.feedback-good')).toBeVisible()
  await expect(first.section.locator('.trace-board.is-good')).toHaveCount(1)
  await page.locator('.next-button').click()

  const second = await current(page)
  const box = (await second.section.locator('.trace-ink').boundingBox())!
  await page.mouse.move(box.x + 6, box.y + 6)
  await page.mouse.down()
  await page.mouse.move(box.x + 40, box.y + 10)
  await page.mouse.up()
  await second.section.getByRole('button', { name: 'خلصت' }).click()
  // One more try: the ink is cleared, nothing is marked yet.
  await expect(page.locator('.feedback')).toHaveCount(0)
  await expect(second.section.getByRole('button', { name: 'خلصت' })).toBeDisabled({ timeout: 3000 })
  await page.mouse.move(box.x + 6, box.y + 6)
  await page.mouse.down()
  await page.mouse.move(box.x + 40, box.y + 10)
  await page.mouse.up()
  await second.section.getByRole('button', { name: 'خلصت' }).click()
  await expect(page.locator('.feedback-miss')).toBeVisible()
  await noHorizontalScroll(page)
})

test('the mock test follows the Progress Test: Reading A–D, then Writing A–B', async ({ page }) => {
  test.setTimeout(240_000)
  await start(page)
  await page.locator('.test-banner').click()
  const parts: string[] = []
  for (let n = 0; n < TEST_SIZE; n += 1) {
    await expect(page.locator('section.question')).toHaveCount(1)
    parts.push(await page.locator('.paper-part').last().evaluate((node) => [...node.children].map((child) => child.textContent).join(' ')))
    await answer(page, true)
    await page.locator('.next-button').click()
  }
  expect(parts).toEqual(['Reading A)', 'Reading B)', 'Reading C)', 'Reading C)', 'Reading D)', 'Writing A)', 'Writing A)', 'Writing B)', 'Writing B)', 'Writing B)'])
  await expect(page.locator('.results-number')).toHaveText('١٠')
})

test('the book’s pictures load', async ({ page }) => {
  await start(page)
  const image = page.locator('.topic-card[data-topic="words"] img').first()
  await expect(image).toBeVisible()
  expect(await image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
})
