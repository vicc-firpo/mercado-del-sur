const STORAGE_KEY = 'pendingOrderId'

export function setPendingOrderId(orderId: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, orderId)
  } catch {
    // sessionStorage no disponible (modo privado, etc.): seguimos sin persistir.
  }
}

export function getPendingOrderId(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function clearPendingOrderId(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ídem: nada que limpiar si no hay storage.
  }
}
