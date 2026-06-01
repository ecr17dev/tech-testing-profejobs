import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

export class TeacherResponseDto {
  @ApiProperty({ description: 'ID único del profesor', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'ID de la institución', format: 'uuid' })
  institutionId: string;

  @ApiProperty({
    description: 'Nombre completo del profesor',
    example: 'Camila Rojas',
  })
  fullName: string;

  @ApiProperty({
    description: 'Correo electrónico del profesor',
    example: 'camila.rojas@taruca.cl',
  })
  email: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    example: UserRole.TEACHER,
  })
  role: UserRole;
}
