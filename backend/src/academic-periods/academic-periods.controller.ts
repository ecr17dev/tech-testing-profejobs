import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AcademicPeriodsService } from './academic-periods.service';
import { CurrentUserDecorator } from '../common/auth/current-user.decorator';
import type { CurrentUser } from '../common/auth/current-user.interface';
import { UpdateAcademicPeriodStatusDto } from './dto/update-academic-period-status.dto';
import { Roles } from '../common/auth/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { AcademicPeriod } from '../database/entities';

@ApiTags('Academic Periods')
@ApiBearerAuth('mock-jwt')
@ApiUnauthorizedResponse({ description: 'Token de autenticación faltante o inválido' })
@Controller('academic-periods')
export class AcademicPeriodsController {
  constructor(private readonly periodsService: AcademicPeriodsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar períodos académicos de la institución' })
  @ApiOkResponse({
    description: 'Lista de períodos académicos ordenados por año descendente',
    type: [AcademicPeriod],
  })
  findAll(@CurrentUserDecorator() currentUser: CurrentUser) {
    return this.periodsService.findAll(currentUser);
  }

  @Patch(':id/status')
  @Roles(UserRole.DIRECTOR, UserRole.UTP)
  @ApiOperation({ summary: 'Abrir o cerrar un período académico (solo DIRECTOR y UTP)' })
  @ApiOkResponse({ description: 'Estado del período actualizado', type: AcademicPeriod })
  @ApiNotFoundResponse({ description: 'Período académico no encontrado' })
  @ApiForbiddenResponse({ description: 'No tienes permisos (requiere rol DIRECTOR o UTP)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAcademicPeriodStatusDto,
    @CurrentUserDecorator() currentUser: CurrentUser,
  ) {
    return this.periodsService.updateStatus(id, dto, currentUser);
  }
}
