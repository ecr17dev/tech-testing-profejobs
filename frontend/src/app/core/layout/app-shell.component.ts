import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TablerIconComponent } from '../../shared/icons/tabler-icon.component';
import { CurrentUserService } from '../services/current-user.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TablerIconComponent],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <h2>Taruca</h2>
          <p>Gestión Académica</p>
        </div>

        <nav class="menu" aria-label="Navegación principal">
          <a
            routerLink="/app/dashboard"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <i-tabler name="home" class="nav-icon"></i-tabler>
            <span>Inicio</span>
          </a>
          <a routerLink="/app/gradebook" routerLinkActive="active">
            <i-tabler name="book" class="nav-icon"></i-tabler>
            <span>Libro de Notas</span>
          </a>
          <a routerLink="/app/students" routerLinkActive="active">
            <i-tabler name="users" class="nav-icon"></i-tabler>
            <span>Alumnos</span>
          </a>
          <a routerLink="/app/data" routerLinkActive="active">
            <i-tabler name="chart-bar" class="nav-icon"></i-tabler>
            <span>Datos Académicos</span>
          </a>
        </nav>

        <div class="footer-zone">
          @if (profileLabel) {
            <section class="profile">
              <span class="avatar">{{ profileInitials }}</span>
              <div>
                <strong>{{ profileLabel }}</strong>
                <small>{{ profileRole }}</small>
              </div>
            </section>
          }

          <a class="aux-link" href="#" (click)="$event.preventDefault()">
            <i-tabler name="settings" class="aux-icon"></i-tabler>
            Configuración
          </a>
          <a class="aux-link" href="#" (click)="$event.preventDefault()">
            <i-tabler name="bell" class="aux-icon"></i-tabler>
            Soporte
          </a>

          <button type="button" class="logout" (click)="logout()">
            <i-tabler name="logout" class="logout-icon"></i-tabler>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100dvh;
        background: var(--taruca-bg);
      }

      .shell {
        min-height: 100dvh;
      }

      .sidebar {
        position: fixed;
        inset: 0 auto 0 0;
        width: 280px;
        background: var(--taruca-sidebar);
        color: #e8efff;
        display: grid;
        grid-template-rows: auto auto 1fr;
        gap: 1.5rem;
        padding: 1rem;
        box-shadow: 2px 0 12px rgba(12, 23, 46, 0.24);
      }

      .brand h2 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 700;
      }

      .brand p {
        margin: 0.15rem 0 0;
        color: var(--taruca-sidebar-soft);
        font-size: 0.75rem;
        letter-spacing: 0.04em;
      }

      .menu {
        display: grid;
        gap: 0.45rem;
        align-content: start;
      }

      .menu a {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        text-decoration: none;
        color: #c7d5eb;
        border-radius: 8px;
        padding: 0.65rem 0.75rem;
        font-size: 0.82rem;
        transition: background-color 180ms ease;
      }

      .menu a:hover {
        background: #2b4566;
      }

      .menu a.active {
        background: #2a69e6;
        color: #fff;
      }

      .nav-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      .footer-zone {
        display: grid;
        gap: 0.55rem;
        align-content: end;
      }

      .profile {
        display: grid;
        grid-template-columns: 2rem 1fr;
        gap: 0.5rem;
        align-items: center;
        border: 1px solid #355072;
        border-radius: 10px;
        padding: 0.65rem;
        background: #263c59;
      }

      .avatar {
        width: 2rem;
        height: 2rem;
        border-radius: 999px;
        display: grid;
        place-items: center;
        font-weight: 700;
        font-size: 0.75rem;
        color: #173158;
        background: #c7dcfb;
      }

      .profile strong {
        display: block;
        font-size: 0.75rem;
        color: #fff;
      }

      .profile small {
        color: #9eb4d4;
        font-size: 0.7rem;
      }

      .aux-link {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        text-decoration: none;
        color: #a8bedb;
        font-size: 0.75rem;
        border-radius: 8px;
        padding: 0.5rem 0.6rem;
      }

      .aux-link:hover {
        background: #2b4566;
      }

      .aux-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      .logout {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        border: 1px solid #c84c5a;
        background: #cf2737;
        color: #fff;
        border-radius: 8px;
        padding: 0.45rem 0.7rem;
        font-size: 0.72rem;
        font-weight: 600;
        cursor: pointer;
      }

      .logout-icon {
        width: 15px;
        height: 15px;
        flex-shrink: 0;
      }

      .content {
        margin-left: 280px;
        min-height: 100dvh;
      }

      @media (max-width: 960px) {
        .sidebar {
          position: static;
          width: 100%;
          grid-template-rows: auto;
          box-shadow: none;
        }

        .footer-zone {
          align-content: start;
        }

        .content {
          margin-left: 0;
        }
      }
    `,
  ],
})
export class AppShellComponent {
  constructor(
    private readonly currentUserService: CurrentUserService,
    private readonly router: Router,
  ) {}

  get profileLabel(): string {
    return this.currentUserService.getCurrentProfile()?.label ?? '';
  }

  get profileRole(): string {
    return this.currentUserService.getCurrentProfile()?.role ?? '';
  }

  get profileInitials(): string {
    const words = this.profileLabel.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      return '--';
    }

    const initials = words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? '');
    return initials.join('');
  }

  logout(): void {
    this.currentUserService.clearAuthToken();
    void this.router.navigate(['/login']);
  }
}
