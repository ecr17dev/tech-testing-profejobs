import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicPeriod } from '../database/entities';
import { AcademicPeriodsService } from './academic-periods.service';
import { AcademicPeriodsController } from './academic-periods.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicPeriod])],
  providers: [AcademicPeriodsService],
  controllers: [AcademicPeriodsController],
  exports: [AcademicPeriodsService],
})
export class AcademicPeriodsModule {}
