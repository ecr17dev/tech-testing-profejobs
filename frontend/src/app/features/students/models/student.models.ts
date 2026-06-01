export interface Student {
  id: string;
  institutionId: string;
  firstName: string;
  lastName: string;
  rut: string | null;
  isActive: boolean;
}

export interface CreateStudentPayload {
  firstName: string;
  lastName: string;
  rut?: string;
  isActive?: boolean;
}

export interface UpdateStudentPayload {
  firstName?: string;
  lastName?: string;
  rut?: string;
  isActive?: boolean;
}

export interface StudentListResponse {
  data: Student[];
}
