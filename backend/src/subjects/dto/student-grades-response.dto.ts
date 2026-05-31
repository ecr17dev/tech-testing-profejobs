import { ApiProperty } from '@nestjs/swagger';

class StudentGradeItemDto {
  @ApiProperty({ example: '80eaffa1-7f09-4d04-bb5d-ff76af236efd' })
  evaluationId: string;

  @ApiProperty({ example: 'Prueba 1' })
  evaluationName: string;

  @ApiProperty({ example: 6.0, minimum: 1, maximum: 7 })
  score: number | null;

  @ApiProperty({ example: '57dda54e-1cf4-4051-b132-45a9e1d6cad0' })
  gradeId: string | null;
}

class StudentGradesSubjectDto {
  @ApiProperty({ example: 'ef906d29-6875-4f59-99ce-941e0b3eb2ab' })
  id: string;

  @ApiProperty({ example: 'Matemáticas' })
  name: string;
}

export class StudentGradesResponseDto {
  @ApiProperty({ type: StudentGradesSubjectDto })
  subject: StudentGradesSubjectDto;

  @ApiProperty({ example: 'b27339e1-3d6d-4db4-ad35-f065bec715d6' })
  studentId: string;

  @ApiProperty({ type: [StudentGradeItemDto] })
  grades: StudentGradeItemDto[];
}