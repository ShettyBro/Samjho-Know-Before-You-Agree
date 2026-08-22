import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { extractPdfText, MAX_PDF_BYTES, validatePdfUpload } from './pdfExtract.js'

function buildMinimalPdf(text: string): Buffer {
  const content = `BT /F1 24 Tf 72 712 Td (${text}) Tj ET`
  const objects: string[] = []
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n',
  )
  objects.push(`4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`)
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n')

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = [0]
  for (const obj of objects) {
    offsets.push(pdf.length)
    pdf += obj
  }
  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return Buffer.from(pdf, 'latin1')
}

test('validatePdfUpload rejects a missing file', () => {
  const error = validatePdfUpload(undefined)
  assert.ok(error)
  assert.equal(error?.code, 'VALIDATION_ERROR')
})

test('validatePdfUpload rejects a non-PDF mimetype', () => {
  const error = validatePdfUpload({ mimetype: 'image/png', originalname: 'file.png', size: 100 })
  assert.ok(error)
  assert.equal(error?.code, 'VALIDATION_ERROR')
})

test('validatePdfUpload rejects a PDF mimetype with a non-.pdf filename', () => {
  const error = validatePdfUpload({ mimetype: 'application/pdf', originalname: 'file.txt', size: 100 })
  assert.ok(error)
  assert.equal(error?.code, 'VALIDATION_ERROR')
})

test('validatePdfUpload rejects a file exceeding the maximum size', () => {
  const error = validatePdfUpload({ mimetype: 'application/pdf', originalname: 'file.pdf', size: MAX_PDF_BYTES + 1 })
  assert.ok(error)
  assert.equal(error?.code, 'PAYLOAD_TOO_LARGE')
})

test('validatePdfUpload accepts a well-formed PDF upload descriptor', () => {
  const error = validatePdfUpload({ mimetype: 'application/pdf', originalname: 'agreement.pdf', size: 1024 })
  assert.equal(error, undefined)
})

test('extractPdfText successfully extracts real text from a valid PDF buffer', async () => {
  const buffer = buildMinimalPdf('Hello Samjho Agreement Text')
  const result = await extractPdfText(buffer)
  assert.equal(result.ok, true)
  if (result.ok) assert.ok(result.text.includes('Hello Samjho Agreement Text'))
})

test('extractPdfText returns a controlled EXTRACTION_FAILED error for a corrupt buffer', async () => {
  const result = await extractPdfText(Buffer.from('this is not a real pdf file'))
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'EXTRACTION_FAILED')
})
