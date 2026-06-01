import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { GradebookPageComponent } from './gradebook-page.component';
import { GradebookApiService } from '../services/gradebook-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { XlsxExportService } from '../../../shared/services/xlsx-export.service';

describe('GradebookPageComponent', () => {
  let component: GradebookPageComponent;
  let fixture: ComponentFixture<GradebookPageComponent>;

  const apiMock = {
    getSubjects: vi.fn(),
    getGradebook: vi.fn(),
    createEvaluation: vi.fn(),
    createGrade: vi.fn(),
    updateGrade: vi.fn(),
    deleteGrade: vi.fn(),
  };
  const toastMock = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    confirm: vi.fn(),
  };
  const xlsxExportMock = {
    exportRowsToXlsx: vi.fn(),
    getCurrentDateStamp: vi.fn(() => '2026-06-01'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    apiMock.getSubjects.mockReturnValue(of([]));
    apiMock.getGradebook.mockReturnValue(
      of({
        subject: {
          id: 'subject-1',
          name: 'Matemáticas',
          course: { id: 'course-1', name: '8vo A' },
          academicPeriod: { id: 'period-1' },
        },
        evaluations: [],
        students: [],
      }),
    );

    await TestBed.configureTestingModule({
      imports: [GradebookPageComponent],
      providers: [
        provideRouter([]),
        { provide: GradebookApiService, useValue: apiMock },
        { provide: ToastService, useValue: toastMock },
        { provide: XlsxExportService, useValue: xlsxExportMock },
      ],
    }).compileComponents();
  });

  it('loads subjects and gradebook on init', () => {
    apiMock.getSubjects.mockReturnValue(
      of([
        {
          id: 'subject-1',
          name: 'Matemáticas',
          course: { id: 'course-1', name: '8vo A' },
          academicPeriod: {
            id: 'period-1',
            name: 'Primer Semestre',
            year: 2026,
            isOpen: true,
          },
        },
      ]),
    );
    apiMock.getGradebook.mockReturnValue(
      of({
        subject: {
          id: 'subject-1',
          name: 'Matemáticas',
          course: { id: 'course-1', name: '8vo A' },
          academicPeriod: { id: 'period-1' },
        },
        evaluations: [],
        students: [],
      }),
    );

    fixture = TestBed.createComponent(GradebookPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(apiMock.getSubjects).toHaveBeenCalledTimes(1);
    expect(apiMock.getGradebook).toHaveBeenCalledWith('subject-1', 'period-1');
    expect(component.selectedSubjectId).toBe('subject-1');
    expect(component.gradebook?.subject.id).toBe('subject-1');
  });

  it('shows error state when subjects request fails', () => {
    apiMock.getSubjects.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 0,
            error: new ProgressEvent('error'),
          }),
      ),
    );
    apiMock.getGradebook.mockReturnValue(of(null));

    fixture = TestBed.createComponent(GradebookPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.gradebook).toBeNull();
    expect(component.subjects).toEqual([]);
    expect(component.error).toContain(
      'No fue posible conectar con el backend. Verifica que esté activo.',
    );
    expect(component.infoMessage).toBeNull();
  });

  it('disables creating evaluations when academic period is closed', () => {
    apiMock.getSubjects.mockReturnValue(
      of([
        {
          id: 'subject-1',
          name: 'Matemáticas',
          course: { id: 'course-1', name: '8vo A' },
          academicPeriod: {
            id: 'period-1',
            name: 'Primer Semestre',
            year: 2026,
            isOpen: false,
          },
        },
      ]),
    );
    apiMock.getGradebook.mockReturnValue(
      of({
        subject: {
          id: 'subject-1',
          name: 'Matemáticas',
          course: { id: 'course-1', name: '8vo A' },
          academicPeriod: { id: 'period-1' },
        },
        evaluations: [],
        students: [],
      }),
    );

    fixture = TestBed.createComponent(GradebookPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.new-eval') as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    component.openNewEvaluationModal();
    expect(component.isCreateEvaluationOpen).toBe(false);
    expect(toastMock.warning).toHaveBeenCalledWith(
      'El período académico está cerrado para modificaciones',
    );
  });

  it('filters students by name search', () => {
    fixture = TestBed.createComponent(GradebookPageComponent);
    component = fixture.componentInstance;
    component.gradebook = {
      subject: {
        id: 'subject-1',
        name: 'Matemáticas',
        course: { id: 'course-1', name: '8vo A' },
        academicPeriod: { id: 'period-1' },
      },
      evaluations: [],
      students: [
        {
          id: 's-1',
          fullName: 'Emilia Araya',
          grades: [],
          average: null,
          averageRounded: null,
          isBelowPassingGrade: false,
        },
        {
          id: 's-2',
          fullName: 'Diego Campos',
          grades: [],
          average: null,
          averageRounded: null,
          isBelowPassingGrade: false,
        },
      ],
    };
    component.studentSearchTerm = 'emilia';

    expect(component.filteredStudents.map((student) => student.fullName)).toEqual([
      'Emilia Araya',
    ]);
  });

  it('combines at-risk and without-grades filters', () => {
    fixture = TestBed.createComponent(GradebookPageComponent);
    component = fixture.componentInstance;
    component.gradebook = {
      subject: {
        id: 'subject-1',
        name: 'Matemáticas',
        course: { id: 'course-1', name: '8vo A' },
        academicPeriod: { id: 'period-1' },
      },
      evaluations: [],
      students: [
        {
          id: 's-1',
          fullName: 'At Risk With Grades',
          grades: [{ id: 'g-1', evaluationId: 'e-1', score: 3.2 }],
          average: 3.2,
          averageRounded: 3.2,
          isBelowPassingGrade: true,
        },
        {
          id: 's-2',
          fullName: 'At Risk Without Grades',
          grades: [],
          average: null,
          averageRounded: null,
          isBelowPassingGrade: true,
        },
        {
          id: 's-3',
          fullName: 'Safe Without Grades',
          grades: [],
          average: null,
          averageRounded: null,
          isBelowPassingGrade: false,
        },
      ],
    };
    component.onlyAtRiskStudents = true;
    component.onlyStudentsWithoutGrades = true;

    expect(component.filteredStudents.map((student) => student.id)).toEqual(['s-2']);
  });

  it('exports only visible rows in gradebook', () => {
    fixture = TestBed.createComponent(GradebookPageComponent);
    component = fixture.componentInstance;
    component.gradebook = {
      subject: {
        id: 'subject-1',
        name: 'Matemáticas',
        course: { id: 'course-1', name: '8vo A' },
        academicPeriod: { id: 'period-1' },
      },
      evaluations: [{ id: 'e-1', name: 'Prueba 1', order: 1, description: null }],
      students: [
        {
          id: 's-1',
          fullName: 'Emilia Araya',
          grades: [{ id: 'g-1', evaluationId: 'e-1', score: 5.8 }],
          average: 5.8,
          averageRounded: 5.8,
          isBelowPassingGrade: false,
        },
        {
          id: 's-2',
          fullName: 'Diego Campos',
          grades: [{ id: 'g-2', evaluationId: 'e-1', score: 3.4 }],
          average: 3.4,
          averageRounded: 3.4,
          isBelowPassingGrade: true,
        },
      ],
    };
    component.studentSearchTerm = 'Diego';

    component.downloadVisibleGradebook();

    expect(xlsxExportMock.exportRowsToXlsx).toHaveBeenCalledTimes(1);
    expect(xlsxExportMock.exportRowsToXlsx).toHaveBeenCalledWith(
      'taruca-libro-calificaciones-2026-06-01.xlsx',
      'Libro de Calificaciones',
      [
        {
          Alumno: 'Diego Campos',
          'Prueba 1': 3.4,
          Promedio: 3.4,
          'En Riesgo': 'Sí',
        },
      ],
    );
  });

  it('does not export when there are no visible rows', () => {
    fixture = TestBed.createComponent(GradebookPageComponent);
    component = fixture.componentInstance;
    component.gradebook = {
      subject: {
        id: 'subject-1',
        name: 'Matemáticas',
        course: { id: 'course-1', name: '8vo A' },
        academicPeriod: { id: 'period-1' },
      },
      evaluations: [],
      students: [
        {
          id: 's-1',
          fullName: 'Emilia Araya',
          grades: [],
          average: null,
          averageRounded: null,
          isBelowPassingGrade: false,
        },
      ],
    };
    component.studentSearchTerm = 'No existe';

    component.downloadVisibleGradebook();

    expect(xlsxExportMock.exportRowsToXlsx).not.toHaveBeenCalled();
    expect(toastMock.info).toHaveBeenCalledWith(
      'No hay filas visibles para exportar en el libro de calificaciones.',
    );
  });
});
