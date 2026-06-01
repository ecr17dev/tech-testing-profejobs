import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({
    description: 'Nombre completo del profesor',
    example: 'Camila Rojas',
    minLength: 1,
    maxLength: 120,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  fullName: string;

  @ApiProperty({
    description: 'Correo electrónico del profesor',
    example: 'camila.rojas@taruca.cl',
    maxLength: 160,
  })
  @IsEmail()
  @MaxLength(160)
  email: string;
}
