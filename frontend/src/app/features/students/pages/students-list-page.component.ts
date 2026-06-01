import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { StudentsApiService } from '../services/students-api.service';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { ToastService } from '../../../core/services/toast.service';
import { getHttpErrorMessage } from '../../../core/utils/http-error-message.util';
import type { Student } from '../models/student.models';
import {
  StudentFormComponent,
  StudentFormSubmitPayload,
} from '../components/student-form.component';
import { TablerIconComponent } from '../../../shared/icons/tabler-icon.component';

@Component({
  selector: 'app-students-list-page',
  standalone: true,
  imports: [StudentFormComponent, TablerIconComponent],
  template: `
    <main class="page">
      <header class="hero">
        <div>
          <h1>Gestión de Alumnos</h1>
          <p>{{ students.length }} alumnos registrados</p>
        </div>
      </header>

      <section class="content">
        @if (error) {
          <p class="alert">{{ error }}</p>
        }

        @if (loading) {
          <p class="state">Cargando alumnos...</p>
        } @else if (students.length === 0) {
          <p class="state">No hay alumnos registrados.</p>
        } @else {
          <article class="grid-card">
            <header>
              <h2>Alumnos</h2>
              <div class="header-actions">
                <button type="button" class="icon-btn" aria-label="Filtrar">
                  <i-tabler name="filter" class="btn-icon"></i-tabler>
                </button>
                <button type="button" class="icon-btn" aria-label="Exportar">
                  <i-tabler name="download" class="btn-icon"></i-tabler>
                </button>
                @if (canManage) {
                  <button
                    type="button"
                    class="new-eval"
                    (click)="openCreateForm()"
                  >
                    Nuevo Alumno
                  </button>
                }
              </div>
            </header>

            <div class="toolbar">
              <label class="filter-toggle">
                <input type="checkbox" [checked]="showInactive" (change)="toggleInactive($event)" />
                Mostrar inactivos
              </label>
            </div>

            <table class="students-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>RUT</th>
                @if (canManage) {
                  <th>Estado</th>
                  <th>Acciones</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (student of filteredStudents; track student.id) {
                <tr [class.inactive]="!student.isActive">
                  <td>
                    <button
                      type="button"
                      class="student-link"
                      (click)="openStudentDetails(student)"
                    >
                      {{ student.firstName }}
                    </button>
                  </td>
                  <td>{{ student.lastName }}</td>
                  <td>{{ student.rut || '—' }}</td>
                  @if (canManage) {
                    <td>
                      <span class="badge" [class.active]="student.isActive" [class.inactive-badge]="!student.isActive">
                        {{ student.isActive ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="actions-cell">
                      <button type="button" class="action-btn" (click)="openEditForm(student)">
                        Editar
                      </button>
                      @if (student.isActive) {
                        <button
                          type="button"
                          class="action-btn danger"
                          (click)="deactivateStudent(student)"
                          [disabled]="saving"
                        >
                          Desactivar
                        </button>
                      } @else {
                        <button
                          type="button"
                          class="action-btn restore"
                          (click)="reactivateStudent(student)"
                          [disabled]="saving"
                        >
                          Reactivar
                        </button>
                      }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
          </article>
        }

        @if (isFormOpen) {
          <div class="modal-backdrop animate-fade-in" (click)="closeForm()"></div>
          <section
            class="modal animate-scale-in"
            role="dialog"
            aria-modal="true"
            (click)="$event.stopPropagation()"
          >
            <app-student-form
              [student]="editingStudent"
              [disabled]="saving"
              (save)="saveStudent($event)"
              (cancel)="closeForm()"
            />
          </section>
        }
      </section>
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
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      h1 {
        margin: 0;
        font-size: clamp(1.3rem, 2.8vw, 1.75rem);
      }

      .hero p {
        margin: 0.15rem 0 0;
        color: #dbe8ff;
        font-size: 0.82rem;
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

      .grid-card > header h2 {
        margin: 0;
        font-size: 1rem;
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

      .icon-btn:hover {
        border-color: #1d5edd;
        color: #1d5edd;
      }

      .btn-icon {
        width: 16px;
        height: 16px;
      }

      .new-eval {
        border: 1px solid #cfd9ea;
        background: #fff;
        border-radius: 8px;
        color: #3e5a87;
        padding: 0.35rem 0.55rem;
        font-size: 0.75rem;
        cursor: pointer;
        white-space: nowrap;
      }

      .new-eval:hover {
        border-color: #1d5edd;
        color: #1d5edd;
      }

      .content {
        padding: 0.9rem 1rem 1rem;
        display: grid;
        gap: 0.75rem;
      }

      .toolbar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 0.8rem;
        border-bottom: 1px solid #edf0f5;
      }

      .filter-toggle {
        font-size: 0.8rem;
        color: #5b6c84;
        display: flex;
        align-items: center;
        gap: 0.35rem;
        cursor: pointer;
      }

      .students-table {
        width: 100%;
        border-collapse: collapse;
        background: #fff;
        border: 1px solid var(--taruca-border);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: var(--taruca-shadow-sm);
      }

      th {
        text-align: left;
        padding: 0.7rem 0.8rem;
        background: #f4f7fd;
        color: #54657f;
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        border-bottom: 1px solid #e2e8f1;
      }

      td {
        padding: 0.6rem 0.8rem;
        border-bottom: 1px solid #edf0f5;
        font-size: 0.82rem;
      }

      tr:last-child td {
        border-bottom: 0;
      }

      tr.inactive {
        background: #fafafa;
        opacity: 0.65;
      }

      .student-link {
        border: 0;
        background: none;
        color: #1d4ed8;
        font-weight: 600;
        cursor: pointer;
        font-size: inherit;
        padding: 0;
        text-decoration: underline;
      }

      .student-link:hover {
        color: #1e3a8a;
      }

      .badge {
        display: inline-block;
        border-radius: 999px;
        padding: 0.2rem 0.6rem;
        font-size: 0.7rem;
        font-weight: 600;
      }

      .badge.active {
        background: #dcfce7;
        color: #166534;
      }

      .badge.inactive-badge {
        background: #fee2e2;
        color: #991b1b;
      }

      .actions-cell {
        display: flex;
        gap: 0.35rem;
        flex-wrap: wrap;
      }

      .action-btn {
        border: 1px solid #d4dceb;
        background: #fff;
        color: #5d6e87;
        border-radius: 7px;
        padding: 0.3rem 0.55rem;
        font-size: 0.72rem;
        cursor: pointer;
        white-space: nowrap;
      }

      .action-btn:hover {
        border-color: #1d5edd;
        color: #1d5edd;
      }

      .action-btn.danger {
        color: #ad2b3a;
        border-color: #f1c4bc;
      }

      .action-btn.danger:hover {
        background: #fee2e2;
      }

      .action-btn.restore {
        color: #15803d;
        border-color: #bbf7d0;
      }

      .action-btn.restore:hover {
        background: #dcfce7;
      }

      .action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .state,
      .alert {
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
        width: min(500px, calc(100% - 2rem));
        z-index: 21;
        background: #fff;
        border-radius: 12px;
        border: 1px solid #d5def0;
        box-shadow: var(--taruca-shadow-md);
        padding: 1rem;
      }
    `,
  ],
})
export class StudentsListPageComponent implements OnInit {
  loading = false;
  saving = false;
  error: string | null = null;

  students: Student[] = [];
  showInactive = false;
  isFormOpen = false;
  editingStudent: Student | null = null;

  constructor(
    private readonly api: StudentsApiService,
    private readonly router: Router,
    private readonly currentUserService: CurrentUserService,
    private readonly toast: ToastService,
  ) {}

  get canManage(): boolean {
    return this.currentUserService.canManageStudents();
  }

  get filteredStudents(): Student[] {
    if (this.showInactive) {
      return this.students;
    }

    return this.students.filter((student) => student.isActive);
  }

  ngOnInit(): void {
    this.loadStudents();
  }

  toggleInactive(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.showInactive = checked;
  }

  openCreateForm(): void {
    this.editingStudent = null;
    this.isFormOpen = true;
  }

  openEditForm(student: Student): void {
    this.editingStudent = student;
    this.isFormOpen = true;
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.editingStudent = null;
  }

  openStudentDetails(student: Student): void {
    void this.router.navigate(['/app/students', student.id], {
      queryParams: {
        name: `${student.firstName} ${student.lastName}`,
      },
    });
  }

  saveStudent(payload: StudentFormSubmitPayload): void {
    this.saving = true;
    this.error = null;

    const apiPayload = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      rut: payload.rut || undefined,
    };

    const request$ = this.editingStudent
      ? this.api.updateStudent(this.editingStudent.id, apiPayload)
      : this.api.createStudent(apiPayload);

    request$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        this.toast.success(
          this.editingStudent
            ? 'Alumno actualizado correctamente.'
            : 'Alumno creado correctamente.',
        );
        this.closeForm();
        this.loadStudents();
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(
          getHttpErrorMessage(err, 'No fue posible guardar el alumno.'),
        );
      },
    });
  }

  deactivateStudent(student: Student): void {
    this.toast
      .confirm({
        title: 'Desactivar alumno',
        text: `¿Desactivar a ${student.firstName} ${student.lastName}? No se eliminarán sus calificaciones.`,
        confirmText: 'Sí, desactivar',
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

        this.api
          .deleteStudent(student.id)
          .pipe(finalize(() => (this.saving = false)))
          .subscribe({
            next: () => {
              this.toast.success('Alumno desactivado correctamente.');
              this.loadStudents();
            },
            error: (err: HttpErrorResponse) => {
              this.toast.error(
                getHttpErrorMessage(err, 'No fue posible desactivar el alumno.'),
              );
            },
          });
      });
  }

  reactivateStudent(student: Student): void {
    this.saving = true;
    this.error = null;

    this.api
      .reactivateStudent(student.id)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.toast.success('Alumno reactivado correctamente.');
          this.loadStudents();
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error(
            getHttpErrorMessage(err, 'No fue posible reactivar el alumno.'),
          );
        },
      });
  }

  private loadStudents(): void {
    this.loading = true;
    this.error = null;

    this.api
      .getStudents()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (students) => {
          this.students = students;
        },
        error: (err: HttpErrorResponse) => {
          this.students = [];
          this.error = getHttpErrorMessage(
            err,
            'No fue posible cargar la lista de alumnos.',
          );
        },
      });
  }
}
