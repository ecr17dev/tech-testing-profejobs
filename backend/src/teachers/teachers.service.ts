import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrentUser } from '../common/auth/current-user.interface';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../database/entities';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(currentUser: CurrentUser): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        institutionId: currentUser.institutionId,
        role: UserRole.TEACHER,
      },
      order: { fullName: 'ASC' },
    });
  }

  async findOne(id: string, currentUser: CurrentUser): Promise<User> {
    const teacher = await this.usersRepository.findOne({
      where: {
        id,
        institutionId: currentUser.institutionId,
        role: UserRole.TEACHER,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
    }

    return teacher;
  }

  async create(dto: CreateTeacherDto, currentUser: CurrentUser): Promise<User> {
    this.assertWriteAccess(currentUser);

    const normalizedEmail = dto.email.trim().toLowerCase();
    const existingByEmail = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingByEmail) {
      throw new ConflictException(
        'Ya existe un usuario con este correo electrónico',
      );
    }

    const teacher = this.usersRepository.create({
      institutionId: currentUser.institutionId,
      fullName: dto.fullName.trim(),
      email: normalizedEmail,
      role: UserRole.TEACHER,
    });

    return this.usersRepository.save(teacher);
  }

  async update(
    id: string,
    dto: UpdateTeacherDto,
    currentUser: CurrentUser,
  ): Promise<User> {
    this.assertWriteAccess(currentUser);

    const teacher = await this.findOne(id, currentUser);

    if (dto.fullName !== undefined) {
      teacher.fullName = dto.fullName.trim();
    }

    if (dto.email !== undefined) {
      const normalizedEmail = dto.email.trim().toLowerCase();
      const existingByEmail = await this.usersRepository.findOne({
        where: { email: normalizedEmail },
      });

      if (existingByEmail && existingByEmail.id !== teacher.id) {
        throw new ConflictException(
          'Ya existe un usuario con este correo electrónico',
        );
      }

      teacher.email = normalizedEmail;
    }

    return this.usersRepository.save(teacher);
  }

  async remove(id: string, currentUser: CurrentUser): Promise<void> {
    this.assertWriteAccess(currentUser);
    const teacher = await this.findOne(id, currentUser);

    try {
      await this.usersRepository.delete({
        id: teacher.id,
        institutionId: currentUser.institutionId,
        role: UserRole.TEACHER,
      });
    } catch (error: unknown) {
      if (
        typeof (error as { message?: unknown })?.message === 'string' &&
        (error as { message: string }).message.includes(
          'FOREIGN KEY constraint failed',
        )
      ) {
        throw new ConflictException(
          'No se puede eliminar el profesor porque tiene asignaturas asociadas',
        );
      }

      throw error;
    }
  }

  private assertWriteAccess(currentUser: CurrentUser): void {
    if (currentUser.role === UserRole.TEACHER) {
      throw new ForbiddenException(
        'Solo el Director y UTP pueden gestionar profesores',
      );
    }
  }
}
