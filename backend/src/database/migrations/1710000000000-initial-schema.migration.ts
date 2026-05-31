import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('PRAGMA foreign_keys = ON;');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS institutions (
        id varchar PRIMARY KEY NOT NULL,
        name varchar(120) NOT NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id varchar PRIMARY KEY NOT NULL,
        institution_id varchar NOT NULL,
        full_name varchar(120) NOT NULL,
        email varchar(160) NOT NULL,
        role varchar(20) NOT NULL,
        CONSTRAINT fk_users_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE RESTRICT
      );
    `);
    await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS academic_periods (
        id varchar PRIMARY KEY NOT NULL,
        institution_id varchar NOT NULL,
        name varchar(120) NOT NULL,
        year integer NOT NULL,
        is_open boolean NOT NULL DEFAULT 1,
        created_at datetime NOT NULL DEFAULT (datetime('now')),
        updated_at datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT fk_periods_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE RESTRICT
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id varchar PRIMARY KEY NOT NULL,
        institution_id varchar NOT NULL,
        name varchar(120) NOT NULL,
        CONSTRAINT fk_courses_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE RESTRICT
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS students (
        id varchar PRIMARY KEY NOT NULL,
        institution_id varchar NOT NULL,
        first_name varchar(80) NOT NULL,
        last_name varchar(80) NOT NULL,
        CONSTRAINT fk_students_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE RESTRICT
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id varchar PRIMARY KEY NOT NULL,
        institution_id varchar NOT NULL,
        student_id varchar NOT NULL,
        course_id varchar NOT NULL,
        academic_period_id varchar NOT NULL,
        CONSTRAINT fk_enrollments_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE RESTRICT,
        CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
        CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
        CONSTRAINT fk_enrollments_period FOREIGN KEY (academic_period_id) REFERENCES academic_periods(id) ON DELETE RESTRICT
      );
    `);
    await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollment_student_period ON enrollments(student_id, academic_period_id);');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id varchar PRIMARY KEY NOT NULL,
        institution_id varchar NOT NULL,
        course_id varchar NOT NULL,
        academic_period_id varchar NOT NULL,
        teacher_id varchar NOT NULL,
        name varchar(120) NOT NULL,
        CONSTRAINT fk_subjects_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE RESTRICT,
        CONSTRAINT fk_subjects_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
        CONSTRAINT fk_subjects_period FOREIGN KEY (academic_period_id) REFERENCES academic_periods(id) ON DELETE RESTRICT,
        CONSTRAINT fk_subjects_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE RESTRICT
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS evaluations (
        id varchar PRIMARY KEY NOT NULL,
        institution_id varchar NOT NULL,
        subject_id varchar NOT NULL,
        academic_period_id varchar NOT NULL,
        name varchar(120) NOT NULL,
        description varchar(255),
        display_order integer NOT NULL DEFAULT 1,
        CONSTRAINT fk_evaluations_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE RESTRICT,
        CONSTRAINT fk_evaluations_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
        CONSTRAINT fk_evaluations_period FOREIGN KEY (academic_period_id) REFERENCES academic_periods(id) ON DELETE RESTRICT
      );
    `);
    await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_evaluations_subject_period_name ON evaluations(subject_id, academic_period_id, name);');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id varchar PRIMARY KEY NOT NULL,
        institution_id varchar NOT NULL,
        student_id varchar NOT NULL,
        evaluation_id varchar NOT NULL,
        score numeric NOT NULL CHECK(score >= 1.0 AND score <= 7.0),
        CONSTRAINT fk_grades_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE RESTRICT,
        CONSTRAINT fk_grades_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
        CONSTRAINT fk_grades_evaluation FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE RESTRICT
      );
    `);
    await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_grades_student_evaluation ON grades(student_id, evaluation_id);');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS grades;');
    await queryRunner.query('DROP TABLE IF EXISTS evaluations;');
    await queryRunner.query('DROP TABLE IF EXISTS subjects;');
    await queryRunner.query('DROP TABLE IF EXISTS enrollments;');
    await queryRunner.query('DROP TABLE IF EXISTS students;');
    await queryRunner.query('DROP TABLE IF EXISTS courses;');
    await queryRunner.query('DROP TABLE IF EXISTS academic_periods;');
    await queryRunner.query('DROP TABLE IF EXISTS users;');
    await queryRunner.query('DROP TABLE IF EXISTS institutions;');
  }
}
