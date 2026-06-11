import fs from 'node:fs'
import path from 'node:path'
import test, { expect } from '@playwright/test'
import { omitFields } from './omit-fields'

/**
 * Asserts that `actualResponse` matches a saved JSON snapshot.
 *
 * Expected JSON files live in an `upload-files/` folder next to the spec:
 *   <spec-dir>/upload-files/<filename>
 *
 * TEACH_MODE:
 *   Set `TEACH_MODE=true` to write the actual response to disk instead of asserting —
 *   this lets you capture a baseline snapshot on the first run.
 *   Example: TEACH_MODE=true pnpm test -- <path>
 *
 * @param actualResponse - The parsed response body to assert
 * @param filename       - JSON file name inside the `upload-files/` folder (e.g. `get-activities.json`)
 * @param ignoreFields   - Optional list of field names to strip before comparison (e.g. dynamic timestamps)
 */
export function assertResponseBody(actualResponse: unknown, filename: string, ignoreFields: string[] = []): void {
  const uploadFilePath = path.join(path.dirname(test.info().file), 'upload-files', filename)

  if (process.env['TEACH_MODE'] === 'true') {
    fs.mkdirSync(path.dirname(uploadFilePath), { recursive: true })
    fs.writeFileSync(uploadFilePath, JSON.stringify(actualResponse, null, 2), 'utf8')
  } else {
    if (!fs.existsSync(uploadFilePath)) {
      throw new Error(`Snapshot file not found: ${uploadFilePath}\nRun with TEACH_MODE=true to create it.`)
    }

    const expected: unknown = JSON.parse(fs.readFileSync(uploadFilePath, 'utf8'))

    if (ignoreFields.length > 0) {
      const cleanedActual = omitFields(actualResponse, ignoreFields)
      const cleanedExpected = omitFields(expected, ignoreFields)
      expect(cleanedActual, `Response does not match snapshot: ${filename}`).toStrictEqual(cleanedExpected)
    } else {
      expect(actualResponse, `Response does not match snapshot: ${filename}`).toStrictEqual(expected)
    }
  }
}
