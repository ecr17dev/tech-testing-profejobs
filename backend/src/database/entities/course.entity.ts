import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Institution } from './institution.entity';

@Entity({ name: 'courses' })
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'institution_id', type: 'uuid' })
  institutionId: string;

  @ManyToOne(() => Institution, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

  @Column({ type: 'varchar', length: 120 })
  name: string;
}
