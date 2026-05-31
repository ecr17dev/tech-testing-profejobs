import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { CurrentUserDecorator } from '../common/auth/current-user.decorator';
import { Roles } from '../common/auth/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { CurrentUser } from '../common/auth/current-user.interface';

@ApiTags('Students')
@ApiBearerAuth('mock-jwt')
@ApiUnauthorizedResponse({ description: 'Token de autenticación faltante o inválido' })
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los alumnos de la institución' })
  @ApiOkResponse({
    description: 'Lista de alumnos ordenados por apellido y nombre',
    type: [StudentResponseDto],
  })
  findAll(@CurrentUserDecorator() currentUser: CurrentUser) {
    return this.studentsService.findAll(currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un alumno por ID' })
  @ApiOkResponse({ description: 'Alumno encontrado', type: StudentResponseDto })
  @ApiNotFoundResponse({ description: 'Alumno no encontrado' })
  findOne(
    @Param('id') id: string,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    return this.studentsService.findOne(id, currentUser);
  }

  @Post()
  @Roles(UserRole.DIRECTOR, UserRole.UTP)
  @ApiOperation({ summary: 'Crear un nuevo alumno (solo DIRECTOR y UTP)' })
  @ApiCreatedResponse({
    description: 'Alumno creado exitosamente',
    type: StudentResponseDto,
  })
  @ApiForbiddenResponse({ description: 'No tienes permisos para gestionar alumnos' })
  create(
    @Body() dto: CreateStudentDto,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    return this.studentsService.create(dto, currentUser);
  }

  @Patch(':id')
  @Roles(UserRole.DIRECTOR, UserRole.UTP)
  @ApiOperation({ summary: 'Actualizar datos de un alumno (solo DIRECTOR y UTP)' })
  @ApiOkResponse({ description: 'Alumno actualizado', type: StudentResponseDto })
  @ApiNotFoundResponse({ description: 'Alumno no encontrado' })
  @ApiForbiddenResponse({ description: 'No tienes permisos para gestionar alumnos' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    return this.studentsService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.DIRECTOR, UserRole.UTP)
  @ApiOperation({ summary: 'Desactivar un alumno (soft delete, solo DIRECTOR y UTP)' })
  @ApiNoContentResponse({ description: 'Alumno desactivado exitosamente' })
  @ApiNotFoundResponse({ description: 'Alumno no encontrado' })
  @ApiConflictResponse({ description: 'El alumno ya se encuentra inactivo' })
  @ApiForbiddenResponse({ description: 'No tienes permisos para gestionar alumnos' })
  async remove(
    @Param('id') id: string,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    await this.studentsService.remove(id, currentUser);
  }

  @Patch(':id/reactivate')
  @Roles(UserRole.DIRECTOR, UserRole.UTP)
  @ApiOperation({ summary: 'Reactivar un alumno inactivo (solo DIRECTOR y UTP)' })
  @ApiOkResponse({ description: 'Alumno reactivado', type: StudentResponseDto })
  @ApiNotFoundResponse({ description: 'Alumno no encontrado' })
  @ApiConflictResponse({ description: 'El alumno ya se encuentra activo' })
  @ApiForbiddenResponse({ description: 'No tienes permisos para gestionar alumnos' })
  reactivate(
    @Param('id') id: string,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    return this.studentsService.reactivate(id, currentUser);
  }
}
