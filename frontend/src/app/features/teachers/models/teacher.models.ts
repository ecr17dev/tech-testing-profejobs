export interface Teacher {
  id: string;
  institutionId: string;
  fullName: string;
  email: string;
  role: 'TEACHER';
}

export interface CreateTeacherPayload {
  fullName: string;
  email: string;
}

export interface UpdateTeacherPayload {
  fullName?: string;
  email?: string;
}
