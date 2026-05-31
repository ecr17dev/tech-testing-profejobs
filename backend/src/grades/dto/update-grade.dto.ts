import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class UpdateGradeDto {
  @ApiProperty({
    description: 'Nueva nota numérica (escala chilena de 1.0 a 7.0)',
    minimum: 1,
    maximum: 7,
    example: 5.5,
  })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(7)
  score: number;
}
