import { strict as assert } from 'node:assert'
import { test } from 'node:test'

process.env.GEMINI_API_KEY = 'test-only-not-a-real-key'
process.env.GEMINI_MODEL = 'gemini-2.5-flash-lite'

test('reports apiKeyPresent true and valid true when both are configured, without exposing the key value', async () => {
  const { getGeminiConfigCheck } = await import('./configCheck.js')

  const check = getGeminiConfigCheck()
  assert.equal(check.apiKeyPresent, true)
  assert.equal(check.model, 'gemini-2.5-flash-lite')
  assert.equal(check.valid, true)
  assert.ok(!('apiKey' in check))
  assert.ok(!JSON.stringify(check).includes('test-only-not-a-real-key'))
})
