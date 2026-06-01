import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { TablerIconComponent } from '../../../shared/icons/tabler-icon.component';
import { GradebookApiService } from '../../gradebook/services/gradebook-api.service';
import { AcademicPeriod, SubjectSummary } from '../../gradebook/models/gradebook.models';
import { getHttpErrorMessage } from '../../../core/utils/http-error-message.util';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [TablerIconComponent],
  template: `
    <section class="dashboard">
      <header class="hero">
        <div>
          <h1>Dashboard Académico</h1>
          <p>Resumen general de su desempeño institucional y estado de períodos.</p>
        </div>
      </header>

      @if (error) {
        <p class="alert">{{ error }}</p>
      }

      @if (loading) {
        <p class="state">Cargando indicadores...</p>
      } @else {
        <section class="kpis">
          <article class="kpi-card">
            <span>ASIGNATURAS VISIBLES</span>
            <strong>{{ subjectsCount }}</strong>
            <small><i-tabler name="trending-up" class="kpi-icon"></i-tabler> Actualizado hoy</small>
          </article>

          <article class="kpi-card">
            <span>PERÍODOS ACADÉMICOS</span>
            <strong>{{ periodsCount }}</strong>
            <small><i-tabler name="calendar" class="kpi-icon"></i-tabler> Ciclo 2026</small>
          </article>

          <article class="kpi-card">
            <span>PERÍODOS ABIERTOS</span>
            <strong>{{ openPeriodsCount }}</strong>
            <small [class.warn]="openPeriodsCount === 0">
              {{ openPeriodsCount > 0 ? 'Operativos' : 'Sin períodos abiertos' }}
            </small>
          </article>
        </section>

        <section class="grid-zone">
          <article class="panel load">
            <header>
              <h2>Carga Académica Actual</h2>
              <a href="#" (click)="$event.preventDefault()">Ver todo</a>
            </header>

            @if (subjects.length === 0) {
              <p class="state empty-list">No hay asignaturas visibles para este perfil.</p>
            } @else {
              <ul>
                @for (subject of subjects; track subject.id) {
                  <li>
                    <strong>{{ subject.name }} · {{ subject.course.name }}</strong>
                    <span>
                      {{
                        subject.academicPeriod.isOpen
                          ? 'Período abierto'
                          : 'Período cerrado'
                      }}
                    </span>
                  </li>
                }
              </ul>
            }
          </article>

          <article class="panel notifications">
            <h2>Notificaciones</h2>
            <ul>
              <li><i-tabler name="pin" class="notif-icon"></i-tabler> Cierre de período inminente (5 días)</li>
              <li><i-tabler name="bell" class="notif-icon"></i-tabler> Nueva justificación registrada</li>
              <li><i-tabler name="check" class="notif-icon"></i-tabler> Se validaron 3 evaluaciones</li>
            </ul>
          </article>

          <article class="panel average">
            <h2>Promedio General</h2>
            <strong>{{ overallAverage }}</strong>

            <div class="meter">
              <span>Asistencia Media</span>
              <div><i [style.width.%]="attendanceValue || 0"></i></div>
              <small>{{ attendanceValue > 0 ? attendanceValue + '%' : '—' }}</small>
            </div>

            <div class="meter">
              <span>Entrega a tiempo</span>
              <div><i [style.width.%]="onTimeValue || 0"></i></div>
              <small>{{ onTimeValue > 0 ? onTimeValue + '%' : '—' }}</small>
            </div>
          </article>
        </section>
      }
    </section>
  `,
  styles: [
    `
      .dashboard {
        min-height: 100dvh;
        background: var(--taruca-bg);
      }

      .hero {
        background: linear-gradient(90deg, #1f4ca4 0%, #2961c7 100%);
        color: #fff;
        padding: 1.2rem 1.5rem;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.8rem;
      }

      h1 {
        margin: 0;
        font-size: clamp(1.3rem, 2.8vw, 1.75rem);
      }

      .hero p {
        margin: 0.2rem 0 0;
        font-size: 0.86rem;
        color: #dbe8ff;
      }

      .kpi-icon {
        width: 13px;
        height: 13px;
        vertical-align: -2px;
        margin-right: 2px;
      }

      .notif-icon {
        width: 15px;
        height: 15px;
        vertical-align: -3px;
        margin-right: 4px;
      }

      .kpis {
        padding: 0.9rem 1rem;
        display: grid;
        gap: 0.8rem;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }

      .kpi-card {
        background: var(--taruca-surface);
        border: 1px solid var(--taruca-border);
        border-radius: 10px;
        padding: 0.85rem;
        box-shadow: var(--taruca-shadow-sm);
      }

      .kpi-card span {
        display: block;
        font-size: 0.67rem;
        color: #6a778b;
        letter-spacing: 0.08em;
      }

      .kpi-card strong {
        display: block;
        margin-top: 0.35rem;
        font-size: 1.9rem;
      }

      .kpi-card small {
        color: #5e6f86;
        font-size: 0.72rem;
      }

      .kpi-card small.warn {
        color: #b42318;
      }

      .grid-zone {
        padding: 0 1rem 1rem;
        display: grid;
        gap: 0.85rem;
        grid-template-columns: 2fr 1fr;
      }

      .panel {
        background: var(--taruca-surface);
        border: 1px solid var(--taruca-border);
        border-radius: 10px;
        box-shadow: var(--taruca-shadow-sm);
        padding: 0.95rem;
      }

      .panel h2 {
        margin: 0;
        font-size: 0.98rem;
      }

      .load header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.6rem;
      }

      .load a {
        text-decoration: none;
        color: #3e62b6;
        font-size: 0.78rem;
      }

      .load ul,
      .notifications ul {
        margin: 0.8rem 0 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 0.55rem;
      }

      .load li,
      .notifications li {
        border: 1px solid #e4eaf4;
        border-radius: 8px;
        padding: 0.55rem 0.6rem;
        display: grid;
      }

      .load li span,
      .notifications li {
        color: #617287;
        font-size: 0.76rem;
      }

      .average strong {
        display: block;
        margin-top: 0.45rem;
        font-size: 2rem;
      }

      .meter {
        margin-top: 0.55rem;
      }

      .meter span,
      .meter small {
        color: #586981;
        font-size: 0.74rem;
      }

      .meter div {
        margin-top: 0.22rem;
        height: 6px;
        border-radius: 999px;
        background: #e3eaf7;
      }

      .meter i {
        display: block;
        height: 100%;
        border-radius: 999px;
        background: #1d5edd;
      }

      .state,
      .alert {
        margin: 0.9rem 1rem;
        padding: 0.75rem;
        border-radius: 10px;
      }

      .panel .state {
        margin: 0.8rem 0 0;
      }

      .state {
        background: #eef2f7;
      }

      .alert {
        background: #fff1ee;
        color: #a72315;
        border: 1px solid #f1c4bc;
      }

      @media (max-width: 768px) {
        .grid-zone {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 576px) {
        .hero {
          padding: 0.9rem 1rem;
          flex-direction: column;
          align-items: stretch;
        }

        .kpis {
          padding: 0.6rem 0.65rem;
          gap: 0.55rem;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }

        .kpi-card {
          padding: 0.7rem;
        }

        .kpi-card strong {
          font-size: 1.5rem;
        }

        .grid-zone {
          padding: 0 0.65rem 0.8rem;
          gap: 0.6rem;
        }

        .panel {
          padding: 0.75rem;
        }
      }
    `,
  ],
})
export class DashboardPageComponent implements OnInit {
  loading = false;
  loadingSubjects = false;
  loadingPeriods = false;
  error: string | null = null;
  errorSubjects: string | null = null;
  errorPeriods: string | null = null;
  subjects: SubjectSummary[] = [];
  subjectsCount = 0;
  periodsCount = 0;
  openPeriodsCount = 0;

  constructor(private readonly api: GradebookApiService) {}

  /**
   * overallAverage requiere endpoint GET /api/dashboard/overall-average
   * que compute promedio ponderado de todos los estudiantes del perfil.
   * Placeholder: retorna '-' hasta que endpoint exista.
   */
  get overallAverage(): string {
    // TODO: reemplazar por llamada a GET /api/dashboard/overall-average
    return this.subjectsCount > 0 ? '—' : '0.0';
  }

  /**
   * attendanceValue requiere endpoint GET /api/dashboard/attendance.
   * Placeholder: retorna null (muestra '--' en UI).
   */
  get attendanceValue(): number {
    // TODO: reemplazar por llamada a GET /api/dashboard/attendance
    return 0;
  }

  /**
   * onTimeValue requiere endpoint GET /api/dashboard/on-time-rate.
   * Placeholder: retorna null (muestra '--' en UI).
   */
  get onTimeValue(): number {
    // TODO: reemplazar por llamada a GET /api/dashboard/on-time-rate
    return 0;
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading = true;
    this.error = null;
    this.errorSubjects = null;
    this.errorPeriods = null;

    this.loadingSubjects = true;
    this.loadingPeriods = true;

    this.api
      .getSubjects()
      .pipe(
        finalize(() => {
          this.loadingSubjects = false;
          this.loading = this.loadingSubjects || this.loadingPeriods;
        }),
      )
      .subscribe({
        next: (subjects) => {
          const normalized = this.toArray<SubjectSummary>(subjects);
          this.subjects = normalized;
          this.subjectsCount = normalized.length;
        },
        error: (err: HttpErrorResponse) => {
          this.subjects = [];
          this.subjectsCount = 0;
          this.errorSubjects = getHttpErrorMessage(
            err,
            'No fue posible cargar las asignaturas del dashboard.',
          );
          this.error = this.errorSubjects;
        },
      });

    this.api
      .getAcademicPeriods()
      .pipe(
        finalize(() => {
          this.loadingPeriods = false;
          this.loading = this.loadingSubjects || this.loadingPeriods;
        }),
      )
      .subscribe({
        next: (periods) => {
          const normalized = this.toArray<AcademicPeriod>(periods);
          this.periodsCount = normalized.length;
          this.openPeriodsCount = normalized.filter((period) => period.isOpen).length;
        },
        error: (err: HttpErrorResponse) => {
          this.errorPeriods = getHttpErrorMessage(
            err,
            'No fue posible cargar los períodos académicos del dashboard.',
          );
          this.error = this.error ?? this.errorPeriods;
        },
      });
  }

  private toArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
  }
}
