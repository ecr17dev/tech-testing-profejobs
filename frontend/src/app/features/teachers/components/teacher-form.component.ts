import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Teacher } from '../models/teacher.models';

export interface TeacherFormSubmitPayload {
  fullName: string;
  email: string;
}

@Component({
  selector: 'app-teacher-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="teacher-form">
      <h3>{{ isEditing ? 'Editar Profesor' : 'Nuevo Profesor' }}</h3>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <label for="fullName">Nombre completo</label>
        <input
          id="fullName"
          type="text"
          maxlength="120"
          formControlName="fullName"
          [disabled]="disabled"
          placeholder="Ej: Camila Rojas"
        />
        @if (form.controls.fullName.touched && form.controls.fullName.invalid) {
          <p class="error">El nombre es requerido (máx. 120 caracteres).</p>
        }

        <label for="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          maxlength="160"
          formControlName="email"
          [disabled]="disabled"
          placeholder="Ej: camila.rojas@taruca.cl"
        />
        @if (form.controls.email.touched && form.controls.email.invalid) {
          <p class="error">Ingresa un correo electrónico válido.</p>
        }

        <div class="actions">
          <button
            type="button"
            class="secondary"
            (click)="cancel.emit()"
            [disabled]="disabled"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="primary"
            [disabled]="form.invalid || disabled"
          >
            {{ isEditing ? 'Guardar Cambios' : 'Crear Profesor' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .teacher-form {
        border: 1px solid var(--taruca-border);
        border-radius: 10px;
        background: #fff;
        padding: 0.9rem;
        display: grid;
        gap: 0.5rem;
        box-shadow: var(--taruca-shadow-sm);
      }

      h3 {
        margin: 0;
        font-size: 1rem;
      }

      form {
        display: grid;
        gap: 0.45rem;
      }

      label {
        font-size: 0.75rem;
        color: #5b6c84;
      }

      input {
        width: 100%;
        border: 1px solid #cad4e6;
        border-radius: 7px;
        padding: 0.55rem 0.6rem;
      }

      input:focus {
        outline: 2px solid rgba(37, 99, 235, 0.22);
        border-color: #2563eb;
      }

      .actions {
        display: flex;
        gap: 0.45rem;
        justify-content: flex-end;
        margin-top: 0.3rem;
      }

      .secondary {
        border: 1px solid #d3dce9;
        background: #fff;
        color: #5f7088;
        border-radius: 8px;
        padding: 0.5rem 0.75rem;
      }

      .primary {
        border: 0;
        border-radius: 8px;
        background: #1457d2;
        color: #fff;
        font-weight: 700;
        padding: 0.55rem 0.85rem;
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .error {
        margin: 0;
        color: #b42318;
        font-size: 0.76rem;
      }
    `,
  ],
})
export class TeacherFormComponent implements OnChanges {
  @Input() teacher: Teacher | null = null;
  @Input() disabled = false;

  @Output() save = new EventEmitter<TeacherFormSubmitPayload>();
  @Output() cancel = new EventEmitter<void>();

  readonly form;

  get isEditing(): boolean {
    return this.teacher !== null;
  }

  constructor(private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.nonNullable.group({
      fullName: ['', [Validators.required, Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['teacher'] && this.teacher) {
      this.form.patchValue(
        {
          fullName: this.teacher.fullName,
          email: this.teacher.email,
        },
        { emitEvent: false },
      );
      this.form.markAsPristine();
      this.form.markAsUntouched();
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue();
    this.save.emit({
      fullName: raw.fullName.trim(),
      email: raw.email.trim().toLowerCase(),
    });
  }
}
