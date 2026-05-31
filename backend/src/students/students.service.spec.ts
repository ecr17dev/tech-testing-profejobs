import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Enrollment, Grade, Student } from '../database/entities';
import { StudentsService } from './students.service';
import { UserRole } from '../common/enums/user-role.enum';
import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';

describe('StudentsService', () => {
  let service: StudentsService;
  let studentsRepo: ReturnType<typeof createRepositoryMock>;
  let enrollmentsRepo: ReturnType<typeof createRepositoryMock>;
  let gradesRepo: ReturnType<typeof createRepositoryMock>;

  function createRepositoryMock() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
  }

  const directorUser = {
    id: 'director-1',
    institutionId: 'inst-1',
    role: UserRole.DIRECTOR,
  };

  const utpUser = {
    id: 'utp-1',
    institutionId: 'inst-1',
    role: UserRole.UTP,
  };

  const teacherUser = {
    id: 'teacher-1',
    institutionId: 'inst-1',
    role: UserRole.TEACHER,
  };

  const mockStudent: Student = {
    id: 'student-1',
    institutionId: 'inst-1',
    firstName: 'Benjamín',
    lastName: 'González',
    rut: '20123456-7',
    isActive: true,
  } as Student;

  beforeEach(async () => {
    studentsRepo = createRepositoryMock();
    enrollmentsRepo = createRepositoryMock();
    gradesRepo = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: getRepositoryToken(Student), useValue: studentsRepo },
        { provide: getRepositoryToken(Enrollment), useValue: enrollmentsRepo },
        { provide: getRepositoryToken(Grade), useValue: gradesRepo },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  describe('findAll', () => {
    it('returns all students for the institution', async () => {
      studentsRepo.find.mockResolvedValue([mockStudent]);

      const result = await service.findAll(directorUser);

      expect(result).toEqual([mockStudent]);
      expect(studentsRepo.find).toHaveBeenCalledWith({
        where: { institutionId: 'inst-1' },
        order: { lastName: 'ASC', firstName: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('returns a student by id', async () => {
      studentsRepo.findOne.mockResolvedValue(mockStudent);

      const result = await service.findOne('student-1', directorUser);

      expect(result).toEqual(mockStudent);
    });

    it('throws NotFoundException when student does not exist', async () => {
      studentsRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('nonexistent', directorUser),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create', () => {
    it('allows director to create a student', async () => {
      studentsRepo.create.mockReturnValue(mockStudent);
      studentsRepo.save.mockResolvedValue(mockStudent);

      const result = await service.create(
        { firstName: 'Benjamín', lastName: 'González' },
        directorUser,
      );

      expect(result).toEqual(mockStudent);
    });

    it('allows UTP to create a student', async () => {
      studentsRepo.create.mockReturnValue(mockStudent);
      studentsRepo.save.mockResolvedValue(mockStudent);

      const result = await service.create(
        { firstName: 'Benjamín', lastName: 'González' },
        utpUser,
      );

      expect(result).toEqual(mockStudent);
    });

    it('rejects teacher from creating a student', async () => {
      await expect(
        service.create(
          { firstName: 'Benjamín', lastName: 'González' },
          teacherUser,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('update', () => {
    it('updates an existing student', async () => {
      studentsRepo.findOne.mockResolvedValue(mockStudent);
      studentsRepo.save.mockResolvedValue({
        ...mockStudent,
        firstName: 'Benja',
      });

      const result = await service.update(
        'student-1',
        { firstName: 'Benja' },
        directorUser,
      );

      expect(result.firstName).toBe('Benja');
      expect(studentsRepo.save).toHaveBeenCalled();
    });

    it('rejects teacher from updating', async () => {
      await expect(
        service.update('student-1', { firstName: 'X' }, teacherUser),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('remove (soft delete)', () => {
    it('deactivates a student', async () => {
      studentsRepo.findOne.mockResolvedValue(mockStudent);
      studentsRepo.save.mockResolvedValue({ ...mockStudent, isActive: false });

      await service.remove('student-1', directorUser);

      expect(studentsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });

    it('rejects deactivation of already inactive student', async () => {
      studentsRepo.findOne.mockResolvedValue({ ...mockStudent, isActive: false });

      await expect(
        service.remove('student-1', directorUser),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects teacher from deactivating', async () => {
      await expect(
        service.remove('student-1', teacherUser),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('reactivate', () => {
    it('reactivates an inactive student', async () => {
      const inactiveStudent = { ...mockStudent, isActive: false };
      studentsRepo.findOne.mockResolvedValue(inactiveStudent);
      studentsRepo.save.mockResolvedValue({ ...mockStudent, isActive: true });

      const result = await service.reactivate('student-1', directorUser);

      expect(result.isActive).toBe(true);
    });

    it('rejects reactivation of already active student', async () => {
      studentsRepo.findOne.mockResolvedValue({ ...mockStudent, isActive: true });

      await expect(
        service.reactivate('student-1', directorUser),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects teacher from reactivating', async () => {
      await expect(
        service.reactivate('student-1', teacherUser),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
