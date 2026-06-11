/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Recursively omits specified fields from an object or array.
 * @param object - The object or array to process
 * @param fieldsToOmit - Array of field names to omit
 * @returns New object/array with specified fields removed
 */
export function omitFields(object: any, fieldsToOmit: string[]): any {
  if (Array.isArray(object)) return object.map((item) => omitFields(item, fieldsToOmit))

  if (typeof object !== 'object' || object === null) return object

  const result: any = {}
  for (const key of Object.keys(object)) {
    if (fieldsToOmit.includes(key)) continue
    result[key] = omitFields(object[key], fieldsToOmit)
  }
  return result
}
