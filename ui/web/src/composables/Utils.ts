import { UIClient } from './UIClient'

export const convertToBoolean = (value: unknown): boolean => {
  let result = false
  if (value != null) {
    // Check the type
    if (typeof value === 'boolean') {
      return value
    } else if (typeof value === 'string' && (value.toLowerCase() === 'true' || value === '1')) {
      result = true
    } else if (typeof value === 'number' && value === 1) {
      result = true
    }
  }
  return result
}

export const convertToInt = (value: unknown): number => {
  if (value == null) {
    return 0
  }
  if (Number.isSafeInteger(value)) {
    return value as number
  }
  if (typeof value === 'number') {
    return Math.trunc(value)
  }
  let changedValue: number = value as number
  if (typeof value === 'string') {
    changedValue = Number.parseInt(value)
  }
  if (Number.isNaN(changedValue)) {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    throw new Error(`Cannot convert to integer: '${value.toString()}'`)
  }
  return changedValue
}

export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key)
  return item != null ? (JSON.parse(item) as T) : defaultValue
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const setToLocalStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const deleteFromLocalStorage = (key: string): void => {
  localStorage.removeItem(key)
}

export const getLocalStorage = (): Storage => {
  return localStorage
}

export const randomUUID = (): `${string}-${string}-${string}-${string}-${string}` => {
  // crypto.randomUUID() only exists in secure contexts (HTTPS/localhost); the UI
  // is also reached over plain HTTP, so fall back to getRandomValues (RFC 4122 v4).
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export const validateUUID = (
  uuid: `${string}-${string}-${string}-${string}-${string}`
): uuid is `${string}-${string}-${string}-${string}-${string}` => {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid)
}

export const useUIClient = (): UIClient => {
  return UIClient.getInstance()
}
