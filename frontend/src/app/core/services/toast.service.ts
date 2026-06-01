import { Injectable, inject } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'question';

const TOAST_DURATION_MS = 3500;

@Injectable({ providedIn: 'root' })
export class ToastService {
  /**
   * Muestra un toast notification (SweetAlert2 en modo toast).
   * No bloquea el hilo — se cierra automáticamente.
   */
  show(type: ToastType, message: string, durationMs = TOAST_DURATION_MS): void {
    const icons: Record<ToastType, string> = {
      success: '#0a8b4a',
      error: '#ba1a1a',
      warning: '#d97706',
      info: '#2563eb',
      question: '#6b7280',
    };

    void Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type as SweetAlertIcon,
      iconColor: icons[type],
      title: message,
      showConfirmButton: false,
      timer: durationMs,
      timerProgressBar: true,
      background: '#ffffff',
      color: '#0b1c30',
      didOpen: (popup) => {
        popup.addEventListener('mouseenter', Swal.stopTimer);
        popup.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
  }

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  warning(message: string): void {
    this.show('warning', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  /**
   * Diálogo de confirmación — reemplaza window.confirm().
   * Retorna true si el usuario confirmó, false si canceló o cerró.
   */
  confirm(options: {
    title: string;
    text?: string;
    confirmText?: string;
    cancelText?: string;
    icon?: ToastType;
    dangerMode?: boolean;
  }): Promise<boolean> {
    const {
      title,
      text,
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      icon = 'question',
      dangerMode = false,
    } = options;

    const swalOptions: Record<string, unknown> = {
      title,
      text,
      icon: icon as SweetAlertIcon,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: dangerMode ? '#ba1a1a' : '#2563eb',
      cancelButtonColor: '#6b7280',
      background: '#ffffff',
      color: '#0b1c30',
    };

    return Swal.fire(swalOptions).then(
      (result: SweetAlertResult) => result.isConfirmed,
    );
  }
}
