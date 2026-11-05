import { expect, type Locator, type Page } from '@playwright/test'
import { QUESTIONS, type Question } from '../../src/data/catalog'

export async function start(page: Page, path = '/') {
  await page.goto(path)
  await page.getByRole('button', { name: /هيا نبدأ/ }).click()
  await expect(page.locator('.home')).toBeVisible()
}

const lastKey = new WeakMap<Page, string>()

/** Writes over every letter of a copy question, one dab at a time along the letter. */
export async function trace(page: Page, section: Locator) {
  const pad = section.locator('.trace-pad')
  await expect(pad).toHaveAttribute('data-trace-ready', 'true')
  const canvas = section.locator('.trace-ink')
  const points = JSON.parse((await canvas.getAttribute('data-trace-points')) ?? '[]') as [number, number][][]
  // The question slides in: write only once the pad has stopped moving.
  let box = (await canvas.boundingBox())!
  for (let tries = 0; tries < 20; tries += 1) {
    await page.waitForTimeout(120)
    const next = (await canvas.boundingBox())!
    if (next.x === box.x && next.y === box.y && next.width === box.width) break
    box = next
  }
  for (const glyph of points) {
    for (const [x, y] of glyph) {
      await page.mouse.move(box.x + x, box.y + y)
      await page.mouse.down()
      await page.mouse.move(box.x + x + 1, box.y + y + 1)
      await page.mouse.up()
    }
  }
}

/** The question on screen, after the previous one has left. */
export async function current(page: Page, record = true): Promise<{ section: Locator; question: Question }> {
  const previous = lastKey.get(page)
  const section = previous ? page.locator(`section.question:not([data-question-key="${previous}"])`) : page.locator('section.question')
  await expect(section).toHaveCount(1)
  await expect(page.locator('section.question')).toHaveCount(1)
  const key = await section.getAttribute('data-question-key')
  if (key && record) lastKey.set(page, key)
  const question = QUESTIONS.find((q) => q.key === key)
  if (!question) throw new Error(`Unknown question on screen: ${key}`)
  return { section, question }
}

/** Answers the visible question; `correct` picks the right answer (or makes one mistake on a board). */
export async function answer(page: Page, correct: boolean): Promise<Question> {
  const { section, question } = await current(page)

  if (question.kind === 'match') {
    const tops = section.locator('.match-top')
    const ids = await tops.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-pair') ?? ''))
    if (!correct) {
      await tops.first().click()
      await section.locator('.match-bottom[data-decoy="true"]').first().click()
      await expect(section.locator('.match-item.shake')).toHaveCount(2)
      await page.waitForTimeout(500)
    }
    for (const id of ids) {
      await section.locator(`.match-top[data-pair="${id}"]`).click()
      await section.locator(`.match-bottom[data-pair="${id}"]`).click()
    }
    await expect(section.locator('.match-line')).toHaveCount(ids.length)
  } else if (question.kind === 'trace') {
    if (correct) await trace(page, section)
    else {
      // Scribble in a corner, then check twice.
      const box = (await section.locator('.trace-ink').boundingBox())!
      for (let n = 0; n < 2; n += 1) {
        await page.mouse.move(box.x + 6, box.y + 6)
        await page.mouse.down()
        await page.mouse.move(box.x + 30, box.y + 10)
        await page.mouse.up()
        await section.getByRole('button', { name: 'خلصت' }).click()
        await page.waitForTimeout(1300)
      }
    }
  } else {
    // A pick or a missing-letter key: the right one, or any other.
    const tiles = section.locator('[data-option]')
    const ids = await tiles.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-option') ?? ''))
    const answerId = question.kind === 'missing' ? question.answer : rightOption(question, ids)
    const id = correct ? answerId : ids.find((entry) => entry !== answerId)!
    await section.locator(`[data-option="${id}"]`).click()
  }
  await expect(page.locator('.feedback')).toBeVisible()
  return question
}

/** A pick's answer is drawn per round: the right tile is the one the screen marks after answering. */
function rightOption(question: Question, ids: string[]): string {
  if (question.format !== 'pic-for-letter') return question.answer
  // The letter on screen names the answer: the only picture whose word starts with it.
  const letter = question.key.split('-').at(-1)!
  return ids.find((id) => id.startsWith(letter))!
}

export async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
}
