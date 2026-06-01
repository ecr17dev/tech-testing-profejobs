import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TablerIconComponent } from '../../../shared/icons/tabler-icon.component';
import {
  EvaluationSummary,
  GradebookStudentRow,
} from '../models/gradebook.models';

export interface GridCellSelection {
  student: GradebookStudentRow;
  evaluation: EvaluationSummary;
  gradeId: string | null;
  score: number | null;
}

@Component({
  selector: 'app-grade-grid',
  standalone: true,
  imports: [TablerIconComponent],
  template: `
    <div class="table-wrapper responsive-table-wrap">
      <table>
        <thead>
          <tr>
            <th class="sticky">Alumno</th>
            @for (evaluation of evaluations; track evaluation.id) {
              <th>
                <div class="evaluation-header">
                  <span>{{ evaluation.name }}</span>
                  @if (canDeleteEvaluations && !evaluation.id.startsWith('placeholder-')) {
                    <button
                      type="button"
                      class="evaluation-delete-btn"
                      aria-label="Eliminar evaluación"
                      [disabled]="readonly"
                      (click)="requestEvaluationDelete(evaluation)"
                    >
                      <i-tabler name="x" class="delete-icon"></i-tabler>
                    </button>
                  }
                </div>
              </th>
            }
            <th>Promedio</th>
          </tr>
        </thead>

        <tbody>
          @for (student of students; track student.id) {
            <tr>
              <td class="student sticky">
                <button type="button" class="student-btn" (click)="studentOpened.emit(student)">
                  {{ student.fullName }}
                </button>
              </td>

              @for (evaluation of evaluations; track evaluation.id) {
                <td>
                  <button
                    type="button"
                    class="cell"
                    [disabled]="readonly"
                    (click)="selectCell(student, evaluation.id)"
                  >
                    {{ gradeValue(student, evaluation.id) ?? '—' }}
                  </button>
                </td>
              }

              <td class="average" [class.average--risk]="student.isBelowPassingGrade">
                {{ student.averageRounded ?? 'Sin notas' }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .table-wrapper {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      table {
        width: 100%;
        min-width: 720px;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 0.55rem 0.6rem;
        border-bottom: 1px solid #e2e8f1;
        text-align: center;
        font-size: 0.79rem;
      }

      th {
        background: #eef3fc;
        color: #4f5f76;
        font-weight: 600;
      }

      .sticky {
        position: sticky;
        left: 0;
        z-index: 1;
        background: #fff;
      }

      th.sticky {
        z-index: 2;
        background: #eef3fc;
      }

      .student {
        text-align: left;
        min-width: 180px;
      }

      .evaluation-header {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
      }

      .evaluation-delete-btn {
        border: 1px solid #d4dfef;
        background: #f7f9fc;
        color: #6e7f99;
        border-radius: 6px;
        padding: 0.1rem;
        width: 18px;
        height: 18px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .evaluation-delete-btn:hover:not(:disabled) {
        border-color: #d92d20;
        color: #d92d20;
        background: #fff3f2;
      }

      .evaluation-delete-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .delete-icon {
        width: 13px;
        height: 13px;
      }

      .student-btn {
        border: 0;
        background: transparent;
        color: #1f2d43;
        text-align: left;
        cursor: pointer;
        font-weight: 600;
      }

      .student-btn:hover {
        color: #1d5edd;
      }

      .cell {
        width: 100%;
        border: 0;
        border-radius: 7px;
        padding: 0.28rem;
        background: #edf3ff;
        cursor: pointer;
      }

      .cell:disabled {
        cursor: default;
        background: #f5f8fd;
      }

      .average {
        font-weight: 700;
        color: #1b5a36;
      }

      .average--risk {
        color: #b42318;
      }

      @media (max-width: 576px) {
        th,
        td {
          padding: 0.4rem 0.45rem;
          font-size: 0.72rem;
        }

        .student {
          min-width: 140px;
        }

        table {
          min-width: 520px;
        }

        .cell {
          min-width: 52px;
        }
      }
    `,
  ],
})
export class GradeGridComponent {
  @Input({ required: true }) evaluations: EvaluationSummary[] = [];
  @Input({ required: true }) students: GradebookStudentRow[] = [];
  @Input() readonly = false;
  @Input() canDeleteEvaluations = false;

  @Output() cellSelected = new EventEmitter<GridCellSelection>();
  @Output() studentOpened = new EventEmitter<GradebookStudentRow>();
  @Output() evaluationDeleteRequested = new EventEmitter<EvaluationSummary>();

  gradeValue(student: GradebookStudentRow, evaluationId: string): number | null {
    const grade = student.grades.find((item) => item.evaluationId === evaluationId);
    return grade ? grade.score : null;
  }

  selectCell(student: GradebookStudentRow, evaluationId: string): void {
    const grade = student.grades.find((item) => item.evaluationId === evaluationId);
    const evaluation = this.evaluations.find((item) => item.id === evaluationId);

    if (!evaluation) {
      return;
    }

    this.cellSelected.emit({
      student,
      evaluation,
      gradeId: grade?.id ?? null,
      score: grade?.score ?? null,
    });
  }

  requestEvaluationDelete(evaluation: EvaluationSummary): void {
    this.evaluationDeleteRequested.emit(evaluation);
  }
}
