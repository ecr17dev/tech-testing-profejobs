import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStudentFields1710000000001 implements MigrationInterface {
  name = 'AddStudentFields1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('PRAGMA foreign_keys = ON;');

    await queryRunner.query(`
      ALTER TABLE students ADD COLUMN rut varchar(12);
    `);

    await queryRunner.query(`
      ALTER TABLE students ADD COLUMN is_active boolean NOT NULL DEFAULT 1;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('PRAGMA foreign_keys = ON;');

    await queryRunner.query(`
      ALTER TABLE students DROP COLUMN rut;
    `);

    await queryRunner.query(`
      ALTER TABLE students DROP COLUMN is_active;
    `);
  }
}
