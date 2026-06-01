import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AcademicPeriodsModule } from './academic-periods/academic-periods.module';
import { GradesModule } from './grades/grades.module';
import { SubjectsModule } from './subjects/subjects.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { ALL_ENTITIES } from './database/entities';
import { InitialSchema1710000000000 } from './database/migrations/1710000000000-initial-schema.migration';
import { AddStudentFields1710000000001 } from './database/migrations/1710000000001-add-student-fields.migration';
import { SeedService } from './database/seed/seed.service';
import { MockAuthGuard } from './common/auth/mock-auth.guard';
import { RolesGuard } from './common/auth/roles.guard';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH ?? 'data/taruca.sqlite',
      entities: ALL_ENTITIES,
      migrations: [InitialSchema1710000000000, AddStudentFields1710000000001],
      migrationsRun: true,
      synchronize: false,
      logging: (process.env.DATABASE_LOGGING ?? 'false') === 'true',
    }),
    AcademicPeriodsModule,
    GradesModule,
    SubjectsModule,
    StudentsModule,
    TeachersModule,
  ],
  controllers: [HealthController],
  providers: [
    SeedService,
    { provide: APP_GUARD, useClass: MockAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
