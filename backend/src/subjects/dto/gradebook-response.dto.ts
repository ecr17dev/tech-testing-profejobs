import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class GradebookEvaluationDto {
  @ApiProperty({ example: '80eaffa1-7f09-4d04-bb5d-ff76af236efd' })
  id: string;

  @ApiProperty({ example: 'Prueba 1' })
  name: string;

  @ApiPropertyOptional({ example: 'Primera prueba del semestre' })
  description?: string;

  @ApiProperty({ example: 1 })
  order: number;
}

class StudentGradeDto {
  @ApiProperty({ example: '57dda54e-1cf4-4051-b132-45a9e1d6cad0' })
  id: string;

  @ApiProperty({ example: '80eaffa1-7f09-4d04-bb5d-ff76af236efd' })
  evaluationId: string;

  @ApiProperty({ example: 6.0, minimum: 1, maximum: 7 })
  score: number;
}

class GradebookStudentDto {
  @ApiProperty({ example: 'b27339e1-3d6d-4db4-ad35-f065bec715d6' })
  id: string;

  @ApiProperty({ example: 'Ana Pérez' })
  fullName: string;

  @ApiProperty({ type: [StudentGradeDto] })
  grades: StudentGradeDto[];

  @ApiProperty({ example: 5.9, nullable: true })
  average: number | null;

  @ApiProperty({ example: 5.9, nullable: true })
  averageRounded: number | null;

  @ApiProperty({ example: false, description: 'Indica si el promedio es menor a 4.0 (nota mínima de aprobación)' })
  isBelowPassingGrade: boolean;
}

class GradebookSubjectDto {
  @ApiProperty({ example: 'ef906d29-6875-4f59-99ce-941e0b3eb2ab' })
  id: string;

  @ApiProperty({ example: 'Matemáticas' })
  name: string;

  @ApiProperty()
  course: { id: string; name: string };

  @ApiProperty()
  academicPeriod: { id: string };
}

export class GradebookResponseDto {
  @ApiProperty({ type: GradebookSubjectDto })
  subject: GradebookSubjectDto;

  @ApiProperty({ type: [GradebookEvaluationDto] })
  evaluations: GradebookEvaluationDto[];

  @ApiProperty({ type: [GradebookStudentDto] })
  students: GradebookStudentDto[];
}