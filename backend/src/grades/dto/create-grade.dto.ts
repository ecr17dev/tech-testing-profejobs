import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class CreateGradeDto {
  @ApiProperty({
    description: 'ID del alumno',
    example: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    format: 'uuid',
  })
  @IsUUID()
  studentId: string;

  @ApiProperty({
    description: 'ID de la evaluación',
    example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    format: 'uuid',
  })
  @IsUUID()
  evaluationId: string;

  @ApiProperty({
    description: 'Nota numérica (escala chilena de 1.0 a 7.0)',
    minimum: 1,
    maximum: 7,
    example: 6.1,
  })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(7)
  score: number;
}
