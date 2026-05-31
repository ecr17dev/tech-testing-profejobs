import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({ origin: '*' });

  const config = new DocumentBuilder()
    .setTitle('Taruca — Módulo de Calificaciones')
    .setDescription(
      'API REST para la gestión de calificaciones académicas. Permite a profesores registrar notas, y a directivos hacer seguimiento del rendimiento académico en instituciones educativas chilenas.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Token mock',
        description: 'Token JWT mockeado. Usar tokens definidos en backend/src/database/seed/constants.ts',
      },
      'mock-jwt',
    )
    .addTag('Grades', 'Gestión de calificaciones (CRUD)')
    .addTag('Subjects', 'Asignaturas, libro de clases y notas por alumno')
    .addTag('Academic Periods', 'Gestión de períodos académicos (apertura/cierre)')
    .addTag('Students', 'Gestión de alumnos (CRUD, soft delete)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = getPort();
  await app.listen(port);

  Logger.log(`Backend running on http://localhost:${port}`, 'Bootstrap');
  Logger.log(`Swagger UI available at http://localhost:${port}/api/docs`, 'Bootstrap');
}

function getPort(): number {
  const argPortIndex = process.argv.findIndex((arg) => arg === '--port');
  const argPortValue =
    argPortIndex >= 0 ? Number(process.argv[argPortIndex + 1]) : NaN;

  if (!Number.isNaN(argPortValue) && argPortValue > 0) {
    return argPortValue;
  }

  const envPort = Number(process.env.PORT);
  if (!Number.isNaN(envPort) && envPort > 0) {
    return envPort;
  }

  return 3000;
}

void bootstrap();
