import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Institution } from './institution.entity';
import { Subject } from './subject.entity';
import { AcademicPeriod } from './academic-period.entity';

@Entity({ name: 'evaluations' })
@Index('idx_evaluations_subject_period_name', ['subjectId', 'academicPeriodId', 'name'], {
  unique: true,
})
export class Evaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'institution_id', type: 'uuid' })
  institutionId: string;

  @ManyToOne(() => Institution, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

  @Column({ name: 'subject_id', type: 'uuid' })
  subjectId: string;

  @ManyToOne(() => Subject, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ name: 'academic_period_id', type: 'uuid' })
  academicPeriodId: string;

  @ManyToOne(() => AcademicPeriod, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'academic_period_id' })
  academicPeriod: AcademicPeriod;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ name: 'display_order', type: 'int', default: 1 })
  displayOrder: number;
}
