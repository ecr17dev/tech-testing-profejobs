import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentResponseDto {
  @ApiProperty({ description: 'ID único del alumno', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'ID de la institución', format: 'uuid' })
  institutionId: string;

  @ApiProperty({ description: 'Nombre del alumno', example: 'Benjamín' })
  firstName: string;

  @ApiProperty({ description: 'Apellido del alumno', example: 'González' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'RUT chileno del alumno',
    example: '12345678-9',
  })
  rut: string | null;

  @ApiProperty({ description: 'Estado activo del alumno', example: true })
  isActive: boolean;
}
