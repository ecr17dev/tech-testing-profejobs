import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { GradebookApiService } from '../../gradebook/services/gradebook-api.service';
import { SubjectSummary, AcademicPeriod } from '../../gradebook/models/gradebook.models';
import { getHttpErrorMessage } from '../../../core/utils/http-error-message.util';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-data-overview-page',
  standalone: true,
  template: `
    <section class="page">
      <header class="hero">
        <div>
          <h1>Datos Académicos</h1>
          <p>Vista rápida de asignaturas y períodos académicos para el ciclo lectivo actual.</p>
        </div>
      </header>

      @if (error) {
        <p class="alert">{{ error }}</p>
      }

      @if (periodActionMessage) {
        <p class="info">{{ periodActionMessage }}</p>
      }

      @if (loading) {
        <p class="state">Cargando datos...</p>
      } @else {
        <section class="block">
          <header>
            <h2>Asignaturas</h2>
            <a href="#" (click)="$event.preventDefault()">Ver todas</a>
          </header>

          @if (subjects.length === 0) {
            <p class="state">No hay asignaturas visibles para este perfil.</p>
          } @else {
            <div class="subject-grid">
              @for (subject of subjects; track subject.id) {
                <article>
                  <strong>{{ subject.name }}</strong>
                  <span>{{ subject.course.name }}</span>
                  <small>{{ subject.academicPeriod.name }}</small>
                  <em [class.open]="subject.academicPeriod.isOpen">
                    {{ subject.academicPeriod.isOpen ? 'Abierto' : 'Cerrado' }}
                  </em>
                </article>
              }
            </div>
          }
        </section>

        <section class="block">
          <header>
            <h2>Períodos Académicos</h2>
          </header>

          @if (periods.length === 0) {
            <p class="state">No hay períodos para mostrar.</p>
          } @else {
            <div class="period-grid">
              @for (period of periods; track period.id) {
                <article>
                  <strong>{{ period.name }} {{ period.year }}</strong>
                  <span>{{ period.isOpen ? 'En ejecución' : 'Planificado' }}</span>
                  <i [style.width.%]="period.isOpen ? 65 : 0"></i>
                  <small>{{ period.isOpen ? '65% completado' : '0% completado' }}</small>
                  @if (canManagePeriods) {
                    <button
                      type="button"
                      class="period-toggle"
                      [disabled]="updatingPeriodId === period.id"
                      (click)="togglePeriodStatus(period)"
                    >
                      {{
                        updatingPeriodId === period.id
                          ? 'Actualizando...'
                          : period.isOpen
                            ? 'Cerrar período'
                            : 'Abrir período'
                      }}
                    </button>
                  } @else {
                    <small class="period-readonly">
                      Solo Director(a) o UTP puede cambiar estado
                    </small>
                  }
                </article>
              }
            </div>
          }
        </section>

        <section class="summary-row">
          <article class="summary-card dark">
            <h3>Resumen de Rendimiento</h3>
            <p>
              El promedio institucional mejoró de forma sostenida durante este ciclo.
            </p>
            <div class="chart">
              <span style="height: 20%"></span>
              <span style="height: 33%"></span>
              <span style="height: 30%"></span>
              <span style="height: 48%"></span>
              <span style="height: 40%"></span>
              <span style="height: 61%"></span>
              <span style="height: 52%"></span>
            </div>
          </article>

          <article class="summary-card action">
            <h3>Tareas Pendientes</h3>
            <p>4 acciones de cierre requieren seguimiento.</p>
            <button type="button">Gestionar ahora</button>
          </article>
        </section>
      }
    </section>
  `,
  styles: [
    `
      .page {
        min-height: 100dvh;
        background: var(--taruca-bg);
      }

      .hero {
        background: linear-gradient(90deg, #1f4ca4 0%, #2961c7 100%);
        color: #fff;
        padding: 1.2rem 1.5rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
        align-items: center;
        justify-content: space-between;
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

      .block {
        margin: 0.9rem 1rem;
        background: #fff;
        border: 1px solid var(--taruca-border);
        border-radius: 10px;
        box-shadow: var(--taruca-shadow-sm);
        padding: 0.85rem;
      }

      .block > header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      h2 {
        margin: 0;
        font-size: 1rem;
      }

      .block a {
        text-decoration: none;
        color: #4064b8;
        font-size: 0.78rem;
      }

      .subject-grid,
      .period-grid {
        margin-top: 0.8rem;
        display: grid;
        gap: 0.65rem;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      .subject-grid article,
      .period-grid article {
        border: 1px solid #e4eaf4;
        border-radius: 10px;
        padding: 0.65rem;
        display: grid;
        gap: 0.15rem;
      }

      .subject-grid strong,
      .period-grid strong {
        font-size: 0.92rem;
      }

      .subject-grid span,
      .period-grid span,
      .period-grid small {
        font-size: 0.76rem;
        color: #5f6f86;
      }

      .period-toggle {
        border: 1px solid #d0d9ea;
        background: #fff;
        color: #335485;
        border-radius: 8px;
        padding: 0.38rem 0.58rem;
        font-size: 0.72rem;
        cursor: pointer;
        justify-self: start;
      }

      .period-toggle:hover {
        border-color: #1d5edd;
        color: #1d5edd;
      }

      .period-toggle:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .period-readonly {
        margin-top: 0.2rem;
      }

      .subject-grid em {
        justify-self: start;
        font-style: normal;
        border-radius: 999px;
        border: 1px solid #b7c3d8;
        color: #607189;
        font-size: 0.67rem;
        padding: 0.15rem 0.45rem;
      }

      .subject-grid em.open {
        border-color: #91d8b3;
        color: #0d6b3b;
        background: #ebf8f1;
      }

      .period-grid i {
        margin-top: 0.35rem;
        display: block;
        height: 6px;
        border-radius: 999px;
        background: #1f5fdc;
      }

      .summary-row {
        margin: 0.9rem 1rem 1rem;
        display: grid;
        gap: 0.65rem;
        grid-template-columns: 2fr 1fr;
      }

      .summary-card {
        border-radius: 10px;
        padding: 0.85rem;
        border: 1px solid var(--taruca-border);
      }

      .summary-card h3 {
        margin: 0;
        font-size: 0.97rem;
      }

      .summary-card p {
        margin: 0.35rem 0;
        font-size: 0.78rem;
      }

      .summary-card.dark {
        background: linear-gradient(145deg, #173f8e 0%, #1f55bc 100%);
        color: #f4f7ff;
      }

      .chart {
        height: 86px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(236, 243, 255, 0.22);
        display: flex;
        align-items: end;
        gap: 4px;
        padding: 0.45rem;
      }

      .chart span {
        flex: 1;
        border-radius: 4px 4px 0 0;
        background: #b8cbff;
      }

      .summary-card.action {
        background: #dfe9ff;
      }

      .summary-card.action button {
        border: 0;
        border-radius: 999px;
        background: #1b5dd8;
        color: #fff;
        padding: 0.45rem 0.8rem;
        font-weight: 600;
        cursor: pointer;
      }

      .state,
      .alert,
      .info {
        margin: 0.9rem 1rem;
        padding: 0.75rem;
        border-radius: 10px;
      }

      .state {
        background: #eef2f7;
      }

      .alert {
        background: #fff1ee;
        color: #a72315;
        border: 1px solid #f1c4bc;
      }

      .info {
        background: #edf5ff;
        color: #30568d;
        border: 1px solid #d3e4ff;
      }

      @media (max-width: 768px) {
        .summary-row {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 576px) {
        .hero {
          padding: 0.9rem 1rem;
          flex-direction: column;
          align-items: stretch;
        }

        .block {
          margin: 0.6rem 0.65rem;
          padding: 0.7rem;
        }

        .summary-row {
          margin: 0.6rem 0.65rem 0.8rem;
        }

        .subject-grid,
        .period-grid {
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.5rem;
        }
      }
    `,
  ],
})
export class DataOverviewPageComponent implements OnInit {
  subjects: SubjectSummary[] = [];
  periods: AcademicPeriod[] = [];
  canManagePeriods = false;
  updatingPeriodId: string | null = null;
  loading = false;
  loadingSubjects = false;
  loadingPeriods = false;
  error: string | null = null;
  errorSubjects: string | null = null;
  errorPeriods: string | null = null;
  periodActionMessage: string | null = null;

  constructor(
    private readonly api: GradebookApiService,
    private readonly currentUserService: CurrentUserService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.canManagePeriods = this.currentUserService.canManageAcademicPeriods();
    this.loadData();
  }

  togglePeriodStatus(period: AcademicPeriod): void {
    if (!this.canManagePeriods || this.updatingPeriodId) {
      return;
    }

    const nextStatus = !period.isOpen;
    const actionLabel = nextStatus ? 'abrir' : 'cerrar';

    this.toast
      .confirm({
        title: `${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)} período`,
        text: `¿Deseas ${actionLabel} el período "${period.name} ${period.year}"?`,
        confirmText: 'Sí, continuar',
        cancelText: 'Cancelar',
        icon: 'warning',
        dangerMode: nextStatus === false,
      })
      .then((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.updatingPeriodId = period.id;
        this.periodActionMessage = null;
        this.error = null;

        this.api
          .updateAcademicPeriodStatus(period.id, nextStatus)
          .pipe(finalize(() => (this.updatingPeriodId = null)))
          .subscribe({
            next: (updatedPeriod) => {
              this.periods = this.periods.map((item) =>
                item.id === updatedPeriod.id ? updatedPeriod : item,
              );

              this.subjects = this.subjects.map((subject) =>
                subject.academicPeriod.id === updatedPeriod.id
                  ? {
                      ...subject,
                      academicPeriod: {
                        ...subject.academicPeriod,
                        isOpen: updatedPeriod.isOpen,
                      },
                    }
                  : subject,
              );

              const msg = updatedPeriod.isOpen
                ? `Período "${updatedPeriod.name} ${updatedPeriod.year}" abierto correctamente.`
                : `Período "${updatedPeriod.name} ${updatedPeriod.year}" cerrado correctamente.`;
              this.toast.success(msg);
            },
            error: (err: HttpErrorResponse) => {
              this.toast.error(
                getHttpErrorMessage(
                  err,
                  'No fue posible actualizar el estado del período.',
                ),
              );
            },
          });
      });
  }

  private loadData(): void {
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
          this.subjects = this.toArray<SubjectSummary>(subjects);
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error(
            getHttpErrorMessage(err, 'No fue posible cargar asignaturas.'),
          );
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
          this.periods = this.toArray<AcademicPeriod>(periods);
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error(
            getHttpErrorMessage(
              err,
              'No fue posible cargar períodos académicos.',
            ),
          );
        },
      });
  }

  private toArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
  }
}
