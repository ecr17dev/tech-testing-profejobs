import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  AcademicPeriod,
  Enrollment,
  Evaluation,
  Grade,
  Student,
  Subject,
} from '../database/entities';
import { GradesService } from './grades.service';
import { UserRole } from '../common/enums/user-role.enum';
import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';

function createRepositoryMock() {
  return {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
    delete: jest.fn(),
  };
}

describe('GradesService', () => {
  let service: GradesService;
  const gradesRepo = createRepositoryMock();
  const evaluationsRepo = createRepositoryMock();
  const subjectsRepo = createRepositoryMock();
  const periodsRepo = createRepositoryMock();
  const enrollmentsRepo = createRepositoryMock();
  const studentsRepo = createRepositoryMock();

  const currentUser = {
    id: 'teacher-1',
    institutionId: 'inst-1',
    role: UserRole.TEACHER,
  };

  const evaluation: Evaluation = {
    id: 'eval-1',
    institutionId: 'inst-1',
    subjectId: 'subject-1',
    academicPeriodId: 'period-1',
    name: 'Prueba 1',
    description: null,
    displayOrder: 1,
  } as Evaluation;

  const subject: Subject = {
    id: 'subject-1',
    institutionId: 'inst-1',
    teacherId: 'teacher-1',
    courseId: 'course-1',
    academicPeriodId: 'period-1',
    name: 'Matemáticas',
  } as Subject;

  const openPeriod: AcademicPeriod = {
    id: 'period-1',
    institutionId: 'inst-1',
    name: 'Semestre 1',
    year: 2026,
    isOpen: true,
  } as AcademicPeriod;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradesService,
        { provide: getRepositoryToken(Grade), useValue: gradesRepo },
        { provide: getRepositoryToken(Evaluation), useValue: evaluationsRepo },
        { provide: getRepositoryToken(Subject), useValue: subjectsRepo },
        { provide: getRepositoryToken(AcademicPeriod), useValue: periodsRepo },
        { provide: getRepositoryToken(Enrollment), useValue: enrollmentsRepo },
        { provide: getRepositoryToken(Student), useValue: studentsRepo },
      ],
    }).compile();

    service = module.get<GradesService>(GradesService);

    evaluationsRepo.findOne.mockResolvedValue(evaluation);
    subjectsRepo.findOne.mockResolvedValue(subject);
    periodsRepo.findOne.mockResolvedValue(openPeriod);
    studentsRepo.findOne.mockResolvedValue({ id: 'student-1' } as Student);
    enrollmentsRepo.findOne.mockResolvedValue({ id: 'enrollment-1' } as Enrollment);
  });

  it('creates a valid grade', async () => {
    gradesRepo.findOne.mockResolvedValueOnce(null);
    gradesRepo.create.mockReturnValue({
      institutionId: 'inst-1',
      studentId: 'student-1',
      evaluationId: 'eval-1',
      score: 6.1,
    });
    gradesRepo.save.mockResolvedValue({ id: 'grade-1' });

    const result = await service.create(
      { studentId: 'student-1', evaluationId: 'eval-1', score: 6.1 },
      currentUser,
    );

    expect(result).toEqual({ id: 'grade-1' });
    expect(gradesRepo.save).toHaveBeenCalled();
  });

  it('rejects score below range', async () => {
    await expect(
      service.create(
        { studentId: 'student-1', evaluationId: 'eval-1', score: 0.9 },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects score above range', async () => {
    await expect(
      service.create(
        { studentId: 'student-1', evaluationId: 'eval-1', score: 7.1 },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects duplicate grade per student and evaluation', async () => {
    gradesRepo.findOne.mockResolvedValueOnce({ id: 'existing-grade' });

    await expect(
      service.create(
        { studentId: 'student-1', evaluationId: 'eval-1', score: 5.0 },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects when academic period is closed', async () => {
    periodsRepo.findOne.mockResolvedValue({ ...openPeriod, isOpen: false });

    await expect(
      service.create(
        { studentId: 'student-1', evaluationId: 'eval-1', score: 5.0 },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects teacher without subject permission', async () => {
    subjectsRepo.findOne.mockResolvedValue({ ...subject, teacherId: 'another-teacher' });

    await expect(
      service.create(
        { studentId: 'student-1', evaluationId: 'eval-1', score: 5.0 },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
