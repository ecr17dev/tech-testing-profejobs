import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Enrollment, Grade, Student } from '../database/entities';
import { CurrentUser } from '../common/auth/current-user.interface';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Enrollment)
    private readonly enrollmentsRepository: Repository<Enrollment>,
    @InjectRepository(Grade)
    private readonly gradesRepository: Repository<Grade>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(currentUser: CurrentUser): Promise<Student[]> {
    return this.studentsRepository.find({
      where: { institutionId: currentUser.institutionId },
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findOne(id: string, currentUser: CurrentUser): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { id, institutionId: currentUser.institutionId },
    });

    if (!student) {
      throw new NotFoundException('Alumno no encontrado');
    }

    return student;
  }

  async create(dto: CreateStudentDto, currentUser: CurrentUser): Promise<Student> {
    this.assertWriteAccess(currentUser);

    const student = this.studentsRepository.create({
      institutionId: currentUser.institutionId,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      rut: dto.rut?.trim() ?? null,
      isActive: dto.isActive ?? true,
    });

    return this.studentsRepository.save(student);
  }

  async update(
    id: string,
    dto: UpdateStudentDto,
    currentUser: CurrentUser,
  ): Promise<Student> {
    this.assertWriteAccess(currentUser);

    const student = await this.findOne(id, currentUser);

    if (dto.firstName !== undefined) {
      student.firstName = dto.firstName.trim();
    }

    if (dto.lastName !== undefined) {
      student.lastName = dto.lastName.trim();
    }

    if (dto.rut !== undefined) {
      student.rut = dto.rut?.trim() ?? null;
    }

    if (dto.isActive !== undefined) {
      student.isActive = dto.isActive;
    }

    return this.studentsRepository.save(student);
  }

  async remove(id: string, currentUser: CurrentUser): Promise<void> {
    this.assertWriteAccess(currentUser);

    const student = await this.findOne(id, currentUser);

    if (!student.isActive) {
      throw new ConflictException('El alumno ya se encuentra inactivo');
    }

    student.isActive = false;
    await this.studentsRepository.save(student);
  }

  async reactivate(id: string, currentUser: CurrentUser): Promise<Student> {
    this.assertWriteAccess(currentUser);

    const student = await this.studentsRepository.findOne({
      where: { id, institutionId: currentUser.institutionId },
    });

    if (!student) {
      throw new NotFoundException('Alumno no encontrado');
    }

    if (student.isActive) {
      throw new ConflictException('El alumno ya se encuentra activo');
    }

    student.isActive = true;
    return this.studentsRepository.save(student);
  }

  private assertWriteAccess(currentUser: CurrentUser): void {
    if (currentUser.role === UserRole.TEACHER) {
      throw new ForbiddenException(
        'Solo el Director y UTP pueden gestionar alumnos',
      );
    }
  }
}
