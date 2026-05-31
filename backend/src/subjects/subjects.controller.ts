import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { GradebookService } from '../gradebook/gradebook.service';
import { GradesService } from '../grades/grades.service';
import { SubjectResponseDto } from './dto/subject-response.dto';
import { GradebookResponseDto } from './dto/gradebook-response.dto';
import { StudentGradesResponseDto } from './dto/student-grades-response.dto';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { EvaluationResponseDto } from './dto/evaluation-response.dto';
import { CurrentUserDecorator } from '../common/auth/current-user.decorator';
import type { CurrentUser } from '../common/auth/current-user.interface';

@ApiTags('Subjects')
@ApiBearerAuth('mock-jwt')
@ApiUnauthorizedResponse({ description: 'Token de autenticación faltante o inválido' })
@Controller('subjects')
export class SubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly gradebookService: GradebookService,
    private readonly gradesService: GradesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar asignaturas visibles para el usuario actual' })
  @ApiOkResponse({
    description: 'Asignaturas visibles (profesor ve solo las propias; director/UTP ven todas las de su institución)',
    type: [SubjectResponseDto],
  })
  findVisibleSubjects(@CurrentUserDecorator() currentUser: CurrentUser) {
    return this.subjectsService.findVisibleSubjects(currentUser);
  }

  @Post(':subjectId/evaluations')
  @ApiOperation({
    summary: 'Crear una evaluación para la asignatura (nombre/descripcion)',
  })
  @ApiCreatedResponse({
    description: 'Evaluación creada exitosamente',
    type: EvaluationResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Asignatura o período académico no encontrado' })
  @ApiForbiddenResponse({
    description:
      'Período cerrado o no tienes permisos para gestionar esta asignatura',
  })
  @ApiConflictResponse({
    description: 'Ya existe una evaluación con este nombre en la asignatura',
  })
  createEvaluation(
    @Param('subjectId') subjectId: string,
    @Body() dto: CreateEvaluationDto,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    return this.subjectsService.createEvaluation(subjectId, dto, currentUser);
  }

  @Get(':subjectId/gradebook')
  @ApiOperation({ summary: 'Obtener el libro de clases (grilla alumno × evaluación) de una asignatura' })
  @ApiQuery({
    name: 'academicPeriodId',
    description:
      'ID del período académico (opcional: si no se envía, se usa el período asociado a la asignatura)',
    required: false,
    example: '22222222-2222-2222-2222-222222222222',
  })
  @ApiOkResponse({
    description: 'Libro de clases con evaluaciones, estudiantes, notas y promedios',
    type: GradebookResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Asignatura o curso no encontrado' })
  @ApiForbiddenResponse({ description: 'No tienes permisos para ver esta asignatura' })
  getGradebook(
    @Param('subjectId') subjectId: string,
    @Query('academicPeriodId') academicPeriodId: string | undefined,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    return this.gradebookService.getSubjectGradebook(
      subjectId,
      academicPeriodId,
      currentUser,
    );
  }

  @Get(':subjectId/students/:studentId/grades')
  @ApiOperation({ summary: 'Obtener las calificaciones de un alumno en una asignatura' })
  @ApiOkResponse({
    description: 'Lista de calificaciones del alumno en la asignatura',
    type: StudentGradesResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Asignatura o alumno no encontrado' })
  @ApiForbiddenResponse({ description: 'No tienes permisos para ver esta asignatura' })
  getStudentGrades(
    @Param('subjectId') subjectId: string,
    @Param('studentId') studentId: string,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    return this.gradesService.getStudentGradesInSubject(
      subjectId,
      studentId,
      currentUser,
    );
  }
}
