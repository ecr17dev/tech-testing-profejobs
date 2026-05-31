import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicPeriod } from '../database/entities';
import { CurrentUser } from '../common/auth/current-user.interface';
import { UpdateAcademicPeriodStatusDto } from './dto/update-academic-period-status.dto';

@Injectable()
export class AcademicPeriodsService {
  constructor(
    @InjectRepository(AcademicPeriod)
    private readonly periodsRepository: Repository<AcademicPeriod>,
  ) {}

  findAll(currentUser: CurrentUser): Promise<AcademicPeriod[]> {
    return this.periodsRepository.find({
      where: { institutionId: currentUser.institutionId },
      order: { year: 'DESC', name: 'ASC' },
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateAcademicPeriodStatusDto,
    currentUser: CurrentUser,
  ): Promise<AcademicPeriod> {
    const period = await this.periodsRepository.findOne({
      where: { id, institutionId: currentUser.institutionId },
    });

    if (!period) {
      throw new NotFoundException('Período académico no encontrado');
    }

    period.isOpen = dto.isOpen;
    return this.periodsRepository.save(period);
  }
}
