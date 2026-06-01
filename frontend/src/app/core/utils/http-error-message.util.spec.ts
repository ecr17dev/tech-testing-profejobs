import { HttpErrorResponse } from '@angular/common/http';
import { getHttpErrorMessage } from './http-error-message.util';

describe('getHttpErrorMessage', () => {
  it('returns backend message when present as string', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { message: 'La nota debe estar entre 1.0 y 7.0' },
    });

    expect(getHttpErrorMessage(error, 'fallback')).toBe(
      'La nota debe estar entre 1.0 y 7.0',
    );
  });

  it('returns connection message on status 0', () => {
    const error = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error',
      error: new ProgressEvent('error'),
    });

    expect(getHttpErrorMessage(error, 'fallback')).toBe(
      'No fue posible conectar con el backend. Verifica que esté activo.',
    );
  });
});
