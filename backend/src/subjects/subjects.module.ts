import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AcademicPeriod,
  Course,
  Enrollment,
  Evaluation,
  Grade,
  Student,
  Subject,
} from '../database/entities';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { GradebookService } from '../gradebook/gradebook.service';
import { GradesModule } from '../grades/grades.module';

@Module({
  imports: [
    GradesModule,
    TypeOrmModule.forFeature([
      Subject,
      Course,
      AcademicPeriod,
      Evaluation,
      Enrollment,
      Student,
      Grade,
    ]),
  ],
  controllers: [SubjectsController],
  providers: [SubjectsService, GradebookService],
  exports: [SubjectsService],
})
export class SubjectsModule {}
