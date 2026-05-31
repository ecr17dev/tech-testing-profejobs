import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Enrollment,
  Evaluation,
  Grade,
  Subject,
  AcademicPeriod,
  Student,
} from '../database/entities';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { CurrentUser } from '../common/auth/current-user.interface';
import { UserRole } from '../common/enums/user-role.enum';

interface EvaluationContext {
  evaluation: Evaluation;
  subject: Subject;
  period: AcademicPeriod;
}

interface GradeContext {
  grade: Grade;
  evaluation: Evaluation;
  subject: Subject;
  period: AcademicPeriod;
}

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradesRepository: Repository<Grade>,
    @InjectRepository(Evaluation)
    private readonly evaluationsRepository: Repository<Evaluation>,
    @InjectRepository(Subject)
    private readonly subjectsRepository: Repository<Subject>,
    @InjectRepository(AcademicPeriod)
    private readonly periodsRepository: Repository<AcademicPeriod>,
    @InjectRepository(Enrollment)
    private readonly enrollmentsRepository: Repository<Enrollment>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async create(dto: CreateGradeDto, currentUser: CurrentUser): Promise<Grade> {
    this.assertScoreRange(dto.score);

    const { evaluation, subject, period } = await this.getEvaluationContext(
      dto.evaluationId,
      currentUser,
    );

    this.assertWriteAccess(subject, period, currentUser);

    await this.assertStudentIsValidForSubject(
      dto.studentId,
      subject,
      currentUser,
    );

    const duplicate = await this.gradesRepository.findOne({
      where: {
        institutionId: currentUser.institutionId,
        studentId: dto.studentId,
        evaluationId: dto.evaluationId,
      },
    });

    if (duplicate) {
      throw new ConflictException(
        'Ya existe una calificación para este alumno y evaluación',
      );
    }

    const grade = this.gradesRepository.create({
      institutionId: currentUser.institutionId,
      studentId: dto.studentId,
      evaluationId: evaluation.id,
      score: dto.score,
    });

    return this.gradesRepository.save(grade);
  }

  async findAll(currentUser: CurrentUser): Promise<Grade[]> {
    const qb = this.gradesRepository
      .createQueryBuilder('grade')
      .innerJoinAndSelect('grade.evaluation', 'evaluation')
      .innerJoinAndSelect('evaluation.subject', 'subject')
      .where('grade.institution_id = :institutionId', {
        institutionId: currentUser.institutionId,
      })
      .orderBy('subject.name', 'ASC')
      .addOrderBy('evaluation.display_order', 'ASC');

    if (currentUser.role === UserRole.TEACHER) {
      qb.andWhere('subject.teacher_id = :teacherId', { teacherId: currentUser.id });
    }

    return qb.getMany();
  }

  async findOne(id: string, currentUser: CurrentUser): Promise<Grade> {
    const context = await this.getGradeContext(id, currentUser);
    this.assertReadAccess(context.subject, currentUser);
    return context.grade;
  }

  async update(
    id: string,
    dto: UpdateGradeDto,
    currentUser: CurrentUser,
  ): Promise<Grade> {
    this.assertScoreRange(dto.score);

    const context = await this.getGradeContext(id, currentUser);
    this.assertWriteAccess(context.subject, context.period, currentUser);
    context.grade.score = dto.score;
    return this.gradesRepository.save(context.grade);
  }

  async remove(id: string, currentUser: CurrentUser): Promise<void> {
    const context = await this.getGradeContext(id, currentUser);
    this.assertWriteAccess(context.subject, context.period, currentUser);
    await this.gradesRepository.delete({
      id: context.grade.id,
      institutionId: currentUser.institutionId,
    });
  }

  async getStudentGradesInSubject(
    subjectId: string,
    studentId: string,
    currentUser: CurrentUser,
  ) {
    const subject = await this.subjectsRepository.findOne({
      where: { id: subjectId, institutionId: currentUser.institutionId },
      relations: { academicPeriod: true },
    });

    if (!subject) {
      throw new NotFoundException('Asignatura no encontrada');
    }

    this.assertReadAccess(subject, currentUser);

    await this.assertStudentIsValidForSubject(studentId, subject, currentUser);

    const evaluations = await this.evaluationsRepository.find({
      where: {
        subjectId: subject.id,
        institutionId: currentUser.institutionId,
      },
      order: { displayOrder: 'ASC' },
    });

    const grades = await this.gradesRepository.find({
      where: {
        institutionId: currentUser.institutionId,
        studentId,
      },
    });

    const gradesByEvaluation = new Map(grades.map((grade) => [grade.evaluationId, grade]));

    return {
      subject: {
        id: subject.id,
        name: subject.name,
      },
      studentId,
      grades: evaluations
        .map((evaluation) => {
          const grade = gradesByEvaluation.get(evaluation.id);
          return {
            evaluationId: evaluation.id,
            evaluationName: evaluation.name,
            score: grade ? Number(grade.score) : null,
            gradeId: grade?.id ?? null,
          };
        })
        .filter((row) => row.score !== null),
    };
  }

  private async getEvaluationContext(
    evaluationId: string,
    currentUser: CurrentUser,
  ): Promise<EvaluationContext> {
    const evaluation = await this.evaluationsRepository.findOne({
      where: { id: evaluationId, institutionId: currentUser.institutionId },
    });

    if (!evaluation) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    const subject = await this.subjectsRepository.findOne({
      where: {
        id: evaluation.subjectId,
        institutionId: currentUser.institutionId,
      },
    });

    if (!subject) {
      throw new NotFoundException('Asignatura no encontrada');
    }

    const period = await this.periodsRepository.findOne({
      where: {
        id: evaluation.academicPeriodId,
        institutionId: currentUser.institutionId,
      },
    });

    if (!period) {
      throw new NotFoundException('Período académico no encontrado');
    }

    return { evaluation, subject, period };
  }

  private async getGradeContext(
    gradeId: string,
    currentUser: CurrentUser,
  ): Promise<GradeContext> {
    const grade = await this.gradesRepository.findOne({
      where: { id: gradeId, institutionId: currentUser.institutionId },
    });

    if (!grade) {
      throw new NotFoundException('Calificación no encontrada');
    }

    const { evaluation, subject, period } = await this.getEvaluationContext(
      grade.evaluationId,
      currentUser,
    );

    return { grade, evaluation, subject, period };
  }

  private assertReadAccess(subject: Subject, currentUser: CurrentUser): void {
    if (
      currentUser.role === UserRole.TEACHER &&
      subject.teacherId !== currentUser.id
    ) {
      throw new ForbiddenException('Solo puedes gestionar tus asignaturas');
    }
  }

  private assertWriteAccess(
    subject: Subject,
    period: AcademicPeriod,
    currentUser: CurrentUser,
  ): void {
    this.assertReadAccess(subject, currentUser);

    if (!period.isOpen) {
      throw new ForbiddenException(
        'El período académico está cerrado para modificaciones',
      );
    }
  }

  private async assertStudentIsValidForSubject(
    studentId: string,
    subject: Subject,
    currentUser: CurrentUser,
  ): Promise<void> {
    const student = await this.studentsRepository.findOne({
      where: { id: studentId, institutionId: currentUser.institutionId },
    });

    if (!student) {
      throw new NotFoundException('Alumno no encontrado');
    }

    const enrollment = await this.enrollmentsRepository.findOne({
      where: {
        institutionId: currentUser.institutionId,
        studentId,
        courseId: subject.courseId,
        academicPeriodId: subject.academicPeriodId,
      },
    });

    if (!enrollment) {
      throw new BadRequestException(
        'El alumno no está inscrito en el curso de la asignatura',
      );
    }
  }

  private assertScoreRange(score: number): void {
    if (score < 1 || score > 7) {
      throw new BadRequestException('La nota debe estar entre 1.0 y 7.0');
    }
  }
}
