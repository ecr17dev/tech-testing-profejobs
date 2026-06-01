import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  template: `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th class="sticky">Alumno</th>
            @for (evaluation of evaluations; track evaluation.id) {
              <th>{{ evaluation.name }}</th>
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
    `,
  ],
})
export class GradeGridComponent {
  @Input({ required: true }) evaluations: EvaluationSummary[] = [];
  @Input({ required: true }) students: GradebookStudentRow[] = [];
  @Input() readonly = false;

  @Output() cellSelected = new EventEmitter<GridCellSelection>();
  @Output() studentOpened = new EventEmitter<GradebookStudentRow>();

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
}
