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
import { Roles } from '../common/auth/roles.decorator';
import { CurrentUserDecorator } from '../common/auth/current-user.decorator';
import type { CurrentUser } from '../common/auth/current-user.interface';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { TeacherResponseDto } from './dto/teacher-response.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersService } from './teachers.service';

@ApiTags('Teachers')
@ApiBearerAuth('mock-jwt')
@ApiUnauthorizedResponse({ description: 'Token de autenticación faltante o inválido' })
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @Roles(UserRole.DIRECTOR, UserRole.UTP)
  @ApiOperation({ summary: 'Listar todos los profesores de la institución' })
  @ApiOkResponse({
    description: 'Lista de profesores ordenados por nombre',
    type: [TeacherResponseDto],
  })
  @ApiForbiddenResponse({ description: 'No tienes permisos para gestionar profesores' })
  findAll(@CurrentUserDecorator() currentUser: CurrentUser) {
    return this.teachersService.findAll(currentUser);
  }

  @Get(':id')
  @Roles(UserRole.DIRECTOR, UserRole.UTP)
  @ApiOperation({ summary: 'Obtener un profesor por ID' })
  @ApiOkResponse({ description: 'Profesor encontrado', type: TeacherResponseDto })
  @ApiNotFoundResponse({ description: 'Profesor no encontrado' })
  @ApiForbiddenResponse({ description: 'No tienes permisos para gestionar profesores' })
  findOne(
    @Param('id') id: string,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    return this.teachersService.findOne(id, currentUser);
  }

  @Post()
  @Roles(UserRole.DIRECTOR, UserRole.UTP)
  @ApiOperation({ summary: 'Crear un nuevo profesor (solo DIRECTOR y UTP)' })
  @ApiCreatedResponse({
    description: 'Profesor creado exitosamente',
    type: TeacherResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ya existe un usuario con este correo electrónico',
  })
  @ApiForbiddenResponse({ description: 'No tienes permisos para gestionar profesores' })
  create(
    @Body() dto: CreateTeacherDto,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    return this.teachersService.create(dto, currentUser);
  }

  @Patch(':id')
  @Roles(UserRole.DIRECTOR, UserRole.UTP)
  @ApiOperation({ summary: 'Actualizar datos de un profesor (solo DIRECTOR y UTP)' })
  @ApiOkResponse({ description: 'Profesor actualizado', type: TeacherResponseDto })
  @ApiNotFoundResponse({ description: 'Profesor no encontrado' })
  @ApiConflictResponse({
    description: 'Ya existe un usuario con este correo electrónico',
  })
  @ApiForbiddenResponse({ description: 'No tienes permisos para gestionar profesores' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTeacherDto,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    return this.teachersService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.DIRECTOR, UserRole.UTP)
  @ApiOperation({ summary: 'Eliminar un profesor (solo DIRECTOR y UTP)' })
  @ApiNoContentResponse({ description: 'Profesor eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Profesor no encontrado' })
  @ApiConflictResponse({
    description: 'No se puede eliminar el profesor porque tiene asignaturas asociadas',
  })
  @ApiForbiddenResponse({ description: 'No tienes permisos para gestionar profesores' })
  async remove(
    @Param('id') id: string,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    await this.teachersService.remove(id, currentUser);
  }
}
