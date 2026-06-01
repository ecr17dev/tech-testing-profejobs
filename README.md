# Taruca — Módulo de Calificaciones

> Implementación fullstack del módulo de calificaciones para la plataforma SaaS Taruca, orientada a instituciones educativas chilenas.

## ⚡ Quick Start

```bash
git clone [<repo>](https://github.com/ecr17dev/tech-testing-profejobs)
npm install
npm start
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api/docs |

**Credenciales mock:** `director@taruca.cl` / `utp@taruca.cl` / `teacher@taruca.cl` (password: cualquier valor)

---

## Tabla de contenidos

- [Resumen ejecutivo](#resumen-ejecutivo)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos](#requisitos)
- [Instalación y comandos](#instalación-y-comandos)
- [Configuración](#configuración)
- [Arquitectura del backend](#arquitectura-del-backend)
- [Autenticación y autorización](#autenticación-y-authorización)
- [Documentación de la API (Swagger)](#documentación-de-la-api-swagger)
- [Endpoints REST](#endpoints-rest)
- [Modelo de dominio](#modelo-de-dominio)
- [Reglas de negocio](#reglas-de-negocio)
- [Seeds demo](#seeds-demo)
- [Tests](#tests)
- [Supuestos y decisiones](#supuestos-y-decisiones)
- [Evolución sugerida](#evolución-sugerida)

---

## Resumen ejecutivo

Monorepo con dos workspaces:

| Capa | Tecnología | Descripción |
|---|---|---|
| **Backend** | NestJS 11 + TypeORM + SQLite | API REST con autenticación mock, guards de roles, validación con DTOs y documentación OpenAPI. |
| **Frontend** | Angular 21 (standalone) | Libro de clases tipo grilla, formularios reactivos tipados, autenticación mock y navegación por roles. |

Funcionalidades principales:

- CRUD de calificaciones con validación de rango `1.0` – `7.0`.
- Libro de clases: grilla alumno × evaluación con promedio aritmético por alumno.
- Indicador visual de riesgo cuando el promedio es menor a `4.0`.
- Apertura y cierre de períodos académicos (bloquea modificaciones de notas).
- Control de acceso por rol: Director, UTP y Profesor.
- Multi-tenancy por `institutionId`.
- JWT mockeado — sin necesidad de login real.

---

## Stack tecnológico

### Backend

| Dependencia | Versión | Propósito |
|---|---|---|
| `@nestjs/core` | 11.x | Framework principal |
| `@nestjs/typeorm` | 11.x | Integración ORM |
| `typeorm` | 1.x | ORM |
| `better-sqlite3` | 12.x | Driver SQLite local |
| `class-validator` | 0.15 | Validación de DTOs |
| `class-transformer` | 0.5 | Transformación de payloads |
| `@nestjs/swagger` | 11.x | Documentación OpenAPI |
| `@nestjs/config` | 4.x | Variables de entorno |
| `jest` | 30.x | Testing |

### Frontend

| Dependencia | Propósito |
|---|---|
| Angular 21 (standalone) | SPA |
| Reactive Forms (tipados) | Formularios con validación |
| HttpClient | Cliente HTTP con proxy `/api` |
| Vitest | Testing unitario |

---

## Estructura del repositorio

```txt
tech-testing-profejobs/
├── backend/
│   ├── src/
│   │   ├── main.ts                         # Bootstrap + Swagger + ValidationPipe + ExceptionFilter
│   │   ├── app.module.ts                   # Módulo raíz + TypeORM config + guards globales
│   │   ├── health.controller.ts            # Health check
│   │   ├── common/
│   │   │   ├── auth/                       # Guards, decorators, CurrentUser interface
│   │   │   ├── filters/                    # HttpExceptionFilter global
│   │   │   ├── enums/                      # UserRole enum
│   │   │   └── utils/                      # average.util (promedio aritmético)
│   │   ├── database/
│   │   │   ├── entities/                   # 9 entidades TypeORM
│   │   │   ├── migrations/                 # InitialSchema1710000000000
│   │   │   └── seed/                       # SeedService + constants (IDs y tokens mock)
│   │   ├── grades/                         # Módulo de calificaciones
│   │   │   └── dto/                        # Create, Update, Response DTOs
│   │   ├── subjects/                       # Módulo de asignaturas
│   │   │   └── dto/                        # Subject, Gradebook, StudentGrades Response DTOs
│   │   ├── gradebook/                      # Servicio de libro de clases
│   │   └── academic-periods/               # Módulo de períodos académicos
│   ├── data/                               # SQLite database (generado en runtime)
│   ├── .env / .env.example                 # Variables de entorno
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
├── AGENTS.md                               # Instrucciones para agentes IA
├── DATABASE.md                             # Documentación detallada de base de datos
├── CHECKLIST.md                             # Checklist de desarrollo
├── VIDEO_DEMO.md                            # Guion y checklist del video de entrega (<= 5 min)
└── README.md
```

---

## Requisitos

- Node.js 20+
- npm 10+

---

## Instalación y comandos

```bash
npm install        # Instala dependencias de ambos workspaces
npm start          # Levanta backend (3000) y frontend (4200) en paralelo
npm run build      # Compila backend + frontend
npm test           # Ejecuta tests de backend y frontend
```

### Comandos individuales

```bash
npm run start:backend     # Solo backend (watch mode, puerto 3000)
npm run start:frontend    # Solo frontend (puerto 4200)
npm run test:backend      # Solo tests backend (Jest)
npm run test:frontend     # Solo tests frontend
npm run build:backend     # Solo build backend (nest build)
npm run build:frontend    # Solo build frontend
```

### Puertos

`npm start` detecta automáticamente puertos ocupados y escala al siguiente disponible (3001, 4201, etc.). Para fijar puertos manualmente:

```bash
BACKEND_PORT=3100 FRONTEND_PORT=4300 npm start
```

Servicios por defecto:

| Servicio | URL |
|---|---|
| Backend API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api/docs |
| Frontend | http://localhost:4200 |

---

## Configuración

El backend usa variables de entorno a través de `@nestjs/config`. Archivos disponibles:

| Archivo | Propósito |
|---|---|
| `backend/.env` | Configuración de desarrollo local |
| `backend/.env.example` | Template documentado para referencia |

Variables disponibles:

| Variable | Default | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto HTTP del backend |
| `DATABASE_PATH` | `data/taruca.sqlite` | Ruta de la base SQLite (relativa a `backend/`) |
| `DATABASE_LOGGING` | `false` | Habilita logging de queries TypeORM |
| `SEED_ON_BOOTSTRAP` | `true` | Carga datos demo al iniciar |

---

## Arquitectura del backend

### Módulos

```txt
AppModule
├── ConfigModule (global)
├── TypeOrmModule.forRoot()     → SQLite + migraciones + seed
├── AcademicPeriodsModule       → CRUD de períodos + apertura/cierre
├── GradesModule                → CRUD de calificaciones + validaciones
└── SubjectsModule              → Asignaturas + libro de clases + notas por alumno
```

Cada módulo sigue el patrón NestJS estándar: `controller → service → repository (TypeORM)`, con controladores livianos y lógica de negocio en servicios.

### Guards globales

| Guard | Orden | Función |
|---|---|---|
| `MockAuthGuard` | 1° | Extrae token Bearer del header, busca el `CurrentUser` mock correspondiente. |
| `RolesGuard` | 2° | Verifica metadata `@Roles()` en handlers; restringe acceso por rol. |

### Pipes globales

| Pipe | Configuración |
|---|---|
| `ValidationPipe` | `whitelist: true`, `transform: true`, `forbidNonWhitelisted: true` |

Todo DTO con decoradores `class-validator` se valida automáticamente antes de llegar al controlador.

### Filtros globales

| Filtro | Función |
|---|---|
| `HttpExceptionFilter` | Captura toda excepción, estandariza respuesta `{ statusCode, message, error, timestamp, path }`, loguea errores 4xx/5xx. |

### Flujo de una request típica

```txt
Request → MockAuthGuard → RolesGuard → ValidationPipe → Controller → Service → Repository → DB
                                                                              ↓
                                                                   HttpExceptionFilter (errores)
```

---

## Autenticación y autorización

### Tokens mock

Incluir en el header `Authorization: Bearer <token>`:

| Token | Rol | Usuario demo |
|---|---|---|
| `director-token` | DIRECTOR | Daniela (director@taruca.cl) |
| `utp-token` | UTP | Ulises (utp@taruca.cl) |
| `teacher-token` | TEACHER | Tamara (teacher@taruca.cl) |
| `teacher-other-token` | TEACHER | Pablo (teacher-other@taruca.cl) |

No se requiere login real. Los tokens están definidos en `backend/src/database/seed/constants.ts`.

### Matriz de permisos

| Rol | Ver períodos | Abrir/cerrar período | Gestionar calificaciones |
|---|---|---|---|
| **DIRECTOR** | Todos los de su institución | ✅ | Todas las asignaturas de su institución |
| **UTP** | Todos los de su institución | ✅ | Todas las asignaturas de su institución |
| **TEACHER** | Todos los de su institución | ❌ | Solo sus propias asignaturas |

### Scope multi-tenant

Toda consulta filtra por `institutionId` del `CurrentUser` inyectado vía `@CurrentUserDecorator()`. Las entidades tienen FK a `institutions` como raíz de tenant.

---

## Documentación de la API (Swagger)

La API está documentada con OpenAPI 3.0. Swagger UI disponible en:

👉 **http://localhost:3000/api/docs**

Para autenticar en Swagger UI:
1. Clic en **Authorize** (candado superior derecha)
2. Ingresar uno de los tokens mock (ej: `teacher-token`)
3. Clic en **Authorize**, luego **Close**

El spec JSON también está disponible en `/api/docs-json`.

---

## Endpoints REST

### `GET /health`
Health check público (sin autenticación).

### `GET /academic-periods`
Lista períodos académicos de la institución. Ordenados por año descendente.

### `PATCH /academic-periods/:id/status`
Abre o cierra un período. Body: `{ "isOpen": boolean }`.
Restringido a roles `DIRECTOR` y `UTP` mediante `@Roles()`.

### `POST /grades`
Crea una calificación. Body:
```json
{
  "studentId": "uuid",
  "evaluationId": "uuid",
  "score": 6.1
}
```
Valida rango `1.0`–`7.0`, verifica inscripción del alumno, evita duplicados por alumno+evaluación, y bloquea si el período está cerrado.

### `GET /grades`
Lista calificaciones visibles. Profesor ve solo sus asignaturas; Director/UTP ven todas las de su institución.

### `GET /grades/:id`
Obtiene una calificación por ID.

### `PATCH /grades/:id`
Actualiza la nota de una calificación. Body: `{ "score": 5.5 }`.
Bloqueado si el período está cerrado.

### `DELETE /grades/:id`
Elimina una calificación. Retorna `204 No Content`.
Bloqueado si el período está cerrado.

### `GET /subjects`
Lista asignaturas visibles según rol (profesor: solo propias; director/UTP: todas).

### `GET /subjects/:subjectId/gradebook?academicPeriodId=...`
Libro de clases completo: evaluaciones, alumnos, notas y promedio por alumno. Incluye flag `isBelowPassingGrade` cuando el promedio es menor a `4.0`.

### `GET /subjects/:subjectId/students/:studentId/grades`
Notas de un alumno específico en una asignatura.

### Códigos de respuesta HTTP

| Código | Significado |
|---|---|
| `200` | OK — operación exitosa |
| `201` | Created — recurso creado |
| `204` | No Content — recurso eliminado (sin body) |
| `400` | Bad Request — datos inválidos (rango, inscripción) |
| `401` | Unauthorized — token faltante o inválido |
| `403` | Forbidden — período cerrado o sin permisos sobre la asignatura |
| `404` | Not Found — recurso no encontrado |
| `409` | Conflict — calificación duplicada |
| `500` | Internal Server Error |

---

## Modelo de dominio

Ver [DATABASE.md](./DATABASE.md) para el esquema completo de base de datos, relaciones, constraints e índices.

| Entidad | Responsabilidad |
|---|---|
| `Institution` | Institución educativa y raíz de multi-tenancy. |
| `User` | Usuario con rol (`DIRECTOR`, `UTP`, `TEACHER`) e institución. |
| `AcademicPeriod` | Período académico (ej: "Primer Semestre 2026"), con estado `isOpen`. |
| `Course` | Curso (ej: "8vo Básico A"). |
| `Student` | Alumno de la institución. |
| `Enrollment` | Inscripción de alumno en curso y período. |
| `Subject` | Asignatura asociada a curso, período y profesor. |
| `Evaluation` | Columna del libro de clases (ej: "Prueba 1", "Control 1"). |
| `Grade` | Nota de un alumno para una evaluación. |

### Relaciones clave

```
Institution (1) ──< (N) User
Institution (1) ──< (N) AcademicPeriod
Institution (1) ──< (N) Course
Institution (1) ──< (N) Student

Student (1) ──< (N) Enrollment
Course   (1) ──< (N) Enrollment
AcademicPeriod (1) ──< (N) Enrollment

Course (1) ──< (N) Subject
AcademicPeriod (1) ──< (N) Subject
User (teacher) (1) ──< (N) Subject

Subject (1) ──< (N) Evaluation
AcademicPeriod (1) ──< (N) Evaluation

Student (1) ──< (N) Grade
Evaluation (1) ──< (N) Grade
```

---

## Reglas de negocio

1. Nota válida: `1.0 <= score <= 7.0` (validado en DTO, servicio y constraint SQL).
2. Una única nota por alumno + evaluación (índice único + verificación en servicio).
3. Alumno debe estar inscrito en el curso y período de la asignatura para recibir nota.
4. Período cerrado: permite lectura pero bloquea creación, edición y eliminación de notas.
5. Promedio aritmético simple calculado en capa de aplicación.
6. Sin notas registradas → promedio `null` (nunca `0`).
7. Destacar visualmente promedios bajo `4.0` (nota mínima de aprobación chilena).
8. Profesor solo gestiona sus asignaturas (`subjects.teacher_id`).
9. Director y UTP gestionan todas las asignaturas de su institución.
10. Toda consulta filtra por `institutionId` del usuario autenticado.
11. Sin login real. JWT mockeado vía headers.
12. Sin ponderaciones ni tipos de evaluación en el alcance base.

---

## Seeds demo

Al iniciar el backend con `SEED_ON_BOOTSTRAP=true` (default), se carga automáticamente el siguiente dataset idempotente:

| Entidad | Cantidad | Detalle |
|---|---|---|
| Institution | 1 | Colegio Taruca Demo |
| User | 4 | director, utp, teacher, teacher-other |
| AcademicPeriod | 1 | Primer Semestre 2026 (abierto) |
| Course | 1 | 8vo Básico A |
| Student | 2 | Ana Pérez, Juan Soto |
| Enrollment | 2 | Ambos en 8vo Básico A, período 2026 |
| Subject | 2 | Matemáticas (teacher), Historia (teacher-other) |
| Evaluation | 3 | Prueba 1, Control 1, Trabajo práctico (Matemáticas) |
| Grade | 3 | Ana: 6.0 y 5.8, Juan: 3.5 (riesgo) |

Esto permite validar de inmediato: promedios, riesgo `< 4.0` y control de acceso entre profesores.

---

## Tests

### Backend (Jest) — 11 tests en 3 suites

| Suite | Tests | Cobertura |
|---|---|---|
| `grades.service.spec.ts` | 6 | Crear válida, rechazar rango bajo/alto, rechazar duplicado, rechazar período cerrado, rechazar profesor sin permiso |
| `gradebook.service.spec.ts` | 2 | Promedio `null` sin notas, marca de riesgo `< 4.0` |
| `average.util.spec.ts` | 3 | `null` para vacío, cálculo correcto, redondeo a 1 decimal |

### Frontend (Vitest) — tests de componente

| Suite | Tests | Cobertura |
|---|---|---|
| `grade-form.component.spec.ts` | 2 | Validación de rango, emisión de guardado |
| `grade-grid.component.spec.ts` | 2 | Clase visual para promedio bajo, emisión de selección |

```bash
npm test              # Ejecuta todos los tests
npm run test:backend  # Solo backend
npm run test:frontend # Solo frontend
```

---

## Supuestos y decisiones

- **Sin login real**: se usa JWT mockeado vía `Bearer <token>`.
- **Sin ponderaciones ni tipos de evaluación**: solo promedio aritmético simple.
- **Sin exportación/importación masiva**: fuera del alcance base.
- **SQLite**: base de datos local sin necesidad de servidor externo. Para producción se recomienda PostgreSQL.
- **IDs determinísticos en seed**: facilitan pruebas manuales y automatizadas con datos predecibles.
- **Entidades con `institutionId`**: todas las tablas tienen FK a `institutions` para multi-tenancy desde el día 1.
- **Índices únicos a nivel de DB y verificación en servicio**: doble capa de integridad (constraint SQL + validación en TypeScript).
- **Controladores livianos**: toda la lógica de negocio reside en servicios, facilitando testing unitario sin levantar el servidor HTTP.

---

## Evolución sugerida

- Migrar a PostgreSQL para producción, con migraciones versionadas por entorno.
- Agregar autenticación real con JWT + refresh tokens.
- Implementar rate limiting (`@nestjs/throttler`).
- Añadir auditoría de cambios de nota (quién, cuándo, valor anterior).
- Soporte para múltiples períodos académicos simultáneos.
- Exportación de libro de clases a PDF/Excel.
- Notificaciones para promedios bajo `4.0`.
- Soft delete en calificaciones y evaluaciones.
- Caché de consultas frecuentes (libro de clases, promedios).
- Monitoreo con health checks avanzados (`@nestjs/terminus`).
