import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class GradeEvaluationSubject {
  @ApiProperty({ example: 'ef906d29-6875-4f59-99ce-941e0b3eb2ab' })
  id: string;

  @ApiProperty({ example: 'Matemáticas' })
  name: string;
}

class GradeEvaluation {
  @ApiProperty({ example: '80eaffa1-7f09-4d04-bb5d-ff76af236efd' })
  id: string;

  @ApiProperty({ example: 'Prueba 1' })
  name: string;

  @ApiProperty()
  subject: GradeEvaluationSubject;
}

export class GradeResponseDto {
  @ApiProperty({ example: '57dda54e-1cf4-4051-b132-45a9e1d6cad0' })
  id: string;

  @ApiProperty({ example: '2e0993d7-59cf-43fc-b40b-1af2aeffc710' })
  institutionId: string;

  @ApiProperty({ example: 'b27339e1-3d6d-4db4-ad35-f065bec715d6' })
  studentId: string;

  @ApiProperty({ example: '80eaffa1-7f09-4d04-bb5d-ff76af236efd' })
  evaluationId: string;

  @ApiProperty({ example: 6.1, minimum: 1, maximum: 7 })
  score: number;

  @ApiPropertyOptional()
  evaluation?: GradeEvaluation;
}