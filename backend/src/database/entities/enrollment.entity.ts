import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Institution } from './institution.entity';
import { Student } from './student.entity';
import { Course } from './course.entity';
import { AcademicPeriod } from './academic-period.entity';

@Entity({ name: 'enrollments' })
@Index('idx_enrollment_student_period', ['studentId', 'academicPeriodId'], {
  unique: true,
})
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'institution_id', type: 'uuid' })
  institutionId: string;

  @ManyToOne(() => Institution, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @ManyToOne(() => Course, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'academic_period_id', type: 'uuid' })
  academicPeriodId: string;

  @ManyToOne(() => AcademicPeriod, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'academic_period_id' })
  academicPeriod: AcademicPeriod;
}
