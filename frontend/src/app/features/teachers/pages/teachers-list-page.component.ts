import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { ToastService } from '../../../core/services/toast.service';
import { getHttpErrorMessage } from '../../../core/utils/http-error-message.util';
import { TablerIconComponent } from '../../../shared/icons/tabler-icon.component';
import type { Teacher } from '../models/teacher.models';
import { TeachersApiService } from '../services/teachers-api.service';
import {
  TeacherFormComponent,
  TeacherFormSubmitPayload,
} from '../components/teacher-form.component';

@Component({
  selector: 'app-teachers-list-page',
  standalone: true,
  imports: [TeacherFormComponent, TablerIconComponent],
  template: `
    <main class="page">
      <header class="hero">
        <div>
          <h1>Gestión de Profesores</h1>
          <p>{{ teachers.length }} profesores registrados</p>
        </div>
      </header>

      <section class="content">
        @if (error) {
          <p class="alert">{{ error }}</p>
        }

        @if (loading) {
          <p class="state">Cargando profesores...</p>
        } @else {
          <article class="grid-card">
            <header>
              <h2>Profesores</h2>
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
                <button type="button" class="new-btn" (click)="openCreateForm()">
                  Nuevo Profesor
                </button>
              </div>
            </header>

            @if (isFilterPanelOpen) {
              <div class="toolbar">
                <label>
                  Buscar profesor
                  <input
                    type="search"
                    [value]="searchTerm"
                    placeholder="Nombre o correo"
                    (input)="onSearchChange($event)"
                  />
                </label>
              </div>
            }

            @if (filteredTeachers.length === 0) {
              <p class="state">No hay profesores para mostrar.</p>
            } @else {
              <div class="responsive-table-wrap">
                <table class="teachers-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (teacher of filteredTeachers; track teacher.id) {
                      <tr>
                        <td>{{ teacher.fullName }}</td>
                        <td>{{ teacher.email }}</td>
                        <td class="actions-cell">
                          <button type="button" class="action-btn" (click)="openEditForm(teacher)">
                            Editar
                          </button>
                          <button
                            type="button"
                            class="action-btn danger"
                            (click)="deleteTeacher(teacher)"
                            [disabled]="saving"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
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
            <app-teacher-form
              [teacher]="editingTeacher"
              [disabled]="saving"
              (save)="saveTeacher($event)"
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

      .content {
        padding: 0.9rem 1rem 1rem;
        display: grid;
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
        cursor: pointer;
        display: inline-flex;
      }

      .icon-btn.active {
        border-color: #1d5edd;
        color: #1d5edd;
        background: #eef4ff;
      }

      .btn-icon {
        width: 16px;
        height: 16px;
      }

      .new-btn {
        border: 1px solid #cfd9ea;
        background: #fff;
        border-radius: 8px;
        color: #3e5a87;
        padding: 0.35rem 0.55rem;
        font-size: 0.75rem;
        cursor: pointer;
      }

      .toolbar {
        display: grid;
        gap: 0.55rem;
        padding: 0.55rem 0.8rem;
        border-bottom: 1px solid #edf0f5;
        background: #f8fbff;
      }

      .toolbar label {
        display: grid;
        gap: 0.22rem;
        font-size: 0.74rem;
        color: #5b6c84;
      }

      .toolbar input {
        border: 1px solid #cad4e6;
        border-radius: 7px;
        padding: 0.45rem 0.55rem;
        background: #fff;
      }

      .teachers-table {
        width: 100%;
        min-width: 620px;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 0.7rem 0.8rem;
        border-bottom: 1px solid #e8edf5;
        text-align: left;
      }

      th {
        background: #f4f7fd;
        color: #4f5f76;
        font-size: 0.75rem;
      }

      td {
        font-size: 0.83rem;
      }

      .actions-cell {
        display: flex;
        gap: 0.3rem;
      }

      .action-btn {
        border: 1px solid #ccd8eb;
        background: #fff;
        border-radius: 8px;
        color: #3f5a86;
        padding: 0.34rem 0.5rem;
        font-size: 0.72rem;
        cursor: pointer;
      }

      .action-btn.danger {
        border-color: #f0b3aa;
        color: #b42318;
      }

      .alert,
      .state {
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

      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(13, 23, 40, 0.5);
        z-index: 20;
      }

      .modal {
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        padding: 1rem;
        z-index: 21;
      }

      .modal app-teacher-form {
        width: min(520px, calc(100vw - 2rem));
        max-height: calc(100dvh - 2rem);
        overflow-y: auto;
      }
    `,
  ],
})
export class TeachersListPageComponent implements OnInit {
  teachers: Teacher[] = [];
  loading = false;
  saving = false;
  error: string | null = null;

  isFilterPanelOpen = false;
  searchTerm = '';
  isFormOpen = false;
  editingTeacher: Teacher | null = null;

  constructor(
    private readonly teachersApi: TeachersApiService,
    private readonly currentUserService: CurrentUserService,
    private readonly toast: ToastService,
  ) {}

  get filteredTeachers(): Teacher[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.teachers;
    }

    return this.teachers.filter(
      (teacher) =>
        teacher.fullName.toLowerCase().includes(term) ||
        teacher.email.toLowerCase().includes(term),
    );
  }

  ngOnInit(): void {
    if (!this.currentUserService.canManageTeachers()) {
      this.error = 'No tienes permisos para gestionar profesores.';
      return;
    }

    this.loadTeachers();
  }

  toggleFilterPanel(): void {
    this.isFilterPanelOpen = !this.isFilterPanelOpen;
  }

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value ?? '';
  }

  openCreateForm(): void {
    this.editingTeacher = null;
    this.isFormOpen = true;
  }

  openEditForm(teacher: Teacher): void {
    this.editingTeacher = teacher;
    this.isFormOpen = true;
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.editingTeacher = null;
  }

  saveTeacher(payload: TeacherFormSubmitPayload): void {
    const isEditing = Boolean(this.editingTeacher);
    const request$ = this.editingTeacher
      ? this.teachersApi.updateTeacher(this.editingTeacher.id, payload)
      : this.teachersApi.createTeacher(payload);

    this.saving = true;
    request$
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.closeForm();
          this.toast.success(
            isEditing
              ? 'Profesor actualizado correctamente.'
              : 'Profesor creado correctamente.',
          );
          this.loadTeachers();
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error(
            getHttpErrorMessage(err, 'No fue posible guardar el profesor.'),
          );
        },
      });
  }

  deleteTeacher(teacher: Teacher): void {
    this.toast
      .confirm({
        title: 'Eliminar profesor',
        text: `¿Eliminar al profesor ${teacher.fullName}?`,
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
        this.teachersApi
          .deleteTeacher(teacher.id)
          .pipe(finalize(() => (this.saving = false)))
          .subscribe({
            next: () => {
              this.toast.success('Profesor eliminado correctamente.');
              this.loadTeachers();
            },
            error: (err: HttpErrorResponse) => {
              this.toast.error(
                getHttpErrorMessage(err, 'No fue posible eliminar el profesor.'),
              );
            },
          });
      });
  }

  private loadTeachers(): void {
    this.loading = true;
    this.error = null;

    this.teachersApi
      .getTeachers()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (teachers) => {
          this.teachers = Array.isArray(teachers) ? teachers : [];
        },
        error: (err: HttpErrorResponse) => {
          this.teachers = [];
          this.error = getHttpErrorMessage(
            err,
            'No fue posible cargar los profesores.',
          );
        },
      });
  }
}
