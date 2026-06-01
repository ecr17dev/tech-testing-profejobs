import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-period-status-banner',
  standalone: true,
  template: `
    <div class="status" [class.status--closed]="!isOpen" [class.status--open]="isOpen">
      <strong>{{ isOpen ? 'Período Abierto' : 'Período Cerrado' }}</strong>
      <span>
        {{
          isOpen
            ? 'Puedes crear y editar calificaciones'
            : 'Solo lectura: creación, edición y eliminación bloqueadas'
        }}
      </span>
    </div>
  `,
  styles: [
    `
      .status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.62rem 0.8rem;
        border-radius: 8px;
        border: 1px solid;
        font-size: 0.82rem;
      }

      .status strong {
        font-size: 0.8rem;
      }

      .status--open {
        border-color: #1c8d5b;
        background: #0f8a4b;
        color: #ecfff5;
      }

      .status--closed {
        border-color: #bc4b3c;
        background: #fff1ee;
        color: #7f1d1d;
      }
    `,
  ],
})
export class PeriodStatusBannerComponent {
  @Input({ required: true }) isOpen = true;
}
