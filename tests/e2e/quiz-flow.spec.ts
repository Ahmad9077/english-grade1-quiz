import { expect, test } from '@playwright/test'
import { QUESTIONS } from '../../src/data/catalog'
import { PRACTICE_SIZE } from '../../src/domain/round'
import { answer, noHorizontalScroll, start } from './helpers'

test('home lists the four lessons and the mock test, in Arabic RTL', async ({ page }) => {
  await start(page)
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('.topic-card')).toHaveCount(4)
  await expect(page.locator('.test-banner')).toBeVisible()
  await expect(page.locator('.preview-badge').first()).toBeVisible()
  await noHorizontalScroll(page)
})

test('learn cards teach the five test words first, aloud', async ({ page }) => {
  await start(page)
  // The lesson preloads its explanations, so the clip is fetched as soon as the lesson opens.
  const narration = page.waitForResponse((res) => res.url().includes('/audio/en/fact/word-box') && res.ok())
  await page.locator('.topic-card[data-topic="missing"]').click()
  await narration
  await page.locator('.mode-learn').click()
  const words: string[] = []
  for (let n = 0; n < 5; n += 1) {
    await expect(page.locator('.learn-card .word-label')).toHaveCount(1)
    words.push((await page.locator('.learn-card .word-label').innerText()).trim())
    await page.locator('.learn-next').click()
  }
  expect(words).toEqual(['box', 'ant', 'mug', 'lamb', 'bat'])
  await expect(page.locator('.learn-done')).toBeVisible()
  await page.getByRole('button', { name: /يلا نتدرب/ }).click()
  await expect(page.locator('section.question')).toBeVisible()
})

test('a full practice round gives feedback, stars and a review of misses', async ({ page }) => {
  test.setTimeout(120_000)
  await start(page)
  await page.locator('.topic-card[data-topic="missing"]').click()
  await page.locator('.mode-practice').click()

  for (let n = 0; n < PRACTICE_SIZE; n += 1) {
    const correct = n !== 2 && n !== 5
    const question = await answer(page, correct)
    await expect(page.locator(correct ? '.feedback-good' : '.feedback-miss')).toBeVisible()
    // The missing letter fills in once answered, as on the test sheet.
    await expect(page.locator('.blank-slot.is-filled')).toHaveText(question.answer)
    if (!correct) await expect(page.locator('.option.is-reveal')).toHaveCount(1)
    await noHorizontalScroll(page)
    await page.locator('.next-button').click()
  }

  await expect(page.locator('.results-card')).toBeVisible()
  await expect(page.locator('.results-number')).toHaveText('٦')
  await expect(page.locator('.review-item')).toHaveCount(2)
  await page.getByRole('button', { name: /الدروس/ }).click()
  await expect(page.locator('.topic-card[data-topic="missing"] .star-icon.is-filled')).toHaveCount(2)
})

test('the matching board joins pairs with lines and counts a mistake', async ({ page }) => {
  test.setTimeout(180_000)
  await start(page)
  await page.locator('.topic-card[data-topic="case"]').click()
  let boards = 0
  // Practice rounds are shuffled; play until two boards have been seen.
  for (let round = 0; round < 4 && boards < 2; round += 1) {
    await page.locator('.mode-practice').click()
    for (let n = 0; n < PRACTICE_SIZE; n += 1) {
      const key = await page.locator('section.question').last().getAttribute('data-question-key')
      const isBoard = QUESTIONS.find((q) => q.key === key)?.kind === 'match'
      const correct = !(isBoard && boards === 0)
      await answer(page, correct)
      if (isBoard) {
        boards += 1
        await expect(page.locator(correct ? '.feedback-good' : '.feedback-miss')).toBeVisible()
        await noHorizontalScroll(page)
      }
      await page.locator('.next-button').click()
    }
    await expect(page.locator('.results-card')).toBeVisible()
    await page.getByRole('button', { name: /الدروس/ }).click()
    await page.locator('.topic-card[data-topic="case"]').click()
  }
  expect(boards).toBeGreaterThanOrEqual(1)
})

test('the mock test mixes all four lessons', async ({ page }) => {
  test.setTimeout(120_000)
  await start(page)
  await page.locator('.test-banner').click()
  const topics = new Set<string>()
  for (let n = 0; n < 12; n += 1) {
    const question = await answer(page, true)
    topics.add(question.topic)
    await page.locator('.next-button').click()
  }
  expect(topics.size).toBe(4)
  await expect(page.locator('.results-number')).toHaveText('١٢')
})

test('picture choices are read aloud with their tile highlighted', async ({ page }) => {
  await start(page)
  await page.locator('.topic-card[data-topic="missing"]').click()
  await page.locator('.mode-practice').click()
  await expect(page.locator('.option.is-speaking')).toHaveCount(1, { timeout: 10_000 })
})
