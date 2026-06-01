import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TablerIconComponent } from '../../../shared/icons/tabler-icon.component';
import { catchError, finalize, forkJoin, of, switchMap } from 'rxjs';
import { GradebookApiService } from '../services/gradebook-api.service';
import {
  EvaluationSummary,
  GradebookResponse,
  SubjectSummary,
} from '../models/gradebook.models';
import { getHttpErrorMessage } from '../../../core/utils/http-error-message.util';
import { ToastService } from '../../../core/services/toast.service';
import {
  GradeGridComponent,
  GridCellSelection,
} from '../components/grade-grid.component';
import {
  GradeFormComponent,
  GradeFormSubmitPayload,
} from '../components/grade-form.component';
import { PeriodStatusBannerComponent } from '../components/period-status-banner.component';
import { XlsxExportService } from '../../../shared/services/xlsx-export.service';

@Component({
  selector: 'app-gradebook-page',
  standalone: true,
  imports: [
    GradeGridComponent,
    GradeFormComponent,
    PeriodStatusBannerComponent,
    ReactiveFormsModule,
    TablerIconComponent,
  ],
  template: `
    <main class="page">
      <header class="hero">
        <div>
          <h1>Taruca · Libro de Calificaciones</h1>
          <div class="subject-select">
            <select id="subject" [value]="selectedSubjectId" (change)="onSubjectChange($event)">
              @for (subject of subjects; track subject.id) {
                <option [value]="subject.id">
                  {{ subject.name }} · {{ subject.course.name }} · {{ subject.academicPeriod.year }}
                </option>
              }
            </select>
          </div>
        </div>
      </header>

      <section class="content">
        @if (error) {
          <p class="alert">{{ error }}</p>
        }

        @if (infoMessage) {
          <p class="info">{{ infoMessage }}</p>
        }

        @if (selectedSubject) {
          <app-period-status-banner [isOpen]="selectedSubject.academicPeriod.isOpen" />
        }

        @if (loading) {
          <p class="state">Cargando libro de clases...</p>
        } @else if (!gradebook) {
          <p class="state">No hay información disponible.</p>
        } @else {
          <section class="workspace" [class.has-side-panel]="selection">
            <article class="grid-card">
              <header>
                <h2>Registro de Notas</h2>
                <div class="header-actions">
                  <button
                    type="button"
                    class="icon-btn"
                    [class.active]="isFilterPanelOpen"
                    aria-label="Filtrar"
                    (click)="toggleFilterPanel()"
                  >
                    <i-tabler name="filter" class="btn-icon"></i-tabler>
                  </button>
                  <button
                    type="button"
                    class="icon-btn"
                    aria-label="Descargar"
                    [disabled]="!gradebook || filteredStudents.length === 0"
                    (click)="downloadVisibleGradebook()"
                  >
                    <i-tabler name="download" class="btn-icon"></i-tabler>
                  </button>
                  <button
                    type="button"
                    class="new-eval"
                    [disabled]="!isEditable || saving"
                    (click)="openNewEvaluationModal()"
                  >
                    Nueva Evaluación
                  </button>
                </div>
              </header>

              @if (isFilterPanelOpen) {
                <div class="filters-panel">
                  <label>
                    Buscar alumno
                    <input
                      type="search"
                      [value]="studentSearchTerm"
                      placeholder="Nombre del alumno"
                      (input)="onStudentSearchChange($event)"
                    />
                  </label>

                  <label class="toggle">
                    <input
                      type="checkbox"
                      [checked]="onlyAtRiskStudents"
                      (change)="onAtRiskFilterChange($event)"
                    />
                    Solo promedio menor a 4.0
                  </label>

                  <label class="toggle">
                    <input
                      type="checkbox"
                      [checked]="onlyStudentsWithoutGrades"
                      (change)="onWithoutGradesFilterChange($event)"
                    />
                    Solo sin notas
                  </label>
                </div>
              }

              @if (isUsingPlaceholderEvaluations) {
                <p class="table-hint">
                  Esta asignatura no tiene evaluaciones creadas aún. Mostramos columnas guía para
                  replicar la vista de libro de clases.
                </p>
              }

              <app-grade-grid
                [evaluations]="displayEvaluations"
                [students]="filteredStudents"
                [readonly]="!isEditable"
                (cellSelected)="onCellSelected($event)"
                (studentOpened)="openStudentDetails($event.id, $event.fullName, $event.averageRounded)"
              />
            </article>

            @if (selection) {
              <div class="side-panel animate-slide-in">
                <app-grade-form
                  [gradeId]="selection.gradeId"
                  [score]="selection.score"
                  [studentName]="selection.student.fullName"
                  [evaluationName]="selection.evaluation.name"
                  [requireEvaluationMetadata]="selection.evaluation.id.startsWith('placeholder-')"
                  [disabled]="saving || !isEditable"
                  (save)="saveGrade($event)"
                  (cancel)="selection = null"
                  (remove)="deleteGrade()"
                />
              </div>
            }
          </section>
        }
      </section>

      @if (isCreateEvaluationOpen) {
        <div class="modal-backdrop animate-fade-in" (click)="closeNewEvaluationModal()"></div>
        <section class="modal animate-scale-in" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
          <header>
            <h3>Nueva Evaluación</h3>
            <button type="button" class="close-btn" (click)="closeNewEvaluationModal()"><i-tabler name="x" class="close-icon"></i-tabler></button>
          </header>
          <p>Configura los detalles de la nueva actividad académica.</p>

          <form [formGroup]="newEvaluationForm" (ngSubmit)="createEvaluation()">
            <label>
              Nombre
              <input formControlName="name" placeholder="Examen Final" />
            </label>

            <label>
              Descripción
              <textarea rows="3" formControlName="description" placeholder="Notas sobre la evaluación..."></textarea>
            </label>

            <small>
              Esta evaluación será visible para los estudiantes inmediatamente después de su creación.
            </small>

            <div class="actions">
              <button type="button" class="secondary" (click)="closeNewEvaluationModal()">
                Cancelar
              </button>
              <button
                type="submit"
                class="primary"
                [disabled]="saving || !isEditable || newEvaluationForm.invalid"
              >
                Crear Evaluación
              </button>
            </div>
          </form>
        </section>
      }
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .page {
        min-height: 100dvh;
        background: var(--taruca-bg);
      }

      .hero {
        background: linear-gradient(90deg, #1f4ca4 0%, #2961c7 100%);
        color: #fff;
        padding: 1.2rem 1.5rem;
      }

      h1 {
        margin: 0;
        font-size: clamp(1.3rem, 2.8vw, 1.75rem);
      }

      .subject-select {
        margin-top: 0.75rem;
      }

      .subject-select select {
        min-width: 320px;
        max-width: 100%;
        border: 1px solid rgba(207, 222, 255, 0.4);
        background: rgba(255, 255, 255, 0.14);
        color: #fff;
        border-radius: 999px;
        padding: 0.42rem 0.85rem;
      }

      .content {
        padding: 0.9rem 1rem 1rem;
        display: grid;
        gap: 0.75rem;
      }

      .workspace {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 0.75rem;
      }

      .grid-card {
        background: #fff;
        border: 1px solid var(--taruca-border);
        border-radius: 10px;
        box-shadow: var(--taruca-shadow-sm);
        overflow: hidden;
      }

      .grid-card > header {
        padding: 0.8rem;
        border-bottom: 1px solid #e4eaf4;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .icon-btn {
        border: 1px solid #d7e0ee;
        background: #fff;
        color: #4a628b;
        border-radius: 8px;
        padding: 0.32rem 0.48rem;
        font-size: 0.76rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .icon-btn.active {
        border-color: #1d5edd;
        color: #1d5edd;
        background: #eef4ff;
      }

      .icon-btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .btn-icon {
        width: 16px;
        height: 16px;
      }

      .filters-panel {
        padding: 0.65rem 0.8rem;
        border-bottom: 1px solid #e7edf7;
        background: #f8fbff;
        display: grid;
        gap: 0.55rem;
      }

      .filters-panel label {
        display: grid;
        gap: 0.22rem;
        font-size: 0.74rem;
        color: #5b6c84;
      }

      .filters-panel input[type='search'] {
        border: 1px solid #cad4e6;
        border-radius: 7px;
        padding: 0.45rem 0.55rem;
        background: #fff;
      }

      .filters-panel .toggle {
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }

      .side-panel {
        align-self: start;
      }

      .close-btn {
        border: 0;
        background: transparent;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
        color: #6b7d95;
      }

      .close-btn:hover {
        background: #f0f2f5;
        color: #0b1c30;
      }

      .close-icon {
        width: 20px;
        height: 20px;
      }

      .icon-btn:hover {
        border-color: #1d5edd;
        color: #1d5edd;
      }

      h2 {
        margin: 0;
        font-size: 1rem;
      }

      .new-eval {
        border: 1px solid #cfd9ea;
        background: #fff;
        border-radius: 8px;
        color: #3e5a87;
        padding: 0.35rem 0.55rem;
        font-size: 0.75rem;
        cursor: pointer;
      }

      .new-eval:hover {
        border-color: #1d5edd;
        color: #1d5edd;
      }

      .new-eval:disabled {
        cursor: not-allowed;
        opacity: 0.55;
        border-color: #d7deeb;
        color: #8a98ad;
      }

      .table-hint {
        margin: 0;
        padding: 0.65rem 0.8rem;
        border-bottom: 1px solid #e7edf7;
        font-size: 0.76rem;
        color: #5a6f90;
        background: #f7faff;
      }

      .alert,
      .state,
      .info {
        margin: 0;
        padding: 0.75rem;
        border-radius: 10px;
      }

      .alert {
        background: #fff1ee;
        color: #a72315;
        border: 1px solid #f1c4bc;
      }

      .state {
        background: #eef2f7;
      }

      .info {
        background: #edf5ff;
        color: #30568d;
        border: 1px solid #d3e4ff;
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(13, 23, 40, 0.5);
        z-index: 20;
      }

      .modal {
        position: fixed;
        inset: 50% auto auto 50%;
        transform: translate(-50%, -50%);
        width: min(640px, calc(100% - 2rem));
        z-index: 21;
        background: #fff;
        border-radius: 12px;
        border: 1px solid #d5def0;
        box-shadow: var(--taruca-shadow-md);
        padding: 1rem;
      }

      .modal header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .modal h3 {
        margin: 0;
        font-size: 1.2rem;
      }

      .modal header button {
        border: 0;
        background: transparent;
        font-size: 1.3rem;
        color: #6b7d95;
        cursor: pointer;
      }

      .modal p {
        margin: 0.2rem 0 0.8rem;
        color: #586981;
        font-size: 0.84rem;
      }

      .modal form {
        display: grid;
        gap: 0.6rem;
      }

      .cols {
        display: grid;
        gap: 0.6rem;
        grid-template-columns: 1fr 1fr;
      }

      label {
        display: grid;
        gap: 0.22rem;
        font-size: 0.73rem;
        color: #5b6c84;
      }

      input,
      select,
      textarea {
        border: 1px solid #cad4e6;
        border-radius: 7px;
        padding: 0.52rem 0.58rem;
        background: #fff;
      }

      input:focus,
      select:focus,
      textarea:focus {
        outline: 2px solid rgba(37, 99, 235, 0.22);
        border-color: #2563eb;
      }

      .modal small {
        display: block;
        border: 1px solid #d6e4ff;
        background: #eef5ff;
        color: #4e6588;
        border-radius: 8px;
        padding: 0.52rem;
        font-size: 0.72rem;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.45rem;
      }

      .actions button {
        border-radius: 8px;
        padding: 0.5rem 0.75rem;
      }

      .actions .secondary {
        border: 1px solid #d3dce9;
        background: #fff;
        color: #5f7088;
      }

      .actions .primary {
        border: 0;
        background: #1457d2;
        color: #fff;
        font-weight: 700;
      }

      @media (min-width: 1024px) {
        .workspace.has-side-panel {
          grid-template-columns: minmax(0, 1fr) 330px;
          align-items: start;
        }
      }

      @media (max-width: 576px) {
        .hero {
          padding: 0.9rem 1rem;
        }

        .subject-select select {
          min-width: 100%;
        }

        .grid-card > header {
          flex-direction: column;
          align-items: stretch;
          gap: 0.5rem;
        }

        .header-actions {
          flex-wrap: wrap;
        }

        .content {
          padding: 0.6rem 0.65rem 0.8rem;
        }

        .filters-panel {
          padding: 0.5rem 0.65rem;
        }

        .modal {
          width: calc(100% - 1rem);
          max-height: calc(100dvh - 2rem);
          overflow-y: auto;
          padding: 0.85rem;
        }

        .cols {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class GradebookPageComponent implements OnInit {
  private readonly placeholderEvaluations: EvaluationSummary[] = [
    { id: 'placeholder-prueba-1', name: 'Prueba 1', order: 1, description: null },
    { id: 'placeholder-control-1', name: 'Control 1', order: 2, description: null },
    { id: 'placeholder-taller-1', name: 'Taller 1', order: 3, description: null },
    { id: 'placeholder-ensayo', name: 'Ensayo', order: 4, description: null },
  ];

  subjects: SubjectSummary[] = [];
  selectedSubjectId: string | null = null;
  selectedSubject: SubjectSummary | null = null;
  gradebook: GradebookResponse | null = null;

  loading = false;
  saving = false;
  error: string | null = null;
  infoMessage: string | null = null;
  isFilterPanelOpen = false;
  studentSearchTerm = '';
  onlyAtRiskStudents = false;
  onlyStudentsWithoutGrades = false;

  selection: GridCellSelection | null = null;

  isCreateEvaluationOpen = false;
  readonly newEvaluationForm;

  constructor(
    private readonly api: GradebookApiService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly toast: ToastService,
    private readonly xlsxExport: XlsxExportService,
  ) {
    this.newEvaluationForm = this.formBuilder.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      description: [''],
    });
  }

  get isEditable(): boolean {
    return Boolean(this.selectedSubject?.academicPeriod.isOpen);
  }

  get isUsingPlaceholderEvaluations(): boolean {
    return Boolean(this.gradebook && this.gradebook.evaluations.length === 0);
  }

  get displayEvaluations(): EvaluationSummary[] {
    if (!this.gradebook) {
      return [];
    }

    return this.gradebook.evaluations.length > 0
      ? this.gradebook.evaluations
      : this.placeholderEvaluations;
  }

  get filteredStudents() {
    const students = this.gradebook?.students ?? [];
    const searchTerm = this.studentSearchTerm.trim().toLowerCase();

    return students.filter((student) => {
      if (searchTerm && !student.fullName.toLowerCase().includes(searchTerm)) {
        return false;
      }

      if (this.onlyAtRiskStudents && !student.isBelowPassingGrade) {
        return false;
      }

      if (this.onlyStudentsWithoutGrades && student.grades.length > 0) {
        return false;
      }

      return true;
    });
  }

  ngOnInit(): void {
    this.loadSubjects();
  }

  onSubjectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedSubjectId = value;
    this.selectedSubject = this.subjects.find((subject) => subject.id === value) ?? null;
    this.selection = null;
    this.isCreateEvaluationOpen = false;

    if (this.selectedSubject) {
      this.loadGradebook(this.selectedSubject.id, this.selectedSubject.academicPeriod.id);
    }
  }

  onCellSelected(selection: GridCellSelection): void {
    this.selection = selection;
    this.infoMessage = null;
  }

  toggleFilterPanel(): void {
    this.isFilterPanelOpen = !this.isFilterPanelOpen;
  }

  onStudentSearchChange(event: Event): void {
    this.studentSearchTerm = (event.target as HTMLInputElement).value ?? '';
    this.syncSelectionWithFilters();
  }

  onAtRiskFilterChange(event: Event): void {
    this.onlyAtRiskStudents = (event.target as HTMLInputElement).checked;
    this.syncSelectionWithFilters();
  }

  onWithoutGradesFilterChange(event: Event): void {
    this.onlyStudentsWithoutGrades = (event.target as HTMLInputElement).checked;
    this.syncSelectionWithFilters();
  }

  downloadVisibleGradebook(): void {
    if (!this.gradebook) {
      return;
    }

    if (this.filteredStudents.length === 0) {
      this.toast.info('No hay filas visibles para exportar en el libro de calificaciones.');
      return;
    }

    const evaluations = this.displayEvaluations;
    const rows = this.filteredStudents.map((student) => {
      const row: Record<string, string | number | null> = {
        Alumno: student.fullName,
      };

      for (const evaluation of evaluations) {
        row[evaluation.name] = this.getGradeScore(student, evaluation.id);
      }

      row['Promedio'] = student.averageRounded;
      row['En Riesgo'] = student.isBelowPassingGrade ? 'Sí' : 'No';

      return row;
    });

    const fileName = `taruca-libro-calificaciones-${this.xlsxExport.getCurrentDateStamp()}.xlsx`;
    this.xlsxExport.exportRowsToXlsx(fileName, 'Libro de Calificaciones', rows);
    this.toast.success('Libro de calificaciones exportado correctamente.');
  }

  openStudentDetails(studentId: string, studentName: string, average: number | null): void {
    if (!this.selectedSubject) {
      return;
    }

    void this.router.navigate(['/app/students', studentId], {
      queryParams: {
        name: studentName,
        subjectId: this.selectedSubject.id,
        subjectName: this.selectedSubject.name,
        courseName: this.selectedSubject.course.name,
        average: average ?? '',
      },
    });
  }

  openNewEvaluationModal(): void {
    if (!this.isEditable) {
      this.toast.warning('El período académico está cerrado para modificaciones');
      return;
    }

    if (this.saving) {
      return;
    }

    this.newEvaluationForm.reset({
      name: '',
      description: '',
    });
    this.newEvaluationForm.markAsPristine();
    this.newEvaluationForm.markAsUntouched();
    this.isCreateEvaluationOpen = true;
  }

  closeNewEvaluationModal(): void {
    this.isCreateEvaluationOpen = false;
  }

  createEvaluation(): void {
    if (!this.selectedSubject) {
      return;
    }

    if (!this.isEditable) {
      this.toast.warning('El período académico está cerrado para modificaciones');
      this.isCreateEvaluationOpen = false;
      return;
    }

    this.newEvaluationForm.markAllAsTouched();
    if (this.newEvaluationForm.invalid) {
      return;
    }

    const { name, description } = this.newEvaluationForm.value;
    this.saving = true;
    this.error = null;
    this.infoMessage = null;

    this.api
      .createEvaluation(this.selectedSubject.id, {
        name: name ?? '',
        description: description ?? undefined,
      })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.toast.success('Evaluación creada correctamente.');
          this.isCreateEvaluationOpen = false;
          this.loadGradebook(
            this.selectedSubject!.id,
            this.selectedSubject!.academicPeriod.id,
          );
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error(
            getHttpErrorMessage(err, 'No fue posible crear la evaluación.'),
          );
        },
      });
  }

  saveGrade(payload: GradeFormSubmitPayload): void {
    if (!this.selection || !this.selectedSubject) {
      return;
    }

    this.saving = true;
    this.error = null;
    this.infoMessage = null;

    const request$ = this.selection.evaluation.id.startsWith('placeholder-')
      ? this.api
          .createEvaluation(this.selectedSubject.id, {
            name: payload.evaluationName || this.selection.evaluation.name,
            description: payload.evaluationDescription || undefined,
          })
          .pipe(
            switchMap((evaluation) =>
              this.api.createGrade({
                studentId: this.selection!.student.id,
                evaluationId: evaluation.id,
                score: payload.score,
              }),
            ),
          )
      : this.selection.gradeId
        ? this.api.updateGrade(this.selection.gradeId, { score: payload.score })
        : this.api.createGrade({
            studentId: this.selection.student.id,
            evaluationId: this.selection.evaluation.id,
            score: payload.score,
          });

    request$
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.selection = null;
          this.toast.success('Calificación guardada correctamente.');
          this.loadGradebook(
            this.selectedSubject!.id,
            this.selectedSubject!.academicPeriod.id,
          );
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error(
            getHttpErrorMessage(err, 'No fue posible guardar la calificación.'),
          );
        },
      });
  }

  deleteGrade(): void {
    if (!this.selection?.gradeId || !this.selectedSubject) {
      return;
    }

    const gradeId = this.selection.gradeId;
    const studentName = this.selection.student.fullName;
    const evaluationName = this.selection.evaluation.name;

    this.toast
      .confirm({
        title: 'Eliminar calificación',
        text: `¿Eliminar la calificación de ${studentName} en ${evaluationName}?`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
        icon: 'warning',
        dangerMode: true,
      })
      .then((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.saving = true;
        this.error = null;
        this.infoMessage = null;

        this.api
          .deleteGrade(gradeId)
          .pipe(finalize(() => (this.saving = false)))
          .subscribe({
            next: () => {
              this.selection = null;
              this.toast.success('Calificación eliminada correctamente.');
              this.loadGradebook(
                this.selectedSubject!.id,
                this.selectedSubject!.academicPeriod.id,
              );
            },
            error: (err: HttpErrorResponse) => {
              this.toast.error(
                getHttpErrorMessage(err, 'No fue posible eliminar la calificación.'),
              );
            },
          });
      });
  }

  private loadSubjects(): void {
    this.loading = true;
    this.error = null;

    this.api
      .getSubjects()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (subjects) => {
          const normalizedSubjects = Array.isArray(subjects) ? subjects : [];
          this.subjects = normalizedSubjects;

          if (normalizedSubjects.length === 0) {
            this.gradebook = null;
            return;
          }

          const subjectLoads = normalizedSubjects.map((subject) =>
            this.api
              .getGradebook(subject.id, subject.academicPeriod.id)
              .pipe(catchError(() => of(null))),
          );

          forkJoin(subjectLoads).subscribe((gradebooks) => {
            const ranked = normalizedSubjects
              .map((subject, index) => ({
                subject,
                gradebook: gradebooks[index],
                score:
                  ((gradebooks[index]?.evaluations.length ?? 0) * 100) +
                  (gradebooks[index]?.students.length ?? 0),
              }))
              .sort((a, b) => b.score - a.score);

            const picked = ranked[0];
            this.selectedSubject = picked.subject;
            this.selectedSubjectId = picked.subject.id;

            if (picked.gradebook) {
              this.gradebook = picked.gradebook;
              this.infoMessage = null;
              this.selection = null;
              this.syncSelectionWithFilters();
            } else {
              this.loadGradebook(
                picked.subject.id,
                picked.subject.academicPeriod.id,
              );
            }
          });
        },
        error: (err: HttpErrorResponse) => {
          this.subjects = [];
          this.selectedSubject = null;
          this.selectedSubjectId = null;
          this.gradebook = null;
          this.error = getHttpErrorMessage(
            err,
            'No fue posible cargar las asignaturas.',
          );
          this.infoMessage = null;
        },
      });
  }

  private loadGradebook(subjectId: string, academicPeriodId: string): void {
    this.loading = true;
    this.error = null;

    this.api
      .getGradebook(subjectId, academicPeriodId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (gradebook) => {
          this.gradebook = gradebook;
          this.infoMessage = null;
          this.syncSelectionWithFilters();
        },
        error: (err: HttpErrorResponse) => {
          this.gradebook = null;
          this.error = getHttpErrorMessage(
            err,
            'No fue posible cargar el libro de clases para la asignatura seleccionada.',
          );
          this.infoMessage = null;
        },
      });
  }

  private getGradeScore(student: GradebookResponse['students'][number], evaluationId: string): number | null {
    const grade = student.grades.find((item) => item.evaluationId === evaluationId);
    return grade ? grade.score : null;
  }

  private syncSelectionWithFilters(): void {
    if (!this.selection) {
      return;
    }

    const stillVisible = this.filteredStudents.some(
      (student) => student.id === this.selection?.student.id,
    );

    if (!stillVisible) {
      this.selection = null;
    }
  }
}
