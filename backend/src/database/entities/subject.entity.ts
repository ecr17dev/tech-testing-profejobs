import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Institution } from './institution.entity';
import { Course } from './course.entity';
import { AcademicPeriod } from './academic-period.entity';
import { User } from './user.entity';

@Entity({ name: 'subjects' })
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'institution_id', type: 'uuid' })
  institutionId: string;

  @ManyToOne(() => Institution, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

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

  @Column({ name: 'teacher_id', type: 'uuid' })
  teacherId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({ type: 'varchar', length: 120 })
  name: string;
}
