import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicPeriod, Evaluation, Subject } from '../database/entities';
import { CurrentUser } from '../common/auth/current-user.interface';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectsRepository: Repository<Subject>,
    @InjectRepository(Evaluation)
    private readonly evaluationsRepository: Repository<Evaluation>,
    @InjectRepository(AcademicPeriod)
    private readonly periodsRepository: Repository<AcademicPeriod>,
  ) {}

  async findVisibleSubjects(currentUser: CurrentUser) {
    const qb = this.subjectsRepository
      .createQueryBuilder('subject')
      .leftJoinAndSelect('subject.course', 'course')
      .leftJoinAndSelect('subject.academicPeriod', 'period')
      .where('subject.institution_id = :institutionId', {
        institutionId: currentUser.institutionId,
      })
      .orderBy('subject.name', 'ASC');

    if (currentUser.role === UserRole.TEACHER) {
      qb.andWhere('subject.teacher_id = :teacherId', { teacherId: currentUser.id });
    }

    const subjects = await qb.getMany();

    return subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      course: {
        id: subject.course?.id,
        name: subject.course?.name,
      },
      academicPeriod: {
        id: subject.academicPeriod?.id,
        name: subject.academicPeriod?.name,
        year: subject.academicPeriod?.year,
        isOpen: subject.academicPeriod?.isOpen,
      },
    }));
  }

  async assertSubjectReadableByUser(
    subjectId: string,
    currentUser: CurrentUser,
  ): Promise<Subject> {
    const subject = await this.subjectsRepository.findOne({
      where: { id: subjectId, institutionId: currentUser.institutionId },
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

    return subject;
  }

  async createEvaluation(
    subjectId: string,
    dto: CreateEvaluationDto,
    currentUser: CurrentUser,
  ) {
    const subject = await this.subjectsRepository.findOne({
      where: { id: subjectId, institutionId: currentUser.institutionId },
    });

    if (!subject) {
      throw new NotFoundException('Asignatura no encontrada');
    }

    if (
      currentUser.role === UserRole.TEACHER &&
      subject.teacherId !== currentUser.id
    ) {
      throw new ForbiddenException('Solo puedes gestionar tus asignaturas');
    }

    const period = await this.periodsRepository.findOne({
      where: {
        id: subject.academicPeriodId,
        institutionId: currentUser.institutionId,
      },
    });

    if (!period) {
      throw new NotFoundException('Período académico no encontrado');
    }

    if (!period.isOpen) {
      throw new ForbiddenException(
        'El período académico está cerrado para modificaciones',
      );
    }

    const orderResult = await this.evaluationsRepository
      .createQueryBuilder('evaluation')
      .select('COALESCE(MAX(evaluation.display_order), 0)', 'max')
      .where('evaluation.institution_id = :institutionId', {
        institutionId: currentUser.institutionId,
      })
      .andWhere('evaluation.subject_id = :subjectId', { subjectId })
      .andWhere('evaluation.academic_period_id = :academicPeriodId', {
        academicPeriodId: subject.academicPeriodId,
      })
      .getRawOne<{ max: number | string | null }>();

    const nextDisplayOrder = Number(orderResult?.max ?? 0) + 1;

    const evaluation = this.evaluationsRepository.create({
      institutionId: currentUser.institutionId,
      subjectId: subject.id,
      academicPeriodId: subject.academicPeriodId,
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      displayOrder: nextDisplayOrder,
    });

    try {
      const saved = await this.evaluationsRepository.save(evaluation);
      return {
        id: saved.id,
        name: saved.name,
        description: saved.description,
        order: saved.displayOrder,
      };
    } catch (error: unknown) {
      if (
        typeof (error as { message?: unknown })?.message === 'string' &&
        (error as { message: string }).message.includes(
          'UNIQUE constraint failed',
        )
      ) {
        throw new ConflictException(
          'Ya existe una evaluación con este nombre en la asignatura',
        );
      }

      throw error;
    }
  }
}
