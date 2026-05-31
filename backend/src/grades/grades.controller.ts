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
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradeResponseDto } from './dto/grade-response.dto';
import { CurrentUserDecorator } from '../common/auth/current-user.decorator';
import type { CurrentUser } from '../common/auth/current-user.interface';

@ApiTags('Grades')
@ApiBearerAuth('mock-jwt')
@ApiUnauthorizedResponse({ description: 'Token de autenticación faltante o inválido' })
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva calificación' })
  @ApiCreatedResponse({
    description: 'Calificación creada exitosamente',
    type: GradeResponseDto,
  })
  @ApiConflictResponse({ description: 'Ya existe una calificación para este alumno y evaluación' })
  @ApiForbiddenResponse({ description: 'Período cerrado o no tienes permisos sobre esta asignatura' })
  @ApiNotFoundResponse({ description: 'Evaluación, asignatura, período o alumno no encontrado' })
  create(
    @Body() dto: CreateGradeDto,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    return this.gradesService.create(dto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las calificaciones visibles' })
  @ApiOkResponse({
    description: 'Lista de calificaciones (filtradas por rol: profesor ve solo sus asignaturas)',
    type: [GradeResponseDto],
  })
  findAll(@CurrentUserDecorator() currentUser: CurrentUser) {
    return this.gradesService.findAll(currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una calificación por ID' })
  @ApiOkResponse({ description: 'Calificación encontrada', type: GradeResponseDto })
  @ApiNotFoundResponse({ description: 'Calificación no encontrada' })
  @ApiForbiddenResponse({ description: 'No tienes permisos sobre esta asignatura' })
  findOne(
    @Param('id') id: string,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    return this.gradesService.findOne(id, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar la nota de una calificación existente' })
  @ApiOkResponse({ description: 'Calificación actualizada', type: GradeResponseDto })
  @ApiNotFoundResponse({ description: 'Calificación no encontrada' })
  @ApiForbiddenResponse({ description: 'Período cerrado o no tienes permisos sobre esta asignatura' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGradeDto,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    return this.gradesService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una calificación' })
  @ApiNoContentResponse({ description: 'Calificación eliminada exitosamente' })
  @ApiNotFoundResponse({ description: 'Calificación no encontrada' })
  @ApiForbiddenResponse({ description: 'Período cerrado o no tienes permisos sobre esta asignatura' })
  async remove(
    @Param('id') id: string,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    await this.gradesService.remove(id, currentUser);
  }
}
