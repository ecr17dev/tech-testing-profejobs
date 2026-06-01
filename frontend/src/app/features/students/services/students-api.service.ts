import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateStudentPayload, Student, UpdateStudentPayload } from '../models/student.models';

@Injectable({ providedIn: 'root' })
export class StudentsApiService {
  private readonly baseUrl = '/api/students';

  constructor(private readonly http: HttpClient) {}

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.baseUrl);
  }

  getStudent(id: string): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/${id}`);
  }

  createStudent(payload: CreateStudentPayload): Observable<Student> {
    return this.http.post<Student>(this.baseUrl, payload);
  }

  updateStudent(id: string, payload: UpdateStudentPayload): Observable<Student> {
    return this.http.patch<Student>(`${this.baseUrl}/${id}`, payload);
  }

  deleteStudent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reactivateStudent(id: string): Observable<Student> {
    return this.http.patch<Student>(`${this.baseUrl}/${id}/reactivate`, {});
  }
}
