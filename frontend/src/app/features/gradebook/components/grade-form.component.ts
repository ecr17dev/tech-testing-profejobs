import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

export interface GradeFormSubmitPayload {
  score: number;
  evaluationName?: string;
  evaluationDescription?: string;
}

@Component({
  selector: 'app-grade-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="grade-form">
      <h3>Editar calificación</h3>

      <p class="label">Estudiante seleccionado</p>
      <p class="meta">{{ studentName }}</p>

      <p class="label">Evaluación</p>
      <p class="chip">{{ evaluationName }}</p>

      <form [formGroup]="form" (ngSubmit)="submit()">
        @if (requireEvaluationMetadata) {
          <label for="evaluationName">Nombre evaluación</label>
          <input
            id="evaluationName"
            type="text"
            maxlength="120"
            formControlName="evaluationName"
            [disabled]="disabled"
          />
          @if (
            form.controls.evaluationName.touched &&
            form.controls.evaluationName.invalid
          ) {
            <p class="error">Ingresa un nombre entre 2 y 120 caracteres.</p>
          }

          <label for="evaluationDescription">Descripción (opcional)</label>
          <textarea
            id="evaluationDescription"
            rows="2"
            maxlength="255"
            formControlName="evaluationDescription"
            [disabled]="disabled"
          ></textarea>
        }

        <label for="score">Nota (1.0 - 7.0)</label>
        <input
          id="score"
          type="number"
          step="0.1"
          min="1"
          max="7"
          formControlName="score"
          [disabled]="disabled"
        />

        @if (form.controls.score.touched && form.controls.score.invalid) {
          <p class="error">La nota debe estar entre 1.0 y 7.0.</p>
        }

        <button type="submit" class="primary" [disabled]="form.invalid || disabled">
          Guardar Cambios
        </button>

        <div class="actions">
          <button type="button" class="secondary" (click)="cancel.emit()">Cancelar</button>
          <button
            type="button"
            class="danger"
            (click)="remove.emit()"
            [disabled]="disabled || !gradeId"
          >
            Eliminar
          </button>
        </div>
      </form>

      <footer>
        <small>Historial de edición</small>
        <p>Modificado por Prof. Soto · 12 May, 10:45 AM</p>
      </footer>
    </section>
  `,
  styles: [
    `
      .grade-form {
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

      .label {
        margin: 0;
        font-size: 0.68rem;
        color: #708097;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .meta {
        margin: 0;
        font-size: 0.88rem;
        font-weight: 600;
      }

      .chip {
        margin: 0;
        border-radius: 7px;
        padding: 0.4rem 0.5rem;
        background: #e7eefb;
        color: #435576;
        font-size: 0.8rem;
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

      textarea {
        width: 100%;
        border: 1px solid #cad4e6;
        border-radius: 7px;
        padding: 0.55rem 0.6rem;
        resize: vertical;
      }

      textarea:focus {
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
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.45rem;
      }

      .secondary,
      .danger {
        border: 1px solid #d4dceb;
        border-radius: 8px;
        background: #fff;
        color: #5d6e87;
        padding: 0.5rem;
      }

      .danger {
        color: #ad2b3a;
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

      footer {
        margin-top: 0.25rem;
        border-top: 1px solid #e6ecf5;
        padding-top: 0.5rem;
      }

      footer small {
        color: #67788e;
        font-size: 0.69rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      footer p {
        margin: 0.15rem 0 0;
        color: #76869b;
        font-size: 0.72rem;
      }
    `,
  ],
})
export class GradeFormComponent implements OnChanges {
  @Input() score: number | null = null;
  @Input() gradeId: string | null = null;
  @Input() studentName = '';
  @Input() evaluationName = '';
  @Input() disabled = false;
  @Input() requireEvaluationMetadata = false;

  @Output() save = new EventEmitter<GradeFormSubmitPayload>();
  @Output() cancel = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  readonly form;

  constructor(private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.nonNullable.group({
      score: [1, [Validators.required, Validators.min(1), Validators.max(7)]],
      evaluationName: [''],
      evaluationDescription: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['score']) {
      this.form.patchValue({ score: this.score ?? 1 }, { emitEvent: false });
      this.form.markAsPristine();
      this.form.markAsUntouched();
    }

    if (changes['evaluationName']) {
      this.form.patchValue(
        { evaluationName: this.evaluationName },
        { emitEvent: false },
      );
    }

    if (changes['requireEvaluationMetadata']) {
      if (this.requireEvaluationMetadata) {
        this.form.controls.evaluationName.setValidators([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(120),
        ]);
      } else {
        this.form.controls.evaluationName.clearValidators();
      }

      this.form.controls.evaluationName.updateValueAndValidity({
        emitEvent: false,
      });
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue();
    this.save.emit({
      score: raw.score,
      evaluationName: raw.evaluationName.trim(),
      evaluationDescription: raw.evaluationDescription.trim(),
    });
  }
}
