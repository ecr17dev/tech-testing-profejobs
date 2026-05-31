import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  Enrollment,
  Evaluation,
  Grade,
  Student,
  Subject,
  Course,
} from '../database/entities';
import { CurrentUser } from '../common/auth/current-user.interface';
import { UserRole } from '../common/enums/user-role.enum';
import { calculateAverage, roundToOneDecimal } from '../common/utils/average.util';

@Injectable()
export class GradebookService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectsRepository: Repository<Subject>,
    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,
    @InjectRepository(Evaluation)
    private readonly evaluationsRepository: Repository<Evaluation>,
    @InjectRepository(Enrollment)
    private readonly enrollmentsRepository: Repository<Enrollment>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Grade)
    private readonly gradesRepository: Repository<Grade>,
  ) {}

  async getSubjectGradebook(
    subjectId: string,
    academicPeriodId: string | undefined,
    currentUser: CurrentUser,
  ) {
    const subjectWhere: {
      id: string;
      institutionId: string;
      academicPeriodId?: string;
    } = {
      id: subjectId,
      institutionId: currentUser.institutionId,
    };

    if (academicPeriodId) {
      subjectWhere.academicPeriodId = academicPeriodId;
    }

    const subject = await this.subjectsRepository.findOne({
      where: subjectWhere,
    });

    if (!subject) {
      throw new NotFoundException('Asignatura no encontrada');
    }

    if (
      currentUser.role === UserRole.TEACHER &&
      subject.teacherId !== currentUser.id
    ) {
      throw new ForbiddenException('Solo puedes ver tus asignaturas');
    }

    const resolvedAcademicPeriodId = academicPeriodId ?? subject.academicPeriodId;

    const [course, evaluations, enrollments] = await Promise.all([
      this.coursesRepository.findOne({
        where: { id: subject.courseId, institutionId: currentUser.institutionId },
      }),
      this.evaluationsRepository.find({
        where: {
          institutionId: currentUser.institutionId,
          subjectId: subject.id,
          academicPeriodId: resolvedAcademicPeriodId,
        },
        order: { displayOrder: 'ASC' },
      }),
      this.enrollmentsRepository.find({
        where: {
          institutionId: currentUser.institutionId,
          courseId: subject.courseId,
          academicPeriodId: resolvedAcademicPeriodId,
        },
      }),
    ]);

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    const studentIds = enrollments.map((enrollment) => enrollment.studentId);

    const students = studentIds.length
      ? await this.studentsRepository.find({
          where: studentIds.map((id) => ({
            id,
            institutionId: currentUser.institutionId,
          })),
          order: { lastName: 'ASC', firstName: 'ASC' },
        })
      : [];

    const evaluationIds = evaluations.map((evaluation) => evaluation.id);

    const grades = evaluationIds.length
      ? await this.gradesRepository.find({
          where: {
            institutionId: currentUser.institutionId,
            evaluationId: In(evaluationIds),
          },
        })
      : [];
    const filteredGrades = grades;

    const gradesByStudent = new Map<string, Grade[]>();
    for (const grade of filteredGrades) {
      const current = gradesByStudent.get(grade.studentId) ?? [];
      current.push(grade);
      gradesByStudent.set(grade.studentId, current);
    }

    return {
      subject: {
        id: subject.id,
        name: subject.name,
        course: {
          id: course.id,
          name: course.name,
        },
        academicPeriod: {
          id: resolvedAcademicPeriodId,
        },
      },
      evaluations: evaluations.map((evaluation) => ({
        id: evaluation.id,
        name: evaluation.name,
        description: evaluation.description,
        order: evaluation.displayOrder,
      })),
      students: students.map((student) => {
        const studentGrades = gradesByStudent.get(student.id) ?? [];
        const numericScores = studentGrades.map((grade) => Number(grade.score));
        const average = calculateAverage(numericScores);

        return {
          id: student.id,
          fullName: `${student.firstName} ${student.lastName}`,
          grades: studentGrades.map((grade) => ({
            id: grade.id,
            evaluationId: grade.evaluationId,
            score: Number(grade.score),
          })),
          average,
          averageRounded: average === null ? null : roundToOneDecimal(average),
          isBelowPassingGrade: average !== null && average < 4.0,
        };
      }),
    };
  }
}
