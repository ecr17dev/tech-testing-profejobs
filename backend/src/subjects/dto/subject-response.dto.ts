import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SubjectCourseDto {
  @ApiProperty({ example: 'a1ca8c18-91b1-4c91-bc22-c0f4068e0d24' })
  id: string;

  @ApiProperty({ example: '8vo Básico A' })
  name: string;
}

class SubjectAcademicPeriodDto {
  @ApiProperty({ example: 'fe6ae407-c88e-4812-ac74-36f0b5e8f3f9' })
  id: string;

  @ApiProperty({ example: 'Primer Semestre 2026' })
  name: string;

  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ example: true })
  isOpen: boolean;
}

export class SubjectResponseDto {
  @ApiProperty({ example: 'ef906d29-6875-4f59-99ce-941e0b3eb2ab' })
  id: string;

  @ApiProperty({ example: 'Matemáticas' })
  name: string;

  @ApiPropertyOptional({ type: SubjectCourseDto })
  course?: SubjectCourseDto;

  @ApiPropertyOptional({ type: SubjectAcademicPeriodDto })
  academicPeriod?: SubjectAcademicPeriodDto;
}