import { strict as assert } from 'node:assert'
import { test } from 'node:test'

process.env.GEMINI_API_KEY = ''
process.env.GEMINI_MODEL = 'gemini-2.5-flash-lite'

test('reports apiKeyPresent false and valid false when the key is missing', async () => {
  const { getGeminiConfigCheck } = await import('./configCheck.js')

  const check = getGeminiConfigCheck()
  assert.equal(check.apiKeyPresent, false)
  assert.equal(check.valid, false)
})
