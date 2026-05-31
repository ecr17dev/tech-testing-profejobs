import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AcademicPeriod,
  Enrollment,
  Evaluation,
  Grade,
  Student,
  Subject,
} from '../database/entities';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Grade,
      Evaluation,
      Subject,
      AcademicPeriod,
      Enrollment,
      Student,
    ]),
  ],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}
