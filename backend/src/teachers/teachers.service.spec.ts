import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../database/entities';
import { TeachersService } from './teachers.service';

function createRepositoryMock() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
}

describe('TeachersService', () => {
  let service: TeachersService;
  const usersRepo = createRepositoryMock();

  const directorUser = {
    id: 'director-1',
    institutionId: 'inst-1',
    role: UserRole.DIRECTOR,
  };

  const teacherUser = {
    id: 'teacher-1',
    institutionId: 'inst-1',
    role: UserRole.TEACHER,
  };

  const mockTeacher: User = {
    id: 'teacher-2',
    institutionId: 'inst-1',
    fullName: 'Camila Rojas',
    email: 'camila@taruca.cl',
    role: UserRole.TEACHER,
  } as User;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        { provide: getRepositoryToken(User), useValue: usersRepo },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
    usersRepo.create.mockImplementation((payload: unknown) => payload as User);
    usersRepo.save.mockImplementation(async (payload: User) => payload);
    usersRepo.findOne.mockResolvedValue(mockTeacher);
  });

  it('lists teachers from institution', async () => {
    usersRepo.find.mockResolvedValue([mockTeacher]);

    const result = await service.findAll(directorUser);

    expect(result).toEqual([mockTeacher]);
    expect(usersRepo.find).toHaveBeenCalledWith({
      where: { institutionId: 'inst-1', role: UserRole.TEACHER },
      order: { fullName: 'ASC' },
    });
  });

  it('creates teacher as director', async () => {
    usersRepo.findOne.mockResolvedValueOnce(null);
    usersRepo.save.mockResolvedValue({
      ...mockTeacher,
      fullName: 'Ana Pérez',
      email: 'ana@taruca.cl',
    });

    const result = await service.create(
      { fullName: ' Ana Pérez ', email: 'ANA@TARUCA.CL' },
      directorUser,
    );

    expect(result.email).toBe('ana@taruca.cl');
    expect(usersRepo.create).toHaveBeenCalledWith({
      institutionId: 'inst-1',
      fullName: 'Ana Pérez',
      email: 'ana@taruca.cl',
      role: UserRole.TEACHER,
    });
  });

  it('rejects teacher role creating a teacher', async () => {
    await expect(
      service.create(
        { fullName: 'Ana Pérez', email: 'ana@taruca.cl' },
        teacherUser,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects duplicate email on create', async () => {
    usersRepo.findOne.mockResolvedValueOnce({
      id: 'existing-user',
      email: 'ana@taruca.cl',
    });

    await expect(
      service.create(
        { fullName: 'Ana Pérez', email: 'ana@taruca.cl' },
        directorUser,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updates teacher', async () => {
    usersRepo.findOne
      .mockResolvedValueOnce(mockTeacher)
      .mockResolvedValueOnce(null);
    usersRepo.save.mockResolvedValue({
      ...mockTeacher,
      fullName: 'Camila Reyes',
      email: 'camila.reyes@taruca.cl',
    });

    const result = await service.update(
      mockTeacher.id,
      { fullName: 'Camila Reyes', email: 'camila.reyes@taruca.cl' },
      directorUser,
    );

    expect(result.fullName).toBe('Camila Reyes');
    expect(result.email).toBe('camila.reyes@taruca.cl');
  });

  it('throws not found when teacher does not exist', async () => {
    usersRepo.findOne.mockResolvedValue(null);

    await expect(
      service.findOne('teacher-missing', directorUser),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes teacher', async () => {
    usersRepo.findOne.mockResolvedValue(mockTeacher);
    usersRepo.delete.mockResolvedValue({ affected: 1 });

    await service.remove(mockTeacher.id, directorUser);

    expect(usersRepo.delete).toHaveBeenCalledWith({
      id: mockTeacher.id,
      institutionId: 'inst-1',
      role: UserRole.TEACHER,
    });
  });
});
