import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { TablerIconComponent } from '../../shared/icons/tabler-icon.component';
import { CurrentUserService } from '../services/current-user.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TablerIconComponent],
  template: `
    <div class="shell" [class.sidebar-open]="sidebarOpen">
      @if (sidebarOpen) {
        <div class="sidebar-backdrop" (click)="closeSidebar()"></div>
      }

      <aside class="sidebar" [class.open]="sidebarOpen">
        <button type="button" class="sidebar-close" (click)="closeSidebar()" aria-label="Cerrar menú">
          <span></span>
          <span></span>
        </button>

        <div class="brand">
          <h2>Taruca</h2>
          <p>Gestión Académica</p>
        </div>

        <nav class="menu" aria-label="Navegación principal">
          <a
            routerLink="/app/dashboard"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="closeSidebar()"
          >
            <i-tabler name="home" class="nav-icon"></i-tabler>
            <span>Inicio</span>
          </a>
          <a routerLink="/app/gradebook" routerLinkActive="active" (click)="closeSidebar()">
            <i-tabler name="book" class="nav-icon"></i-tabler>
            <span>Libro de Notas</span>
          </a>
          <a routerLink="/app/students" routerLinkActive="active" (click)="closeSidebar()">
            <i-tabler name="users" class="nav-icon"></i-tabler>
            <span>Alumnos</span>
          </a>
          @if (canManageTeachers) {
            <a routerLink="/app/teachers" routerLinkActive="active" (click)="closeSidebar()">
              <i-tabler name="user" class="nav-icon"></i-tabler>
              <span>Profesores</span>
            </a>
          }
          <a routerLink="/app/data" routerLinkActive="active" (click)="closeSidebar()">
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

          <button type="button" class="logout" (click)="logout()">
            <i-tabler name="logout" class="logout-icon"></i-tabler>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main class="content">
        <div class="mobile-bar">
          <button type="button" class="hamburger" (click)="toggleSidebar()" [attr.aria-label]="sidebarOpen ? 'Cerrar menú' : 'Abrir menú'">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <strong class="mobile-brand">Taruca</strong>
        </div>
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
        top: 0;
        left: 0;
        bottom: 0;
        width: 280px;
        background: var(--taruca-sidebar);
        color: #e8efff;
        display: grid;
        grid-template-rows: auto auto 1fr;
        gap: 1.5rem;
        padding: 1rem;
        box-shadow: 2px 0 12px rgba(12, 23, 46, 0.24);
        z-index: 40;
      }

      .sidebar-close {
        display: none;
      }

      .sidebar-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(13, 23, 40, 0.45);
        z-index: 35;
        animation: fadeIn 180ms ease-out both;
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
        transition: background-color 150ms ease;
      }

      .logout:hover {
        background: #e03344;
      }

      .logout-icon {
        width: 15px;
        height: 15px;
        flex-shrink: 0;
      }

      .content {
        margin-left: 280px;
        min-height: 100dvh;
        position: relative;
      }

      .mobile-bar {
        display: none;
      }

      @media (max-width: 960px) {
        .sidebar {
          transform: translateX(-100%);
          transition: transform 280ms cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        .sidebar.open {
          transform: translateX(0);
        }

        .content {
          margin-left: 0;
          padding-top: 52px;
        }

        .mobile-bar {
          display: flex;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 52px;
          z-index: 30;
          background: var(--taruca-sidebar);
          align-items: center;
          gap: 0.8rem;
          padding: 0 1rem;
          box-shadow: 0 1px 8px rgba(12, 23, 46, 0.26);
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          border: 0;
          background: rgba(255, 255, 255, 0.08);
          padding: 8px;
          cursor: pointer;
          border-radius: 8px;
          width: 38px;
          height: 38px;
          transition: background-color 150ms ease;
        }

        .hamburger:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        .hamburger span {
          display: block;
          width: 20px;
          height: 2px;
          background: #c7d5eb;
          border-radius: 2px;
          transition: transform 240ms ease, opacity 180ms ease;
          transform-origin: center;
        }

        .sidebar-open .hamburger {
          background: rgba(255, 255, 255, 0.14);
        }

        .sidebar-open .hamburger span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        .sidebar-open .hamburger span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        .sidebar-open .hamburger span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        .mobile-brand {
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .sidebar-close {
          display: grid;
          place-items: center;
          position: absolute;
          top: 0.55rem;
          right: 0.55rem;
          width: 34px;
          height: 34px;
          border: 0;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 150ms ease;
        }

        .sidebar-close:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        .sidebar-close span {
          grid-area: 1 / 1;
          display: block;
          width: 16px;
          height: 2px;
          background: #c7d5eb;
          border-radius: 2px;
          transition: background-color 150ms ease;
        }

        .sidebar-close span:nth-child(1) {
          transform: rotate(45deg);
        }

        .sidebar-close span:nth-child(2) {
          transform: rotate(-45deg);
        }

        .sidebar-close:hover span {
          background: #fff;
        }
      }
    `,
  ],
})
export class AppShellComponent implements OnDestroy {
  sidebarOpen = false;
  private readonly routerSub: Subscription;

  constructor(
    private readonly currentUserService: CurrentUserService,
    private readonly router: Router,
  ) {
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.sidebarOpen = false;
      });
  }

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

  get canManageTeachers(): boolean {
    return this.currentUserService.canManageTeachers();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  logout(): void {
    this.sidebarOpen = false;
    this.currentUserService.clearAuthToken();
    void this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
  }
}
