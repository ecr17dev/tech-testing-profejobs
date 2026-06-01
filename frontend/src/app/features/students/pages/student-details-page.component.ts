import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { TablerIconComponent } from '../../../shared/icons/tabler-icon.component';
import { GradebookApiService } from '../../gradebook/services/gradebook-api.service';
import { StudentGradesResponse } from '../../gradebook/models/gradebook.models';
import { getHttpErrorMessage } from '../../../core/utils/http-error-message.util';

@Component({
  selector: 'app-student-details-page',
  standalone: true,
  imports: [RouterLink, TablerIconComponent],
  template: `
    <main class="page">
      <header class="hero">
        <a routerLink="/app/gradebook" class="back"><i-tabler name="arrow-left" class="back-icon"></i-tabler> Volver al libro</a>
        <div>
          <h1>{{ studentName }}</h1>
          <p>{{ courseName }} · {{ subjectName }}</p>
        </div>
      </header>

      @if (error) {
        <p class="alert">{{ error }}</p>
      }

      @if (loading) {
        <p class="state">Cargando detalle del alumno...</p>
      } @else {
        <section class="kpis">
          <article>
            <span>PROMEDIO GENERAL</span>
            <strong>{{ computedAverageLabel }}</strong>
            <small>+0.12 este período</small>
          </article>
          <article>
            <span>ASISTENCIA</span>
            <strong>98.4%</strong>
            <small>Indicador institucional</small>
          </article>
          <article>
            <span>ENTREGAS</span>
            <strong>{{ submittedCount }}/{{ totalCount }}</strong>
            <small>Tareas evaluadas</small>
          </article>
          <article>
            <span>RANKING</span>
            <strong>#4</strong>
            <small>Top 5% del curso</small>
          </article>
        </section>

        <section class="workspace">
          <article class="panel">
            <h2>Rendimiento por Evaluación</h2>
            @if (!hasSubjectContext) {
              <p class="info">Abre la ficha desde el <a routerLink="/app/gradebook">libro de calificaciones</a> seleccionando una asignatura para ver el detalle de notas.</p>
            } @else if (!studentGrades || studentGrades.grades.length === 0) {
              <p class="state">No hay calificaciones para mostrar.</p>
            } @else {
              <div class="responsive-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Evaluación</th>
                    <th>Nota</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (grade of studentGrades.grades; track grade.gradeId) {
                    <tr>
                      <td>{{ grade.evaluationName }}</td>
                      <td>{{ grade.score }}</td>
                      <td [class.risk]="grade.score < 4">
                        {{ grade.score < 4 ? 'Bajo' : 'Sólido' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
              </div>
            }
          </article>

          <article class="panel side">
            <h2>Historial reciente</h2>
            <ul>
              <li><i-tabler name="circle-check-filled" class="hist-icon green"></i-tabler> Actualización de notas en la última semana</li>
              <li><i-tabler name="pin" class="hist-icon"></i-tabler> Asistencia sostenida sobre 95%</li>
              <li><i-tabler name="check" class="hist-icon green"></i-tabler> Entregas al día en el período actual</li>
            </ul>
          </article>
        </section>
      }
    </main>
  `,
  styles: [
    `
      .page {
        min-height: 100dvh;
        background: var(--taruca-bg);
        padding: 0.9rem 1rem 1rem;
        display: grid;
        gap: 0.8rem;
      }

      .hero {
        background: linear-gradient(90deg, #1f4ca4 0%, #2961c7 100%);
        border-radius: 12px;
        color: #fff;
        padding: 1rem;
      }

      .back {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        text-decoration: none;
        color: #d9e7ff;
        font-size: 0.8rem;
      }

      .back-icon {
        width: 15px;
        height: 15px;
      }

      h1 {
        margin: 0.45rem 0 0;
        font-size: clamp(1.2rem, 2.4vw, 1.55rem);
      }

      .hero p {
        margin: 0.15rem 0 0;
        color: #dbe8ff;
        font-size: 0.82rem;
      }

      .kpis {
        display: grid;
        gap: 0.7rem;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      }

      .kpis article {
        background: #fff;
        border: 1px solid var(--taruca-border);
        border-radius: 10px;
        padding: 0.7rem;
        box-shadow: var(--taruca-shadow-sm);
      }

      .kpis span {
        display: block;
        color: #6a778b;
        font-size: 0.66rem;
        letter-spacing: 0.08em;
      }

      .kpis strong {
        display: block;
        margin-top: 0.32rem;
        font-size: 1.65rem;
      }

      .kpis small {
        color: #5e6f86;
        font-size: 0.72rem;
      }

      .workspace {
        display: grid;
        gap: 0.75rem;
        grid-template-columns: minmax(0, 1fr);
      }

      .panel {
        background: #fff;
        border: 1px solid var(--taruca-border);
        border-radius: 10px;
        padding: 0.85rem;
        box-shadow: var(--taruca-shadow-sm);
      }

      h2 {
        margin: 0;
        font-size: 1rem;
      }

      table {
        margin-top: 0.7rem;
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        text-align: left;
        padding: 0.5rem;
        border-bottom: 1px solid #e2e8f1;
        font-size: 0.8rem;
      }

      th {
        color: #54657f;
        font-weight: 600;
      }

      td.risk {
        color: #b42318;
        font-weight: 600;
      }

      .side ul {
        margin: 0.65rem 0 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 0.5rem;
      }

      .side li {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.79rem;
        color: #5d6d86;
        border: 1px solid #e4eaf4;
        border-radius: 8px;
        padding: 0.5rem;
      }

      .hist-icon {
        width: 15px;
        height: 15px;
        flex-shrink: 0;
        color: #6b7d95;
      }

      .hist-icon.green {
        color: #0a8b4a;
      }

      .state,
      .alert,
      .info {
        margin: 0;
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
        margin-top: 0.7rem;
      }

      .info a {
        color: #1d4ed8;
        font-weight: 600;
        text-decoration: underline;
      }

      @media (min-width: 768px) {
        .workspace {
          grid-template-columns: 2fr 1fr;
        }
      }

      @media (max-width: 576px) {
        .page {
          padding: 0.6rem 0.65rem 0.8rem;
        }

        .hero {
          padding: 0.75rem;
        }

        .kpis {
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.5rem;
        }

        .kpis article {
          padding: 0.6rem;
        }

        .kpis strong {
          font-size: 1.35rem;
        }

        th,
        td {
          padding: 0.4rem;
          font-size: 0.72rem;
        }
      }
    `,
  ],
})
export class StudentDetailsPageComponent implements OnInit {
  loading = false;
  error: string | null = null;

  studentId = '';
  subjectId = '';
  studentName = 'Alumno';
  subjectName = 'Asignatura';
  courseName = 'Curso';

  studentGrades: StudentGradesResponse | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: GradebookApiService,
  ) {}

  get totalCount(): number {
    return this.studentGrades?.grades.length ?? 0;
  }

  get submittedCount(): number {
    return this.studentGrades?.grades.filter((grade) => grade.score > 0).length ?? 0;
  }

  get computedAverageLabel(): string {
    const scores = this.studentGrades?.grades.map((grade) => grade.score) ?? [];
    if (scores.length === 0) {
      return 'N/A';
    }

    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return average.toFixed(1);
  }

  hasSubjectContext = false;

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id') ?? '';
    this.subjectId = this.route.snapshot.queryParamMap.get('subjectId') ?? '';
    this.studentName = this.route.snapshot.queryParamMap.get('name') ?? 'Alumno';
    this.subjectName = this.route.snapshot.queryParamMap.get('subjectName') ?? 'Asignatura';
    this.courseName = this.route.snapshot.queryParamMap.get('courseName') ?? 'Curso';

    if (!this.studentId) {
      this.error = 'No se pudo identificar al alumno.';
      return;
    }

    this.hasSubjectContext = Boolean(this.subjectId);

    if (this.hasSubjectContext) {
      this.loadStudentGrades();
    }
  }

  private loadStudentGrades(): void {
    this.loading = true;
    this.error = null;

    this.api
      .getStudentGrades(this.subjectId, this.studentId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          this.studentGrades = response;
        },
        error: (err: HttpErrorResponse) => {
          this.error = getHttpErrorMessage(
            err,
            'No fue posible cargar el detalle de calificaciones del alumno.',
          );
        },
      });
  }
}
