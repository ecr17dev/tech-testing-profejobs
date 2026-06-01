export interface AcademicPeriod {
  id: string;
  name: string;
  year: number;
  isOpen: boolean;
}

export interface SubjectSummary {
  id: string;
  name: string;
  course: {
    id: string;
    name: string;
  };
  academicPeriod: AcademicPeriod;
}

export interface EvaluationSummary {
  id: string;
  name: string;
  description?: string | null;
  order: number;
}

export interface GradeCell {
  id: string;
  evaluationId: string;
  score: number;
}

export interface GradeMutationResponse extends GradeCell {
  studentId: string;
}

export interface GradebookStudentRow {
  id: string;
  fullName: string;
  grades: GradeCell[];
  average: number | null;
  averageRounded: number | null;
  isBelowPassingGrade: boolean;
}

export interface GradebookResponse {
  subject: {
    id: string;
    name: string;
    course: {
      id: string;
      name: string;
    };
    academicPeriod: {
      id: string;
    };
  };
  evaluations: EvaluationSummary[];
  students: GradebookStudentRow[];
}

export interface CreateGradePayload {
  studentId: string;
  evaluationId: string;
  score: number;
}

export interface UpdateGradePayload {
  score: number;
}

export interface CreateEvaluationPayload {
  name: string;
  description?: string;
}

export interface EvaluationMutationResponse {
  id: string;
  name: string;
  description: string | null;
  order: number;
}

export interface StudentGradesResponse {
  subject: {
    id: string;
    name: string;
  };
  studentId: string;
  grades: Array<{
    evaluationId: string;
    evaluationName: string;
    score: number;
    gradeId: string;
  }>;
}
