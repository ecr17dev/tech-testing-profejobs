import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateTeacherPayload,
  Teacher,
  UpdateTeacherPayload,
} from '../models/teacher.models';

@Injectable({ providedIn: 'root' })
export class TeachersApiService {
  private readonly baseUrl = '/api/teachers';

  constructor(private readonly http: HttpClient) {}

  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(this.baseUrl);
  }

  getTeacher(id: string): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.baseUrl}/${id}`);
  }

  createTeacher(payload: CreateTeacherPayload): Observable<Teacher> {
    return this.http.post<Teacher>(this.baseUrl, payload);
  }

  updateTeacher(id: string, payload: UpdateTeacherPayload): Observable<Teacher> {
    return this.http.patch<Teacher>(`${this.baseUrl}/${id}`, payload);
  }

  deleteTeacher(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
