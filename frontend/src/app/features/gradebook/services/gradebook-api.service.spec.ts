import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { GradebookApiService } from './gradebook-api.service';

describe('GradebookApiService', () => {
  let service: GradebookApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(GradebookApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests gradebook with academicPeriodId query param', () => {
    service.getGradebook('subject-1', 'period-1').subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.method === 'GET' &&
        request.url === '/api/subjects/subject-1/gradebook' &&
        request.params.get('academicPeriodId') === 'period-1',
    );

    req.flush({
      subject: {
        id: 'subject-1',
        name: 'Matemáticas',
        course: { id: 'course-1', name: '8vo A' },
        academicPeriod: { id: 'period-1' },
      },
      evaluations: [],
      students: [],
    });
  });

  it('requests gradebook without query params when academicPeriodId is omitted', () => {
    service.getGradebook('subject-1').subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.method === 'GET' &&
        request.url === '/api/subjects/subject-1/gradebook' &&
        !request.params.has('academicPeriodId'),
    );

    req.flush({
      subject: {
        id: 'subject-1',
        name: 'Matemáticas',
        course: { id: 'course-1', name: '8vo A' },
        academicPeriod: { id: 'period-1' },
      },
      evaluations: [],
      students: [],
    });
  });

  it('sends POST /grades when creating grade', () => {
    service
      .createGrade({
        studentId: 'student-1',
        evaluationId: 'eval-1',
        score: 6.2,
      })
      .subscribe();

    const req = httpMock.expectOne('/api/grades');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      studentId: 'student-1',
      evaluationId: 'eval-1',
      score: 6.2,
    });

    req.flush({
      id: 'grade-1',
      studentId: 'student-1',
      evaluationId: 'eval-1',
      score: 6.2,
    });
  });

  it('sends POST /subjects/:id/evaluations when creating evaluation', () => {
    service
      .createEvaluation('subject-1', {
        name: 'Prueba 2',
        description: 'Unidad 2',
      })
      .subscribe();

    const req = httpMock.expectOne('/api/subjects/subject-1/evaluations');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'Prueba 2',
      description: 'Unidad 2',
    });

    req.flush({
      id: 'eval-2',
      name: 'Prueba 2',
      description: 'Unidad 2',
      order: 2,
    });
  });

  it('sends DELETE /subjects/:id/evaluations/:evaluationId when deleting evaluation', () => {
    service.deleteEvaluation('subject-1', 'eval-2').subscribe();

    const req = httpMock.expectOne('/api/subjects/subject-1/evaluations/eval-2');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('sends PATCH /academic-periods/:id/status when updating period status', () => {
    let result: unknown;

    service
      .updateAcademicPeriodStatus('period-1', false)
      .subscribe((response) => (result = response));

    const req = httpMock.expectOne('/api/academic-periods/period-1/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ isOpen: false });

    req.flush({
      id: 'period-1',
      name: 'Primer Semestre',
      year: 2026,
      isOpen: false,
    });

    expect(result).toEqual({
      id: 'period-1',
      name: 'Primer Semestre',
      year: 2026,
      isOpen: false,
    });
  });

  it('normalizes wrapped subjects payload with alternate fields', () => {
    let result: unknown;

    service.getSubjects().subscribe((response) => {
      result = response;
    });

    const req = httpMock.expectOne('/api/subjects');
    expect(req.request.method).toBe('GET');

    req.flush({
      data: [
        {
          subjectId: 'subject-1',
          subjectName: 'Matemáticas',
          courseId: 'course-1',
          courseName: '8vo A',
          period: {
            id: 'period-1',
            name: 'Primer Semestre',
            year: '2026',
            isOpen: 'true',
          },
        },
      ],
    });

    expect(result).toEqual([
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
    ]);
  });

  it('normalizes gradebook payload wrapped in data', () => {
    let result: unknown;

    service.getGradebook('subject-1', 'period-1').subscribe((response) => {
      result = response;
    });

    const req = httpMock.expectOne(
      (request) =>
        request.method === 'GET' &&
        request.url === '/api/subjects/subject-1/gradebook' &&
        request.params.get('academicPeriodId') === 'period-1',
    );

    req.flush({
      data: {
        subject: {
          id: 'subject-1',
          name: 'Matemáticas',
          course: { id: 'course-1', name: '8vo A' },
          academicPeriod: { id: 'period-1' },
        },
        columns: [{ evaluationId: 'eval-1', title: 'Prueba 1', displayOrder: 1 }],
        rows: [
          {
            studentId: 'student-1',
            studentName: 'Ana Pérez',
            cells: [{ gradeId: 'grade-1', evaluationId: 'eval-1', score: '6.5' }],
            average: '6.5',
          },
        ],
      },
    });

    expect(result).toEqual({
      subject: {
        id: 'subject-1',
        name: 'Matemáticas',
        course: { id: 'course-1', name: '8vo A' },
        academicPeriod: { id: 'period-1' },
      },
      evaluations: [
        { id: 'eval-1', name: 'Prueba 1', description: null, order: 1 },
      ],
      students: [
        {
          id: 'student-1',
          fullName: 'Ana Pérez',
          grades: [{ id: 'grade-1', evaluationId: 'eval-1', score: 6.5 }],
          average: 6.5,
          averageRounded: 6.5,
          isBelowPassingGrade: false,
        },
      ],
    });
  });
});
