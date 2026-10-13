import { expect, type Page } from '@playwright/test'
import { QUESTIONS, type Question } from '../../src/data/catalog'

export async function start(page: Page, path = '/') {
  await page.goto(path)
  await page.getByRole('button', { name: /هيا نبدأ/ }).click()
  await expect(page.locator('.home')).toBeVisible()
}

const lastKey = new WeakMap<Page, string>()

/** Answers the visible question; `correct` picks the right answer (or makes one mistake on a board). */
export async function answer(page: Page, correct: boolean): Promise<Question> {
  // The previous question animates out before the next one mounts.
  const previous = lastKey.get(page)
  const section = previous
    ? page.locator(`section.question:not([data-question-key="${previous}"])`)
    : page.locator('section.question')
  await expect(section).toHaveCount(1)
  await expect(page.locator('section.question')).toHaveCount(1)
  const key = await section.getAttribute('data-question-key')
  if (key) lastKey.set(page, key)
  const question = QUESTIONS.find((q) => q.key === key)
  if (!question) throw new Error(`Unknown question on screen: ${key}`)

  if (question.kind === 'match') {
    const [first, second] = question.pairs
    if (!correct) {
      await section.locator(`.match-left[data-pair="${first!.id}"]`).click()
      await section.locator(`.match-right[data-pair="${second!.id}"]`).click()
      await expect(section.locator('.match-item.shake')).toHaveCount(2)
    }
    for (const pair of question.pairs) {
      await section.locator(`.match-left[data-pair="${pair.id}"]`).click()
      await section.locator(`.match-right[data-pair="${pair.id}"]`).click()
    }
    await expect(section.locator('.match-line')).toHaveCount(question.pairs.length)
  } else {
    const option = correct
      ? question.options.find((o) => o.id === question.answer)!
      : question.options.find((o) => o.id !== question.answer)!
    await section.locator(`.option[data-option="${option.id}"]`).click()
  }
  await expect(page.locator('.feedback')).toBeVisible()
  return question
}

export async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
}
