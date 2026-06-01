# Taruca Backend — Módulo de Calificaciones

NestJS 11 + TypeORM + SQLite. API REST completa para gestión de calificaciones en instituciones educativas chilenas.

## Stack

| Tecnología | Detalle |
|---|---|
| NestJS 11 | Framework, módulos, controladores, servicios |
| TypeORM + SQLite | ORM con migrations y seed determinístico |
| `class-validator` | Validación de DTOs en cada request |
| `@nestjs/swagger` | OpenAPI 3.0 → Swagger UI en `/api/docs` |
| `better-sqlite3` | Driver SQLite nativo |
| Jest | Tests unitarios de servicios |

## Módulos

```
AppModule
├── ConfigModule          # Variables de entorno
├── TypeOrmModule        # SQLite + migrations + seed
├── HealthController      # GET /health (público)
├── AcademicPeriodsModule # Períodos académicos (CRUD + apertura/cierre)
├── GradesModule         # Calificaciones (CRUD + validaciones)
└── SubjectsModule       # Asignaturas + libro de clases
```

## Middleware y guards (pipeline de request)

```
Request → MockAuthGuard → RolesGuard → ValidationPipe → Controller → Service → Repository
                                                                                ↓
                                                                     HttpExceptionFilter
```

| Componente | Función |
|---|---|
| `MockAuthGuard` | Extrae `Bearer <token>` → busca `CurrentUser` mock |
| `RolesGuard` | Verifica `@Roles()` en handler (DIRECTOR / UTP / TEACHER) |
| `ValidationPipe` | `whitelist: true`, `transform: true`, `forbidNonWhitelisted: true` |
| `HttpExceptionFilter` | Respuesta estandarizada `{ statusCode, message, error, timestamp, path }` |

## Endpoints

### Health
- `GET /health` — Health check público

### Períodos Académicos
- `GET /api/academic-periods` — Lista períodos de la institución
- `PATCH /api/academic-periods/:id/status` — Abre/cierra período (`DIRECTOR`, `UTP`)

### Calificaciones
- `GET /api/grades` — Lista calificaciones visibles según rol
- `GET /api/grades/:id` — Obtiene una calificación
- `POST /api/grades` — Crea calificación (valida rango 1.0–7.0, inscripción, duplicados, período abierto)
- `PATCH /api/grades/:id` — Actualiza nota (período abierto)
- `DELETE /api/grades/:id` — Elimina calificación (período abierto)

### Asignaturas
- `GET /api/subjects` — Lista asignaturas visibles según rol
- `GET /api/subjects/:subjectId/gradebook?academicPeriodId=` — Libro de clases completo
- `GET /api/subjects/:subjectId/students/:studentId/grades` — Notas de un alumno

### Autenticación
- `POST /api/auth/forgot-password` — Solicitud de recuperación de contraseña

## Modelo de datos

9 entidades con relaciones completas:

```
Institution (1) ──< User
Institution (1) ──< AcademicPeriod
Institution (1) ──< Course
Institution (1) ──< Student

Student (1) ──< Enrollment <── (N) Course
Student (1) ──< Enrollment <── (N) AcademicPeriod

Course (1) ──< Subject >── (1) AcademicPeriod
Course (1) ──< Subject >── (1) User (teacher)

Subject (1) ──< Evaluation >── (1) AcademicPeriod
Subject (1) ──< Grade
Student (1) ──< Grade
Evaluation (1) ──< Grade
```

Ver [DATABASE.md](../DATABASE.md) para esquema completo con columnas, tipos, constraints e índices.

## Datos de prueba (Seed)

Al iniciar con `SEED_ON_BOOTSTRAP=true` se cargan automáticamente:

| Entidad | Cantidad | Detalle |
|---|---|---|
| Institution | 1 | Colegio Taruca Demo |
| User | 4 | director, utp, teacher, teacher-other |
| AcademicPeriod | 1 | Primer Semestre 2026 (abierto) |
| Course | 1 | 8vo Básico A |
| Student | 2 | Ana Pérez, Juan Soto |
| Subject | 2 | Matemáticas (teacher), Historia (teacher-other) |
| Evaluation | 3 | Prueba 1, Control 1, Trabajo práctico |
| Grade | 3 | Ana: 6.0 y 5.8, Juan: 3.5 (riesgo) |

## Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto HTTP |
| `DATABASE_PATH` | `data/taruca.sqlite` | Ruta SQLite (relativa a `backend/`) |
| `DATABASE_LOGGING` | `false` | Logging de queries TypeORM |
| `SEED_ON_BOOTSTRAP` | `true` | Carga seed al iniciar |

## Desarrollo

```bash
npm run start:backend    # nest start (watch mode)
npm run test:backend    # Jest (--runInBand)
npm run build:backend   # nest build → dist/
```

Swagger UI: **http://localhost:3000/api/docs**

Para probar endpoints autenticados en Swagger:
1. Clic en **Authorize** (candado)
2. Ingresar token (ej: `teacher-token`)
3. **Authorize** → **Close**

## Tests

11 tests en 3 suites:

| Suite | Tests |
|---|---|
| `grades.service.spec.ts` | Crear válida, rechazar rango bajo/alto, duplicado, período cerrado, profesor sin permiso |
| `gradebook.service.spec.ts` | Promedio `null` sin notas, marca riesgo `< 4.0` |
| `average.util.spec.ts` | `null` para vacío, cálculo correcto, redondeo 1 decimal |

```bash
npm test:backend
```
