import { Injectable } from '@angular/core';

export interface MockUserProfile {
  label: string;
  role: 'DIRECTOR' | 'UTP' | 'TEACHER';
  token: string;
  description: string;
  email: string;
  password: string;
}

export type MockUserRole = MockUserProfile['role'];

const TOKEN_STORAGE_KEY = 'taruca_mock_token';

const MOCK_USER_PROFILES: MockUserProfile[] = [
  {
    label: 'Directora',
    role: 'DIRECTOR',
    token: 'director-token',
    description: 'Acceso directivo completo de institución',
    email: 'director@taruca.cl',
    password: 'Taruca123!',
  },
  {
    label: 'UTP',
    role: 'UTP',
    token: 'utp-token',
    description: 'Gestión académica completa de institución',
    email: 'utp@taruca.cl',
    password: 'Taruca123!',
  },
  {
    label: 'Profesora Matemáticas',
    role: 'TEACHER',
    token: 'teacher-token',
    description: 'Acceso a asignaturas propias',
    email: 'teacher@taruca.cl',
    password: 'Taruca123!',
  },
  {
    label: 'Profesor Historia',
    role: 'TEACHER',
    token: 'teacher-other-token',
    description: 'Acceso a otra asignatura de docente',
    email: 'teacher-other@taruca.cl',
    password: 'Taruca123!',
  },
];

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  getAvailableProfiles(): MockUserProfile[] {
    return MOCK_USER_PROFILES;
  }

  getAuthToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  setAuthToken(token: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  clearAuthToken(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  loginWithToken(token: string): boolean {
    const profile = MOCK_USER_PROFILES.find((item) => item.token === token);
    if (!profile) {
      return false;
    }

    this.setAuthToken(profile.token);
    return true;
  }

  loginWithCredentials(email: string, password: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const profile = MOCK_USER_PROFILES.find(
      (item) =>
        item.email.toLowerCase() === normalizedEmail &&
        item.password === password,
    );

    if (!profile) {
      return false;
    }

    this.setAuthToken(profile.token);
    return true;
  }

  isAuthenticated(): boolean {
    return Boolean(this.getAuthToken());
  }

  getCurrentProfile(): MockUserProfile | null {
    const token = this.getAuthToken();
    if (!token) {
      return null;
    }

    return MOCK_USER_PROFILES.find((profile) => profile.token === token) ?? null;
  }

  getCurrentRole(): MockUserRole | null {
    return this.getCurrentProfile()?.role ?? null;
  }

  canManageAcademicPeriods(): boolean {
    const role = this.getCurrentRole();
    return role === 'DIRECTOR' || role === 'UTP';
  }

  canManageStudents(): boolean {
    const role = this.getCurrentRole();
    return role === 'DIRECTOR' || role === 'UTP';
  }

  canManageTeachers(): boolean {
    const role = this.getCurrentRole();
    return role === 'DIRECTOR' || role === 'UTP';
  }
}
