import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TablerIconComponent } from '../../../shared/icons/tabler-icon.component';
import { AuthApiService } from '../services/auth-api.service';
import { getHttpErrorMessage } from '../../../core/utils/http-error-message.util';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TablerIconComponent],
  template: `
    <main class="forgot-page">
      <div class="brand">Taruca</div>

      <section class="card">
        @if (!submitted) {
          <div class="state-wrapper">
            <div class="icon-wrap"><i-tabler name="key"></i-tabler></div>
            <h1>¿Olvidaste tu contraseña?</h1>
            <p>Ingresa tu email para recibir instrucciones de recuperación.</p>

            @if (error) {
              <p class="error-banner">{{ error }}</p>
            }

            <form [formGroup]="form" (ngSubmit)="submit()">
              <label for="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="ejemplo@escuela.com"
              />

              @if (form.controls.email.touched && form.controls.email.invalid) {
                <p class="error">Ingresa un correo válido.</p>
              }

              <button type="submit" [disabled]="form.invalid || loading">
                {{ loading ? 'Enviando...' : 'Enviar instrucciones' }}
              </button>
            </form>
          </div>
        } @else {
          <div class="state-wrapper">
            <div class="icon-wrap success"><i-tabler name="circle-check-filled"></i-tabler></div>
            <h1>Revisa tu correo</h1>
            <p>
              Si el email existe en Taruca, enviamos instrucciones de recuperación.
            </p>
          </div>
        }

        <a routerLink="/login" class="back">← Volver al login</a>
      </section>

      <small>¿Necesitas ayuda? Contacta a soporte</small>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100dvh;
      }

      .forgot-page {
        min-height: 100dvh;
        background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
        display: grid;
        place-items: center;
        gap: 1rem;
        padding: 1rem;
      }

      .brand {
        color: #fff;
        font-weight: 700;
        font-size: 1.8rem;
      }

      .card {
        width: min(440px, 100%);
        background: rgba(255, 255, 255, 0.96);
        border: 1px solid rgba(208, 221, 242, 0.9);
        border-radius: 12px;
        box-shadow: var(--taruca-shadow-md);
        padding: 1.4rem;
        text-align: center;
      }

      .state-wrapper {
        display: grid;
      }

      .icon-wrap {
        margin: 0 auto 0.65rem;
        width: 3rem;
        height: 3rem;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: #dde8ff;
        color: #2563eb;
      }

      .icon-wrap.success {
        background: #e6f7ee;
        color: #0a8b4a;
      }

      .icon-wrap i-tabler {
        width: 1.7rem;
        height: 1.7rem;
      }

      h1 {
        margin: 0;
        font-size: 1.25rem;
      }

      p {
        margin: 0.35rem 0 1rem;
        color: #566782;
        font-size: 0.88rem;
      }

      form {
        display: grid;
        gap: 0.45rem;
        text-align: left;
      }

      label {
        font-size: 0.75rem;
        color: #5b6c84;
      }

      input {
        border: 1px solid #cad4e6;
        border-radius: 7px;
        padding: 0.55rem 0.65rem;
      }

      input:focus {
        outline: 2px solid rgba(37, 99, 235, 0.22);
        border-color: #2563eb;
      }

      button {
        margin-top: 0.35rem;
        border: 0;
        border-radius: 8px;
        background: #1457d2;
        color: #fff;
        font-weight: 700;
        padding: 0.6rem 0.85rem;
        cursor: pointer;
      }

      button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .error {
        margin: 0;
        color: #b42318;
        font-size: 0.76rem;
      }

      .error-banner {
        margin: 0 0 0.75rem;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        padding: 0.55rem 0.65rem;
        color: #991b1b;
        font-size: 0.82rem;
        text-align: left;
      }

      .back {
        margin-top: 1rem;
        display: inline-block;
        font-size: 0.78rem;
        color: #355697;
        text-decoration: none;
      }

      .back:hover {
        text-decoration: underline;
      }

      small {
        color: #dce8ff;
        font-size: 0.72rem;
      }
    `,
  ],
})
export class ForgotPasswordPageComponent {
  readonly form;
  submitted = false;
  loading = false;
  error: string | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authApi: AuthApiService,
  ) {
    this.form = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const email = this.form.value.email ?? '';
    this.loading = true;
    this.error = null;

    this.authApi.forgotPassword(email).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = true;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = getHttpErrorMessage(
          err,
          'No pudimos procesar tu solicitud. Intenta nuevamente.',
        );
      },
    });
  }
}

