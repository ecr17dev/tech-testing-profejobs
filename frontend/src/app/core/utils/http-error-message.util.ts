import { HttpErrorResponse } from '@angular/common/http';

function normalizeMessage(message: unknown): string | null {
  if (typeof message === 'string' && message.trim().length > 0) {
    return message.trim();
  }

  if (Array.isArray(message)) {
    const collected = message
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (collected.length > 0) {
      return collected.join(' · ');
    }
  }

  return null;
}

export function getHttpErrorMessage(
  error: HttpErrorResponse,
  fallbackMessage: string,
): string {
  const backendMessage = normalizeMessage(error.error?.message);
  if (backendMessage) {
    return backendMessage;
  }

  if (error.status === 0) {
    return 'No fue posible conectar con el backend. Verifica que esté activo.';
  }

  if (error.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }

  if (error.status === 409) {
    return 'El registro ya existe o está en conflicto con el estado actual.';
  }

  if (error.status === 400) {
    return 'Hay datos inválidos en la solicitud. Revisa la información ingresada.';
  }

  return fallbackMessage;
}
