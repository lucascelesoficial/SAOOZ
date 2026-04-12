type ErrorWithMessage = { message: string }

export type ModuleErrorCode =
  | 'network'
  | 'validation'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'unknown'

export interface ModuleError {
  code: ModuleErrorCode
  message: string
  cause?: unknown
}

const DEFAULT_MODULE_ERROR_MESSAGE = 'Não foi possível concluir a operação no momento.'

function isErrorWithMessage(value: unknown): value is ErrorWithMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as ErrorWithMessage).message === 'string'
  )
}

function resolveErrorCode(message: string): ModuleErrorCode {
  const normalized = message.toLowerCase()

  if (
    normalized.includes('network') ||
    normalized.includes('fetch') ||
    normalized.includes('connection')
  ) {
    return 'network'
  }

  if (
    normalized.includes('validation') ||
    normalized.includes('inválido') ||
    normalized.includes('invalido') ||
    normalized.includes('invalid')
  ) {
    return 'validation'
  }

  if (
    normalized.includes('forbidden') ||
    normalized.includes('unauthorized') ||
    normalized.includes('not allowed')
  ) {
    return 'forbidden'
  }

  if (normalized.includes('not found') || normalized.includes('não encontrado')) {
    return 'not_found'
  }

  if (normalized.includes('conflict') || normalized.includes('duplic')) {
    return 'conflict'
  }

  return 'unknown'
}

export function toModuleError(
  error: unknown,
  fallbackMessage: string = DEFAULT_MODULE_ERROR_MESSAGE
): ModuleError {
  if (isErrorWithMessage(error)) {
    const message = error.message.trim() || fallbackMessage
    return {
      code: resolveErrorCode(message),
      message,
      cause: error,
    }
  }

  if (typeof error === 'string') {
    const message = error.trim() || fallbackMessage
    return {
      code: resolveErrorCode(message),
      message,
      cause: error,
    }
  }

  return {
    code: 'unknown',
    message: fallbackMessage,
    cause: error,
  }
}

export function getModuleErrorMessage(
  error: unknown,
  fallbackMessage: string = DEFAULT_MODULE_ERROR_MESSAGE
): string {
  return toModuleError(error, fallbackMessage).message
}
