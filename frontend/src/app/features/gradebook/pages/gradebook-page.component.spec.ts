import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { GradebookPageComponent } from './gradebook-page.component';
import { GradebookApiService } from '../services/gradebook-api.service';

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

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [GradebookPageComponent],
      providers: [{ provide: GradebookApiService, useValue: apiMock }],
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
    expect(component.infoMessage).toContain('cerrado');
  });
});
