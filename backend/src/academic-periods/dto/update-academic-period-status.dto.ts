import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateAcademicPeriodStatusDto {
  @ApiProperty({
    description: 'Estado del período académico (true = abierto para modificaciones, false = cerrado)',
    example: false,
  })
  @IsBoolean()
  isOpen: boolean;
}
