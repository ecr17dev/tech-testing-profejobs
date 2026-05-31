import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EvaluationResponseDto {
  @ApiProperty({ example: '80eaffa1-7f09-4d04-bb5d-ff76af236efd' })
  id: string;

  @ApiProperty({ example: 'Prueba 2' })
  name: string;

  @ApiPropertyOptional({ example: 'Unidad de ecuaciones lineales' })
  description: string | null;

  @ApiProperty({ example: 4 })
  order: number;
}
