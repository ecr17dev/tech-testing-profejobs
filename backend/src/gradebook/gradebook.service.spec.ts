import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Course,
  Enrollment,
  Evaluation,
  Grade,
  Student,
  Subject,
} from '../database/entities';
import { GradebookService } from './gradebook.service';
import { UserRole } from '../common/enums/user-role.enum';

function createRepositoryMock() {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
  };
}

describe('GradebookService', () => {
  let service: GradebookService;
  const subjectsRepo = createRepositoryMock();
  const coursesRepo = createRepositoryMock();
  const evaluationsRepo = createRepositoryMock();
  const enrollmentsRepo = createRepositoryMock();
  const studentsRepo = createRepositoryMock();
  const gradesRepo = createRepositoryMock();

  const currentUser = {
    id: 'teacher-1',
    institutionId: 'inst-1',
    role: UserRole.TEACHER,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradebookService,
        { provide: getRepositoryToken(Subject), useValue: subjectsRepo },
        { provide: getRepositoryToken(Course), useValue: coursesRepo },
        { provide: getRepositoryToken(Evaluation), useValue: evaluationsRepo },
        { provide: getRepositoryToken(Enrollment), useValue: enrollmentsRepo },
        { provide: getRepositoryToken(Student), useValue: studentsRepo },
        { provide: getRepositoryToken(Grade), useValue: gradesRepo },
      ],
    }).compile();

    service = module.get<GradebookService>(GradebookService);

    subjectsRepo.findOne.mockResolvedValue({
      id: 'subject-1',
      teacherId: 'teacher-1',
      courseId: 'course-1',
      academicPeriodId: 'period-1',
      institutionId: 'inst-1',
      name: 'Matemáticas',
    } as Subject);

    coursesRepo.findOne.mockResolvedValue({
      id: 'course-1',
      name: '8vo A',
    } as Course);

    evaluationsRepo.find.mockResolvedValue([
      { id: 'eval-1', name: 'Prueba 1', displayOrder: 1 } as Evaluation,
      { id: 'eval-2', name: 'Control 1', displayOrder: 2 } as Evaluation,
    ]);
  });

  it('returns null average when a student has no grades', async () => {
    enrollmentsRepo.find.mockResolvedValue([
      { studentId: 'student-1' } as Enrollment,
    ]);
    studentsRepo.find.mockResolvedValue([
      { id: 'student-1', firstName: 'Ana', lastName: 'Pérez' } as Student,
    ]);
    gradesRepo.find.mockResolvedValue([]);

    const result = await service.getSubjectGradebook(
      'subject-1',
      'period-1',
      currentUser,
    );

    expect(result.students[0].average).toBeNull();
    expect(result.students[0].isBelowPassingGrade).toBe(false);
  });

  it('marks below passing grade when average is under 4.0', async () => {
    enrollmentsRepo.find.mockResolvedValue([
      { studentId: 'student-1' } as Enrollment,
    ]);
    studentsRepo.find.mockResolvedValue([
      { id: 'student-1', firstName: 'Juan', lastName: 'Soto' } as Student,
    ]);
    gradesRepo.find.mockResolvedValue([
      { id: 'g1', studentId: 'student-1', evaluationId: 'eval-1', score: 3.5 } as Grade,
      { id: 'g2', studentId: 'student-1', evaluationId: 'eval-2', score: 4.0 } as Grade,
    ]);

    const result = await service.getSubjectGradebook(
      'subject-1',
      'period-1',
      currentUser,
    );

    expect(result.students[0].average).toBeCloseTo(3.75);
    expect(result.students[0].averageRounded).toBe(3.8);
    expect(result.students[0].isBelowPassingGrade).toBe(true);
  });

  it('uses subject academic period when query param is omitted', async () => {
    enrollmentsRepo.find.mockResolvedValue([
      { studentId: 'student-1' } as Enrollment,
    ]);
    studentsRepo.find.mockResolvedValue([
      { id: 'student-1', firstName: 'Ana', lastName: 'Pérez' } as Student,
    ]);
    gradesRepo.find.mockResolvedValue([]);

    await service.getSubjectGradebook('subject-1', undefined, currentUser);

    expect(subjectsRepo.findOne).toHaveBeenCalledWith({
      where: {
        id: 'subject-1',
        institutionId: 'inst-1',
      },
    });
    expect(evaluationsRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          academicPeriodId: 'period-1',
        }),
      }),
    );
  });
});
