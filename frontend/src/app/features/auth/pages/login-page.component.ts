import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TablerIconComponent } from '../../../shared/icons/tabler-icon.component';
import {
  CurrentUserService,
  MockUserProfile,
} from '../../../core/services/current-user.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TablerIconComponent],
  template: `
    <main class="login-page">
      <section class="login-card">
        <header>
          <div class="icon-wrap"><i-tabler name="lock"></i-tabler></div>
          <h1>Ingreso Taruca</h1>
          <p>Ingresa con email y password.</p>
        </header>

        <div class="role-badge">
          Rol seleccionado: <strong>{{ selectedProfile?.role ?? 'N/A' }}</strong>
        </div>

        <form [formGroup]="form" (ngSubmit)="login()" class="form">
          <label for="email">Correo Electrónico</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            placeholder="ejemplo@taruca.cl"
          />

          <label for="password">Contraseña</label>
          <input
            id="password"
            type="password"
            formControlName="password"
            placeholder="••••••••"
          />

          <a class="forgot" routerLink="/forgot-password">¿Olvidaste tu contraseña?</a>

          @if (
            (form.controls.email.touched && form.controls.email.invalid) ||
            (form.controls.password.touched && form.controls.password.invalid)
          ) {
            <p class="error">Debes ingresar un email válido y una contraseña.</p>
          }

          @if (error) {
            <p class="error">{{ error }}</p>
          }

          <button type="submit" class="submit" [disabled]="form.invalid">
            Ingresar al dashboard
          </button>
        </form>

        <details class="credentials">
          <summary>Ver credenciales mock</summary>
          <ul>
            @for (profile of profiles; track profile.token) {
              <li>
                <strong>{{ profile.role }}:</strong>
                {{ profile.email }} / {{ profile.password }}
              </li>
            }
          </ul>
        </details>
      </section>

      <section class="roles">
        <h2>Perfiles de Prueba</h2>
        <div class="roles-grid">
          @for (profile of profiles; track profile.token) {
            <button
              type="button"
              class="role-card"
              [class.selected]="selectedProfile?.token === profile.token"
              (click)="fillWithProfile(profile)"
            >
              <strong>{{ profile.label }}</strong>
              <span>{{ profile.email }}</span>
            </button>
          }
        </div>
      </section>

      <footer>
        <strong>Taruca</strong>

      </footer>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100dvh;
      }

      .login-page {
        min-height: 100dvh;
        background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
        display: grid;
        place-items: center;
        gap: 1.25rem;
        padding: 1.5rem 1rem;
      }

      .login-card {
        width: min(440px, 100%);
        background: rgba(255, 255, 255, 0.96);
        border: 1px solid rgba(208, 221, 242, 0.9);
        border-radius: var(--taruca-radius);
        box-shadow: var(--taruca-shadow-md);
        padding: 1.5rem;
      }

      header {
        text-align: center;
        margin-bottom: 0.75rem;
      }

      .icon-wrap {
        width: 3rem;
        height: 3rem;
        margin: 0 auto 0.55rem;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: #dde8ff;
        color: #2563eb;
      }

      .icon-wrap i-tabler {
        width: 1.7rem;
        height: 1.7rem;
      }

      h1 {
        margin: 0;
        font-size: 1.35rem;
      }

      header p {
        margin: 0.15rem 0 0;
        color: var(--taruca-text-soft);
        font-size: 0.9rem;
      }

      .role-badge {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.35rem;
        margin: 0.8rem 0 1rem;
        border-radius: 999px;
        background: #2a69e6;
        color: #fff;
        padding: 0.35rem 0.7rem;
        font-size: 0.72rem;
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }

      .form {
        display: grid;
        gap: 0.45rem;
      }

      label {
        font-size: 0.76rem;
        color: #52627b;
      }

      input {
        border: 1px solid #cad4e6;
        border-radius: 7px;
        padding: 0.55rem 0.65rem;
        background: #fff;
      }

      input:focus {
        outline: 2px solid rgba(37, 99, 235, 0.22);
        border-color: #2563eb;
      }

      .forgot {
        text-align: right;
        text-decoration: none;
        font-size: 0.73rem;
        color: #3f64b9;
      }

      .forgot:hover {
        text-decoration: underline;
      }

      .submit {
        margin-top: 0.35rem;
        border: 0;
        border-radius: 8px;
        background: #1457d2;
        color: #fff;
        font-weight: 700;
        padding: 0.6rem 0.85rem;
        cursor: pointer;
      }

      .submit:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .error {
        margin: 0.1rem 0;
        font-size: 0.78rem;
        color: #b42318;
      }

      .credentials {
        margin-top: 0.9rem;
        border-top: 1px solid #dde4f2;
        padding-top: 0.65rem;
      }

      .credentials summary {
        cursor: pointer;
        font-size: 0.78rem;
        color: #51637d;
      }

      .credentials ul {
        margin: 0.5rem 0 0;
        padding-left: 1rem;
        font-size: 0.78rem;
        color: #536684;
      }

      .roles {
        width: min(860px, 100%);
      }

      .roles h2 {
        margin: 0 0 0.65rem;
        color: #fff;
        font-size: 1.08rem;
        text-align: center;
      }

      .roles-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(165px, 1fr));
        gap: 0.65rem;
      }

      .role-card {
        text-align: left;
        border: 1px solid rgba(201, 217, 245, 0.72);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.95);
        padding: 0.65rem;
        cursor: pointer;
        box-shadow: var(--taruca-shadow-sm);
      }

      .role-card strong {
        display: block;
        font-size: 0.83rem;
      }

      .role-card span {
        color: #5b6d85;
        font-size: 0.72rem;
      }

      .role-card.selected {
        border-color: #2a69e6;
        background: #edf3ff;
      }

      footer {
        text-align: center;
        color: #eaf0ff;
      }

      footer strong {
        display: block;
        font-size: 1.05rem;
      }

      footer small {
        font-size: 0.68rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
      }
    `,
  ],
})
export class LoginPageComponent {
  readonly profiles: MockUserProfile[];
  readonly form;
  selectedProfile: MockUserProfile | null = null;
  error: string | null = null;

  constructor(
    private readonly currentUserService: CurrentUserService,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
  ) {
    this.profiles = this.currentUserService.getAvailableProfiles();
    this.form = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    if (this.profiles.length > 0) {
      this.fillWithProfile(this.profiles[0]);
    }
  }

  fillWithProfile(profile: MockUserProfile): void {
    this.selectedProfile = profile;
    this.error = null;
    this.form.setValue(
      { email: profile.email, password: profile.password },
      { emitEvent: false },
    );
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  login(): void {
    this.error = null;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const values = this.form.getRawValue();
    const success = this.currentUserService.loginWithCredentials(
      values.email,
      values.password,
    );

    if (!success) {
      this.error =
        'Credenciales inválidas. Usa los perfiles de prueba o revisa email y password.';
      return;
    }

    void this.router.navigate(['/app/dashboard']);
  }
}
