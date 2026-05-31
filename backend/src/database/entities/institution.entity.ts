import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'institutions' })
export class Institution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;
}
