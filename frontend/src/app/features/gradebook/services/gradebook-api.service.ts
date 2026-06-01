import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  AcademicPeriod,
  CreateEvaluationPayload,
  CreateGradePayload,
  EvaluationMutationResponse,
  GradeMutationResponse,
  GradebookResponse,
  StudentGradesResponse,
  SubjectSummary,
  UpdateGradePayload,
} from '../models/gradebook.models';

@Injectable({ providedIn: 'root' })
export class GradebookApiService {
  private readonly baseUrl = '/api';

  constructor(private readonly http: HttpClient) {}

  getSubjects(): Observable<SubjectSummary[]> {
    return this.http
      .get<unknown>(`${this.baseUrl}/subjects`)
      .pipe(
        map((payload) =>
          this.normalizeArray(payload)
            .map((item) => this.mapSubject(item))
            .filter((item): item is SubjectSummary => item !== null),
        ),
      );
  }

  getAcademicPeriods(): Observable<AcademicPeriod[]> {
    return this.http
      .get<unknown>(`${this.baseUrl}/academic-periods`)
      .pipe(
        map((payload) =>
          this.normalizeArray(payload)
            .map((item) => this.mapAcademicPeriod(item))
            .filter((item): item is AcademicPeriod => item !== null),
        ),
      );
  }

  updateAcademicPeriodStatus(
    periodId: string,
    isOpen: boolean,
  ): Observable<AcademicPeriod> {
    return this.http
      .patch<unknown>(`${this.baseUrl}/academic-periods/${periodId}/status`, {
        isOpen,
      })
      .pipe(
        map((payload) => {
          const normalized = this.mapAcademicPeriod(this.normalizeObject(payload));
          if (!normalized) {
            throw new Error('Invalid academic period response');
          }

          return normalized;
        }),
      );
  }

  getGradebook(
    subjectId: string,
    academicPeriodId?: string,
  ): Observable<GradebookResponse> {
    const params = academicPeriodId ? { academicPeriodId } : undefined;

    return this.http
      .get<unknown>(`${this.baseUrl}/subjects/${subjectId}/gradebook`, {
        params,
      })
      .pipe(map((payload) => this.mapGradebook(payload)));
  }

  getStudentGrades(
    subjectId: string,
    studentId: string,
  ): Observable<StudentGradesResponse> {
    return this.http
      .get<unknown>(
        `${this.baseUrl}/subjects/${subjectId}/students/${studentId}/grades`,
      )
      .pipe(map((payload) => this.mapStudentGrades(payload)));
  }

  createGrade(payload: CreateGradePayload): Observable<GradeMutationResponse> {
    return this.http.post<GradeMutationResponse>(`${this.baseUrl}/grades`, payload);
  }

  updateGrade(
    id: string,
    payload: UpdateGradePayload,
  ): Observable<GradeMutationResponse> {
    return this.http.patch<GradeMutationResponse>(`${this.baseUrl}/grades/${id}`, payload);
  }

  deleteGrade(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/grades/${id}`);
  }

  createEvaluation(
    subjectId: string,
    payload: CreateEvaluationPayload,
  ): Observable<EvaluationMutationResponse> {
    return this.http
      .post<unknown>(`${this.baseUrl}/subjects/${subjectId}/evaluations`, payload)
      .pipe(map((item) => this.mapEvaluationMutation(item)));
  }

  private normalizeArray(payload: unknown): unknown[] {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (
      payload &&
      typeof payload === 'object' &&
      'data' in payload &&
      Array.isArray((payload as { data: unknown }).data)
    ) {
      return (payload as { data: unknown[] }).data;
    }

    if (
      payload &&
      typeof payload === 'object' &&
      'items' in payload &&
      Array.isArray((payload as { items: unknown }).items)
    ) {
      return (payload as { items: unknown[] }).items;
    }

    if (
      payload &&
      typeof payload === 'object' &&
      'result' in payload &&
      Array.isArray((payload as { result: unknown }).result)
    ) {
      return (payload as { result: unknown[] }).result;
    }

    return [];
  }

  private mapEvaluationMutation(payload: unknown): EvaluationMutationResponse {
    const normalized = this.asRecord(this.normalizeObject(payload));
    return {
      id: this.asString(normalized?.['id'], ''),
      name: this.asString(normalized?.['name'], ''),
      description: this.asNullableString(normalized?.['description']),
      order: this.asNumber(normalized?.['order'], 0),
    };
  }

  private normalizeObject(payload: unknown): unknown {
    if (
      payload &&
      typeof payload === 'object' &&
      'data' in payload &&
      (payload as { data: unknown }).data &&
      typeof (payload as { data: unknown }).data === 'object'
    ) {
      return (payload as { data: unknown }).data;
    }

    if (
      payload &&
      typeof payload === 'object' &&
      'result' in payload &&
      (payload as { result: unknown }).result &&
      typeof (payload as { result: unknown }).result === 'object'
    ) {
      return (payload as { result: unknown }).result;
    }

    return payload;
  }

  private mapSubject(payload: unknown): SubjectSummary | null {
    const record = this.asRecord(payload);
    if (!record) {
      return null;
    }

    const courseRecord = this.asRecord(record['course']);
    const periodRecord = this.asRecord(record['academicPeriod'] ?? record['period']);

    const id = this.asString(record['id'] ?? record['subjectId']);
    if (!id) {
      return null;
    }

    const courseId = this.asString(
      courseRecord?.['id'] ?? record['courseId'] ?? `course-${id}`,
    );

    const periodId = this.asString(
      periodRecord?.['id'] ?? record['academicPeriodId'] ?? record['periodId'],
    );

    return {
      id,
      name: this.asString(record['name'] ?? record['subjectName'] ?? 'Asignatura'),
      course: {
        id: courseId,
        name: this.asString(
          courseRecord?.['name'] ?? record['courseName'] ?? 'Curso',
        ),
      },
      academicPeriod: {
        id: periodId || `period-${id}`,
        name: this.asString(
          periodRecord?.['name'] ?? record['academicPeriodName'] ?? 'Período',
        ),
        year: this.asNumber(periodRecord?.['year'] ?? record['academicYear'], 0),
        isOpen: this.asBoolean(periodRecord?.['isOpen'] ?? record['isOpen'], true),
      },
    };
  }

  private mapAcademicPeriod(payload: unknown): AcademicPeriod | null {
    const record = this.asRecord(payload);
    if (!record) {
      return null;
    }

    const id = this.asString(record['id'] ?? record['academicPeriodId']);
    if (!id) {
      return null;
    }

    return {
      id,
      name: this.asString(record['name'] ?? 'Período'),
      year: this.asNumber(record['year'], 0),
      isOpen: this.asBoolean(record['isOpen'], true),
    };
  }

  private mapGradebook(payload: unknown): GradebookResponse {
    const normalized = this.asRecord(this.normalizeObject(payload));
    const subjectRecord = this.asRecord(normalized?.['subject']);
    const subjectId = this.asString(subjectRecord?.['id'], '');
    const periodRecord = this.asRecord(subjectRecord?.['academicPeriod']);

    const evaluations = this.normalizeArray(
      normalized?.['evaluations'] ?? normalized?.['columns'] ?? normalized?.['items'],
    )
      .map((item) => this.mapEvaluation(item))
      .filter((item): item is GradebookResponse['evaluations'][number] => item !== null);

    const students = this.normalizeArray(
      normalized?.['students'] ?? normalized?.['rows'] ?? normalized?.['data'],
    )
      .map((item) => this.mapStudentRow(item))
      .filter((item): item is GradebookResponse['students'][number] => item !== null);

    return {
      subject: {
        id: subjectId || 'subject-unknown',
        name: this.asString(subjectRecord?.['name'] ?? 'Asignatura'),
        course: {
          id: this.asString(
            this.asRecord(subjectRecord?.['course'])?.['id'] ?? 'course-unknown',
          ),
          name: this.asString(
            this.asRecord(subjectRecord?.['course'])?.['name'] ?? 'Curso',
          ),
        },
        academicPeriod: {
          id: this.asString(periodRecord?.['id'] ?? 'period-unknown'),
        },
      },
      evaluations,
      students,
    };
  }

  private mapEvaluation(
    payload: unknown,
  ): GradebookResponse['evaluations'][number] | null {
    const record = this.asRecord(payload);
    if (!record) {
      return null;
    }

    const id = this.asString(record['id'] ?? record['evaluationId']);
    if (!id) {
      return null;
    }

    return {
      id,
      name: this.asString(record['name'] ?? record['title'] ?? 'Evaluación'),
      description: this.asNullableString(record['description']),
      order: this.asNumber(record['order'] ?? record['displayOrder'], 0),
    };
  }

  private mapStudentRow(payload: unknown): GradebookResponse['students'][number] | null {
    const record = this.asRecord(payload);
    if (!record) {
      return null;
    }

    const id = this.asString(record['id'] ?? record['studentId']);
    if (!id) {
      return null;
    }

    const grades = this.normalizeArray(
      record['grades'] ?? record['cells'] ?? record['scores'],
    )
      .map((item) => this.mapGradeCell(item))
      .filter(
        (item): item is GradebookResponse['students'][number]['grades'][number] =>
          item !== null,
      );

    const average = this.asNullableNumber(record['average']);
    const averageRounded =
      this.asNullableNumber(record['averageRounded']) ?? average;

    return {
      id,
      fullName: this.asString(record['fullName'] ?? record['studentName'] ?? 'Alumno'),
      grades,
      average,
      averageRounded,
      isBelowPassingGrade:
        this.asBoolean(record['isBelowPassingGrade'], false) ||
        (averageRounded !== null ? averageRounded < 4 : false),
    };
  }

  private mapGradeCell(
    payload: unknown,
  ): GradebookResponse['students'][number]['grades'][number] | null {
    const record = this.asRecord(payload);
    if (!record) {
      return null;
    }

    const evaluationId = this.asString(
      record['evaluationId'] ?? record['evaluation_id'],
    );
    if (!evaluationId) {
      return null;
    }

    return {
      id: this.asString(record['id'] ?? record['gradeId'] ?? `grade-${evaluationId}`),
      evaluationId,
      score: this.asNumber(record['score'], 0),
    };
  }

  private mapStudentGrades(payload: unknown): StudentGradesResponse {
    const normalized = this.asRecord(this.normalizeObject(payload));
    const subjectRecord = this.asRecord(normalized?.['subject']);

    return {
      subject: {
        id: this.asString(
          subjectRecord?.['id'] ?? normalized?.['subjectId'] ?? 'subject-unknown',
        ),
        name: this.asString(subjectRecord?.['name'] ?? 'Asignatura'),
      },
      studentId: this.asString(normalized?.['studentId'] ?? 'student-unknown'),
      grades: this.normalizeArray(normalized?.['grades'])
        .map((item) => this.mapStudentGradeItem(item))
        .filter((item): item is StudentGradesResponse['grades'][number] => item !== null),
    };
  }

  private mapStudentGradeItem(
    payload: unknown,
  ): StudentGradesResponse['grades'][number] | null {
    const record = this.asRecord(payload);
    if (!record) {
      return null;
    }

    const evaluationId = this.asString(record['evaluationId']);
    if (!evaluationId) {
      return null;
    }

    return {
      evaluationId,
      evaluationName: this.asString(
        record['evaluationName'] ?? record['name'] ?? 'Evaluación',
      ),
      score: this.asNumber(record['score'], 0),
      gradeId: this.asString(
        record['gradeId'] ?? record['id'] ?? `grade-${evaluationId}`,
      ),
    };
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  }

  private asString(value: unknown, fallback = ''): string {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return fallback;
  }

  private asNullableString(value: unknown): string | null {
    if (typeof value === 'string') {
      return value;
    }

    return null;
  }

  private asNumber(value: unknown, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    }

    return fallback;
  }

  private asNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    return this.asNumber(value, 0);
  }

  private asBoolean(value: unknown, fallback: boolean): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') {
        return true;
      }
      if (value.toLowerCase() === 'false') {
        return false;
      }
    }

    return fallback;
  }
}
