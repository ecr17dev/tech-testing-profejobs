import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Institution } from './institution.entity';
import { Student } from './student.entity';
import { Evaluation } from './evaluation.entity';

@Entity({ name: 'grades' })
@Check('chk_grade_score_range', 'score >= 1.0 AND score <= 7.0')
@Index('idx_grades_student_evaluation', ['studentId', 'evaluationId'], {
  unique: true,
})
export class Grade {
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

  @Column({ name: 'evaluation_id', type: 'uuid' })
  evaluationId: string;

  @ManyToOne(() => Evaluation, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;

  @Column({ type: 'numeric', precision: 3, scale: 1 })
  score: number;
}
