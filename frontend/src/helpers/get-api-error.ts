import type { ApiError } from '@/types/api-error'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function getApiError(error: unknown): ApiError | null {
  if (!isObject(error) || !isObject(error.data)) return null

  const { data } = error
  const message = data.message

  if (typeof message !== 'string' && !Array.isArray(message)) return null

  return {
    statusCode: typeof data.statusCode === 'number' ? data.statusCode : 500,
    message: message as string | string[],
    error: typeof data.error === 'string' ? data.error : undefined,
  }
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const apiError = getApiError(error)
  if (!apiError) return fallback
  return Array.isArray(apiError.message)
    ? (apiError.message[0] ?? fallback)
    : apiError.message
}
