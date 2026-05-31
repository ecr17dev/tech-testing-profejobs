import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  AcademicPeriod,
  Course,
  Enrollment,
  Evaluation,
  Grade,
  Institution,
  Student,
  Subject,
  User,
} from '../entities';
import { DEMO_IDS } from './constants';
import { UserRole } from '../../common/enums/user-role.enum';

interface StudentSeed {
  id: string;
  firstName: string;
  lastName: string;
  rut: string | null;
  isActive: boolean;
  grades: { evaluationId: string; score: number | null }[];
}

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    const shouldSeed = (process.env.SEED_ON_BOOTSTRAP ?? 'true') === 'true';
    if (!shouldSeed) {
      return;
    }

    const institutionRepo = this.dataSource.getRepository(Institution);
    const existing = await institutionRepo.count();
    if (existing > 0) {
      return;
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.insert(Institution, {
        id: DEMO_IDS.institution,
        name: 'Colegio Taruca Demo',
      });

      await manager.insert(User, [
        {
          id: DEMO_IDS.director,
          institutionId: DEMO_IDS.institution,
          fullName: 'Daniela Directora',
          email: 'director@taruca.cl',
          role: UserRole.DIRECTOR,
        },
        {
          id: DEMO_IDS.utp,
          institutionId: DEMO_IDS.institution,
          fullName: 'Ulises UTP',
          email: 'utp@taruca.cl',
          role: UserRole.UTP,
        },
        {
          id: DEMO_IDS.teacher,
          institutionId: DEMO_IDS.institution,
          fullName: 'Tamara Profesora',
          email: 'teacher@taruca.cl',
          role: UserRole.TEACHER,
        },
        {
          id: DEMO_IDS.teacherOther,
          institutionId: DEMO_IDS.institution,
          fullName: 'Pablo Profesor',
          email: 'teacher-other@taruca.cl',
          role: UserRole.TEACHER,
        },
      ]);

      await manager.insert(AcademicPeriod, {
        id: DEMO_IDS.period2026,
        institutionId: DEMO_IDS.institution,
        name: 'Primer Semestre',
        year: 2026,
        isOpen: true,
      });

      await manager.insert(Course, {
        id: DEMO_IDS.courseA,
        institutionId: DEMO_IDS.institution,
        name: '8vo Básico A',
      });

      // --- 35 students with realistic Chilean names ---
      const students = this.generateStudents();
      const studentEntities = students.map((s) => ({
        id: s.id,
        institutionId: DEMO_IDS.institution,
        firstName: s.firstName,
        lastName: s.lastName,
        rut: s.rut,
        isActive: s.isActive,
      }));

      await manager.insert(Student, studentEntities);

      const enrollmentEntities = students
        .filter((s) => s.isActive)
        .map((s) => ({
          id: randomUUID(),
          institutionId: DEMO_IDS.institution,
          studentId: s.id,
          courseId: DEMO_IDS.courseA,
          academicPeriodId: DEMO_IDS.period2026,
        }));

      await manager.insert(Enrollment, enrollmentEntities);

      await manager.insert(Subject, [
        {
          id: DEMO_IDS.subjectMath,
          institutionId: DEMO_IDS.institution,
          courseId: DEMO_IDS.courseA,
          academicPeriodId: DEMO_IDS.period2026,
          teacherId: DEMO_IDS.teacher,
          name: 'Matemáticas',
        },
        {
          id: DEMO_IDS.subjectHistory,
          institutionId: DEMO_IDS.institution,
          courseId: DEMO_IDS.courseA,
          academicPeriodId: DEMO_IDS.period2026,
          teacherId: DEMO_IDS.teacherOther,
          name: 'Historia',
        },
      ]);

      await manager.insert(Evaluation, [
        {
          id: DEMO_IDS.eval1,
          institutionId: DEMO_IDS.institution,
          subjectId: DEMO_IDS.subjectMath,
          academicPeriodId: DEMO_IDS.period2026,
          name: 'Prueba 1',
          description: 'Números enteros',
          displayOrder: 1,
        },
        {
          id: DEMO_IDS.eval2,
          institutionId: DEMO_IDS.institution,
          subjectId: DEMO_IDS.subjectMath,
          academicPeriodId: DEMO_IDS.period2026,
          name: 'Control 1',
          description: 'Fracciones',
          displayOrder: 2,
        },
        {
          id: DEMO_IDS.eval3,
          institutionId: DEMO_IDS.institution,
          subjectId: DEMO_IDS.subjectMath,
          academicPeriodId: DEMO_IDS.period2026,
          name: 'Trabajo práctico',
          description: 'Proyecto de aula',
          displayOrder: 3,
        },
      ]);

      // --- Generate grades for active students ---
      const gradeEntities: {
        id: string;
        institutionId: string;
        studentId: string;
        evaluationId: string;
        score: number;
      }[] = [];

      for (const student of students) {
        if (!student.isActive) {
          continue;
        }

        for (const gradeSeed of student.grades) {
          if (gradeSeed.score === null) {
            continue;
          }

          gradeEntities.push({
          id: randomUUID(),
            institutionId: DEMO_IDS.institution,
            studentId: student.id,
            evaluationId: gradeSeed.evaluationId,
            score: gradeSeed.score,
          });
        }
      }

      if (gradeEntities.length > 0) {
        await manager.insert(Grade, gradeEntities);
      }
    });

    this.logger.log('Seed demo cargado correctamente (35 alumnos, ~90 calificaciones)');
  }

  private generateStudents(): StudentSeed[] {
    const names: { firstName: string; lastName: string; rut: string | null }[] = [
      { firstName: 'Benjamín', lastName: 'González', rut: '20123456-7' },
      { firstName: 'Martina', lastName: 'Muñoz', rut: '20234567-8' },
      { firstName: 'Agustín', lastName: 'Rojas', rut: '20345678-9' },
      { firstName: 'Isidora', lastName: 'Díaz', rut: '20456789-0' },
      { firstName: 'Vicente', lastName: 'Morales', rut: '20567890-1' },
      { firstName: 'Josefa', lastName: 'Soto', rut: '20678901-2' },
      { firstName: 'Maximiliano', lastName: 'Contreras', rut: '20789012-3' },
      { firstName: 'Antonella', lastName: 'Sepúlveda', rut: '20890123-4' },
      { firstName: 'Cristóbal', lastName: 'Fuentes', rut: '20901234-5' },
      { firstName: 'Emilia', lastName: 'Araya', rut: '21012345-6' },
      { firstName: 'Joaquín', lastName: 'Carrasco', rut: '21123456-7' },
      { firstName: 'Fernanda', lastName: 'Vargas', rut: '21234567-8' },
      { firstName: 'Martín', lastName: 'Hernández', rut: '21345678-9' },
      { firstName: 'Renata', lastName: 'Lagos', rut: '21456789-0' },
      { firstName: 'Lucas', lastName: 'Pizarro', rut: '21567890-1' },
      { firstName: 'Sofía', lastName: 'Castro', rut: '21678901-2' },
      { firstName: 'Tomás', lastName: 'Ortiz', rut: '21789012-3' },
      { firstName: 'Catalina', lastName: 'Reyes', rut: '21890123-4' },
      { firstName: 'Diego', lastName: 'Campos', rut: '21901234-5' },
      { firstName: 'Valentina', lastName: 'Gutiérrez', rut: '22012345-6' },
      { firstName: 'Matías', lastName: 'Silva', rut: '22123456-7' },
      { firstName: 'Isabella', lastName: 'Flores', rut: '22234567-8' },
      { firstName: 'Nicolás', lastName: 'Peña', rut: '22345678-9' },
      { firstName: 'Amanda', lastName: 'Jara', rut: '22456789-0' },
      { firstName: 'Felipe', lastName: 'Alvarado', rut: '22567890-1' },
      { firstName: 'Florencia', lastName: 'Pérez', rut: '22678901-2' },
      { firstName: 'Sebastián', lastName: 'Tapia', rut: '22789012-3' },
      { firstName: 'Daniela', lastName: 'Cortés', rut: '22890123-4' },
      { firstName: 'Gabriel', lastName: 'Miranda', rut: '22901234-5' },
      { firstName: 'Constanza', lastName: 'Espinoza', rut: '23012345-6' },
      { firstName: 'Mateo', lastName: 'Núñez', rut: '23123456-7' },
      { firstName: 'Javiera', lastName: 'Sanhueza', rut: '23234567-8' },
      { firstName: 'Ignacio', lastName: 'Vergara', rut: '23345678-9' },
      { firstName: 'Paz', lastName: 'Rivas', rut: '23456789-0' },
      { firstName: 'Andrés', lastName: 'León', rut: '23567890-1' },
    ];

    const studentIds: string[] = [
      'a1010001-0001-4000-8000-000000000001',
      'a1010001-0001-4000-8000-000000000002',
      'a1010001-0001-4000-8000-000000000003',
      'a1010001-0001-4000-8000-000000000004',
      'a1010001-0001-4000-8000-000000000005',
      'a1010001-0001-4000-8000-000000000006',
      'a1010001-0001-4000-8000-000000000007',
      'a1010001-0001-4000-8000-000000000008',
      'a1010001-0001-4000-8000-000000000009',
      'a1010001-0001-4000-8000-000000000010',
      'a1010001-0001-4000-8000-000000000011',
      'a1010001-0001-4000-8000-000000000012',
      'a1010001-0001-4000-8000-000000000013',
      'a1010001-0001-4000-8000-000000000014',
      'a1010001-0001-4000-8000-000000000015',
      'a1010001-0001-4000-8000-000000000016',
      'a1010001-0001-4000-8000-000000000017',
      'a1010001-0001-4000-8000-000000000018',
      'a1010001-0001-4000-8000-000000000019',
      'a1010001-0001-4000-8000-000000000020',
      'a1010001-0001-4000-8000-000000000021',
      'a1010001-0001-4000-8000-000000000022',
      'a1010001-0001-4000-8000-000000000023',
      'a1010001-0001-4000-8000-000000000024',
      'a1010001-0001-4000-8000-000000000025',
      'a1010001-0001-4000-8000-000000000026',
      'a1010001-0001-4000-8000-000000000027',
      'a1010001-0001-4000-8000-000000000028',
      'a1010001-0001-4000-8000-000000000029',
      'a1010001-0001-4000-8000-000000000030',
      'a1010001-0001-4000-8000-000000000031',
      'a1010001-0001-4000-8000-000000000032',
      'a1010001-0001-4000-8000-000000000033',
      'a1010001-0001-4000-8000-000000000034',
      'a1010001-0001-4000-8000-000000000035',
    ];

    // Grade distribution across evaluaciones for realism
    // Group 1 (0-6): top students — all grades 6.2–7.0
    // Group 2 (7-16): good students — grades 5.0–6.5
    // Group 3 (17-26): average students — grades 4.0–5.5
    // Group 4 (27-31): struggling — grades 2.5–4.0
    // Group 5 (32-34): missing grades — partial nulls (edge cases)

    const gradePresets: (number | null)[][] = [
      [6.5, 6.8, 7.0], // 0
      [6.8, 6.5, 6.3], // 1
      [7.0, 6.0, 6.5], // 2
      [6.3, 6.7, 7.0], // 3
      [6.0, 6.2, 6.8], // 4
      [5.5, 6.0, 5.8], // 5
      [5.8, 5.5, 6.2], // 6
      [6.0, 5.0, 5.5], // 7 — good
      [5.5, 6.0, 5.0], // 8
      [5.0, 5.8, 6.0], // 9
      [5.2, 5.5, 5.0], // 10
      [6.5, 5.0, 5.5], // 11
      [5.0, 5.2, 5.8], // 12
      [5.3, 5.0, 6.0], // 13
      [6.0, 5.0, 5.0], // 14
      [5.5, 5.5, 5.5], // 15
      [4.5, 5.0, 5.5], // 16
      [5.0, 4.5, 4.0], // 17
      [4.0, 4.5, 5.0], // 18 — average
      [5.5, 4.0, 4.0], // 19
      [4.5, 4.0, 5.0], // 20
      [4.0, 5.0, 4.5], // 21
      [5.0, 4.0, 4.0], // 22
      [4.0, 4.0, 4.5], // 23
      [4.5, 4.5, 4.0], // 24
      [4.0, 4.0, 4.0], // 25
      [3.5, 4.0, 3.0], // 26
      [3.0, 2.5, 3.5], // 27
      [4.0, 3.0, 2.5], // 28 — struggling
      [3.5, 3.0, 4.0], // 29
      [2.5, 3.0, 3.5], // 30
      [null, 3.0, 2.5], // 31 — missing some grades
      [3.5, null, 2.0], // 32
      [null, null, 4.0], // 33 — mostly missing
    ];

    const inactiveIndices = new Set([33, 34]); // Students 34-35 are inactive (soft deleted demo)

    return names.map((name, index) => {
      const preset = gradePresets[index] ?? [null, null, null];
      const isActive = !inactiveIndices.has(index);

      return {
        id: studentIds[index],
        firstName: name.firstName,
        lastName: name.lastName,
        rut: name.rut,
        isActive,
        grades: [
          { evaluationId: DEMO_IDS.eval1, score: preset[0] },
          { evaluationId: DEMO_IDS.eval2, score: preset[1] },
          { evaluationId: DEMO_IDS.eval3, score: preset[2] },
        ],
      };
    });
  }
}
