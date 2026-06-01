import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import type { Student } from '../models/student.models';

export interface StudentFormSubmitPayload {
  firstName: string;
  lastName: string;
  rut: string;
  isActive: boolean;
}

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="student-form">
      <h3>{{ isEditing ? 'Editar Alumno' : 'Nuevo Alumno' }}</h3>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <label for="firstName">Nombre</label>
        <input
          id="firstName"
          type="text"
          maxlength="80"
          formControlName="firstName"
          [disabled]="disabled"
          placeholder="Ej: Benjamín"
        />
        @if (
          form.controls.firstName.touched &&
          form.controls.firstName.invalid
        ) {
          <p class="error">El nombre es requerido (máx. 80 caracteres).</p>
        }

        <label for="lastName">Apellido</label>
        <input
          id="lastName"
          type="text"
          maxlength="80"
          formControlName="lastName"
          [disabled]="disabled"
          placeholder="Ej: González"
        />
        @if (
          form.controls.lastName.touched &&
          form.controls.lastName.invalid
        ) {
          <p class="error">El apellido es requerido (máx. 80 caracteres).</p>
        }

        <label for="rut">RUT (opcional)</label>
        <input
          id="rut"
          type="text"
          maxlength="12"
          formControlName="rut"
          [disabled]="disabled"
          placeholder="Ej: 12345678-9"
        />
        @if (
          form.controls.rut.touched &&
          form.controls.rut.invalid
        ) {
          <p class="error">El RUT debe tener formato chileno válido (ej: 12345678-9).</p>
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
            {{ isEditing ? 'Guardar Cambios' : 'Crear Alumno' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .student-form {
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

      .primary {
        border: 0;
        border-radius: 8px;
        background: #1457d2;
        color: #fff;
        font-weight: 700;
        padding: 0.55rem;
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
export class StudentFormComponent implements OnChanges {
  @Input() student: Student | null = null;
  @Input() disabled = false;

  @Output() save = new EventEmitter<StudentFormSubmitPayload>();
  @Output() cancel = new EventEmitter<void>();

  readonly form;

  get isEditing(): boolean {
    return this.student !== null;
  }

  constructor(private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.nonNullable.group({
      firstName: ['', [Validators.required, Validators.maxLength(80)]],
      lastName: ['', [Validators.required, Validators.maxLength(80)]],
      rut: ['', [Validators.pattern(/^\d{7,8}-[\dkK]$/)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['student'] && this.student) {
      this.form.patchValue(
        {
          firstName: this.student.firstName,
          lastName: this.student.lastName,
          rut: this.student.rut ?? '',
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
      firstName: raw.firstName.trim(),
      lastName: raw.lastName.trim(),
      rut: raw.rut.trim() || '',
      isActive: this.student?.isActive ?? true,
    });
  }
}
