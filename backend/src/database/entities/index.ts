import { AcademicPeriod } from './academic-period.entity';
import { Course } from './course.entity';
import { Enrollment } from './enrollment.entity';
import { Evaluation } from './evaluation.entity';
import { Grade } from './grade.entity';
import { Institution } from './institution.entity';
import { Student } from './student.entity';
import { Subject } from './subject.entity';
import { User } from './user.entity';

export const ALL_ENTITIES = [
  Institution,
  User,
  AcademicPeriod,
  Course,
  Student,
  Enrollment,
  Subject,
  Evaluation,
  Grade,
];

export {
  Institution,
  User,
  AcademicPeriod,
  Course,
  Student,
  Enrollment,
  Subject,
  Evaluation,
  Grade,
};
