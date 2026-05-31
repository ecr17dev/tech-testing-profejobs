import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AcademicPeriod, Evaluation, Subject } from '../database/entities';
import { SubjectsService } from './subjects.service';
import { UserRole } from '../common/enums/user-role.enum';

function createRepositoryMock() {
  return {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
}

describe('SubjectsService', () => {
  let service: SubjectsService;
  const subjectsRepo = createRepositoryMock();
  const evaluationsRepo = createRepositoryMock();
  const periodsRepo = createRepositoryMock();

  const currentTeacher = {
    id: 'teacher-1',
    institutionId: 'inst-1',
    role: UserRole.TEACHER,
  };

  const subject: Subject = {
    id: 'subject-1',
    institutionId: 'inst-1',
    courseId: 'course-1',
    academicPeriodId: 'period-1',
    teacherId: 'teacher-1',
    name: 'Matemáticas',
  } as Subject;

  const periodOpen: AcademicPeriod = {
    id: 'period-1',
    institutionId: 'inst-1',
    name: 'Primer Semestre',
    year: 2026,
    isOpen: true,
  } as AcademicPeriod;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        { provide: getRepositoryToken(Subject), useValue: subjectsRepo },
        { provide: getRepositoryToken(Evaluation), useValue: evaluationsRepo },
        {
          provide: getRepositoryToken(AcademicPeriod),
          useValue: periodsRepo,
        },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);

    subjectsRepo.findOne.mockResolvedValue(subject);
    periodsRepo.findOne.mockResolvedValue(periodOpen);
    evaluationsRepo.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ max: 2 }),
    });
    evaluationsRepo.create.mockImplementation(
      (payload: unknown) => payload as Evaluation,
    );
    evaluationsRepo.save.mockImplementation(
      async (payload: Evaluation) =>
        ({
          ...payload,
          id: 'eval-new',
        }) as Evaluation,
    );
  });

  it('creates evaluation with next display order', async () => {
    const result = await service.createEvaluation(
      'subject-1',
      { name: ' Prueba 2 ', description: ' Unidad 2 ' },
      currentTeacher,
    );

    expect(evaluationsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Prueba 2',
        description: 'Unidad 2',
        displayOrder: 3,
      }),
    );
    expect(result).toEqual({
      id: 'eval-new',
      name: 'Prueba 2',
      description: 'Unidad 2',
      order: 3,
    });
  });

  it('rejects teacher without permission', async () => {
    subjectsRepo.findOne.mockResolvedValue({
      ...subject,
      teacherId: 'teacher-other',
    });

    await expect(
      service.createEvaluation(
        'subject-1',
        { name: 'Prueba 2' },
        currentTeacher,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects when period is closed', async () => {
    periodsRepo.findOne.mockResolvedValue({ ...periodOpen, isOpen: false });

    await expect(
      service.createEvaluation(
        'subject-1',
        { name: 'Prueba 2' },
        currentTeacher,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects duplicate evaluation name', async () => {
    evaluationsRepo.save.mockRejectedValue(
      new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed'),
    );

    await expect(
      service.createEvaluation(
        'subject-1',
        { name: 'Prueba 1' },
        currentTeacher,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects when subject does not exist', async () => {
    subjectsRepo.findOne.mockResolvedValue(null);

    await expect(
      service.createEvaluation(
        'subject-missing',
        { name: 'Prueba 2' },
        currentTeacher,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
