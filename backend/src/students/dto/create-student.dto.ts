import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({
    description: 'Nombre del alumno',
    example: 'Benjamín',
    minLength: 1,
    maxLength: 80,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName: string;

  @ApiProperty({
    description: 'Apellido del alumno',
    example: 'González',
    minLength: 1,
    maxLength: 80,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName: string;

  @ApiPropertyOptional({
    description: 'RUT chileno del alumno (formato: 12345678-9)',
    example: '12345678-9',
    minLength: 9,
    maxLength: 12,
  })
  @IsOptional()
  @IsString()
  @Length(9, 12)
  @Matches(/^\d{7,8}-[\dkK]$/, {
    message: 'El RUT debe tener formato chileno válido (ej: 12345678-9)',
  })
  rut?: string;

  @ApiPropertyOptional({
    description: 'Estado activo del alumno',
    example: true,
    default: true,
  })
  @IsOptional()
  isActive?: boolean;
}
