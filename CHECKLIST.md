# Checklist profesional de desarrollo — Taruca Módulo de Calificaciones

Guía paso a paso para implementar el módulo de calificaciones de Taruca en un monorepo fullstack con **NestJS + TypeORM + SQLite** en backend y **Angular standalone components** en frontend.

Este checklist está pensado para desarrollar, validar y entregar el proyecto de forma ordenada, profesional y alineada con la prueba técnica.

---

## Cómo usar este checklist

Marca cada tarea cuando esté realmente implementada y verificada.

Convención sugerida:

```md
- [ ] Pendiente
- [x] Completado
- [~] Parcial o en revisión
```

Recomendación de trabajo:

1. Implementar por fases.
2. Hacer commits pequeños y descriptivos.
3. Ejecutar tests al cerrar cada bloque importante.
4. Actualizar el README a medida que se tomen decisiones.
5. Grabar el video solo después de pasar la verificación final.

---

## Definición de terminado del proyecto

El proyecto se considera listo cuando:

- [ ] `npm install` funciona desde la raíz.
- [ ] `npm start` levanta backend y frontend desde la raíz.
- [ ] Backend disponible en `http://localhost:3000`.
- [ ] Frontend disponible en `http://localhost:4200`.
- [ ] La base SQLite se crea o se carga correctamente.
- [ ] Existen datos de prueba suficientes para revisar la app.
- [ ] Existe CRUD funcional de calificaciones.
- [ ] Existe vista de libro de clases.
- [ ] Se calcula promedio por alumno/asignatura/período.
- [ ] Se destaca visualmente promedio bajo `4.0`.
- [ ] Se valida nota entre `1.0` y `7.0` en frontend y backend.
- [ ] Se bloquean cambios cuando el período está cerrado.
- [ ] Se simula JWT con usuario, rol e institución.
- [ ] Profesor solo gestiona sus asignaturas.
- [ ] Director y UTP pueden ver y gestionar todas las asignaturas de su institución.
- [ ] Hay tests unitarios backend relevantes.
- [ ] Hay tests frontend relevantes.
- [ ] README incluye instalación, decisiones, supuestos y mejoras futuras.
- [ ] Repositorio público tiene commits ordenados.
- [ ] Video de máximo 5 minutos demuestra arquitectura, decisiones y demo funcional.

---

## Índice

- [Fase 0 — Alineación del alcance](#fase-0--alineación-del-alcance)
- [Fase 1 — Preparación del ambiente](#fase-1--preparación-del-ambiente)
- [Fase 2 — Repositorio y monorepo](#fase-2--repositorio-y-monorepo)
- [Fase 3 — Backend base NestJS](#fase-3--backend-base-nestjs)
- [Fase 4 — Modelo de dominio y base de datos](#fase-4--modelo-de-dominio-y-base-de-datos)
- [Fase 5 — Seeds y datos demo](#fase-5--seeds-y-datos-demo)
- [Fase 6 — Autenticación JWT mockeada y autorización](#fase-6--autenticación-jwt-mockeada-y-autorización)
- [Fase 7 — Períodos académicos](#fase-7--períodos-académicos)
- [Fase 8 — Cursos, alumnos, inscripciones y asignaturas](#fase-8--cursos-alumnos-inscripciones-y-asignaturas)
- [Fase 9 — Evaluaciones](#fase-9--evaluaciones)
- [Fase 10 — CRUD de calificaciones](#fase-10--crud-de-calificaciones)
- [Fase 11 — Libro de clases y promedios](#fase-11--libro-de-clases-y-promedios)
- [Fase 12 — Validaciones, errores y reglas de negocio](#fase-12--validaciones-errores-y-reglas-de-negocio)
- [Fase 13 — Tests backend](#fase-13--tests-backend)
- [Fase 14 — Frontend base Angular](#fase-14--frontend-base-angular)
- [Fase 15 — Integración frontend con API](#fase-15--integración-frontend-con-api)
- [Fase 16 — Pantalla de libro de clases](#fase-16--pantalla-de-libro-de-clases)
- [Fase 17 — Formulario de ingreso y edición de notas](#fase-17--formulario-de-ingreso-y-edición-de-notas)
- [Fase 18 — Estados de UI, período cerrado y permisos](#fase-18--estados-de-ui-período-cerrado-y-permisos)
- [Fase 19 — Tests frontend](#fase-19--tests-frontend)
- [Fase 20 — QA manual end-to-end](#fase-20--qa-manual-end-to-end)
- [Fase 21 — Calidad, lint, build y formato](#fase-21--calidad-lint-build-y-formato)
- [Fase 22 — README profesional](#fase-22--readme-profesional)
- [Fase 23 — Video de entrega](#fase-23--video-de-entrega)
- [Fase 24 — Repositorio público y entrega](#fase-24--repositorio-público-y-entrega)
- [Fase 25 — Checklist final de auditoría](#fase-25--checklist-final-de-auditoría)
- [Backlog opcional si queda tiempo](#backlog-opcional-si-queda-tiempo)

---

# Fase 0 — Alineación del alcance

Objetivo: dejar claro qué se va a implementar, qué se va a simular y qué quedará documentado como mejora futura.

## Requisitos obligatorios

- [ ] Confirmar stack backend: NestJS.
- [ ] Confirmar ORM: TypeORM.
- [ ] Confirmar base de datos: SQLite local.
- [ ] Confirmar stack frontend: Angular reciente.
- [ ] Confirmar uso de standalone components.
- [ ] Confirmar autenticación JWT mockeada.
- [ ] Confirmar roles mínimos: `DIRECTOR`, `UTP`, `TEACHER`.
- [ ] Confirmar límite multiinstitución mediante `institutionId`.
- [ ] Confirmar rango de nota: `1.0` a `7.0`.
- [ ] Confirmar nota mínima de aprobación: `4.0`.
- [ ] Confirmar promedio simple sin ponderación.
- [ ] Confirmar CRUD de calificaciones.
- [ ] Confirmar endpoint para abrir/cerrar período.
- [ ] Confirmar listado de alumnos con promedio por asignatura.
- [ ] Confirmar listado de calificaciones de un alumno en una asignatura.
- [ ] Confirmar tests unitarios backend.
- [ ] Confirmar tests frontend no triviales.

## Decisiones de alcance

- [ ] Decidir si usar `Evaluation` como entidad separada de `Grade`.
- [ ] Documentar que `Evaluation` representa la columna del libro de clases, por ejemplo `Prueba 1`.
- [ ] Documentar que `Grade` representa la nota numérica de un alumno para una evaluación.
- [ ] Decidir si los IDs serán UUID reales o strings semánticos.
- [ ] Si se usan DTOs con `@IsUUID()`, asegurar que los seeds usen UUID válidos.
- [ ] Decidir si se usará `synchronize: true` solo en desarrollo o migraciones.
- [ ] Decidir si se bloqueará eliminación de evaluaciones con notas asociadas.
- [ ] Decidir si la app tendrá selector de curso/asignatura/período o vista demo fija.

## Qué dejar fuera explícitamente

- [ ] Login real.
- [ ] Registro de usuarios.
- [ ] Refresh tokens.
- [ ] Ponderaciones.
- [ ] Tipo de evaluación: formativa, sumativa, diagnóstica.
- [ ] Auditoría de cambios.
- [ ] Soft delete avanzado.
- [ ] Importación Excel/CSV.
- [ ] Exportación PDF/Excel.
- [ ] Multi-tenant productivo avanzado.

## Criterio de aceptación de la fase

- [ ] Existe una lista clara de alcance incluido.
- [ ] Existe una lista clara de alcance excluido.
- [ ] Las decisiones principales están documentadas o listas para ir al README.

Commit sugerido:

```bash
git add .
git commit -m "docs: define technical scope and project decisions"
```

---

# Fase 1 — Preparación del ambiente

Objetivo: asegurar que el proyecto pueda desarrollarse y ejecutarse localmente sin fricción.

## Herramientas necesarias

- [ ] Instalar Node.js 20 o superior.
- [ ] Instalar npm 10 o superior.
- [ ] Instalar Git.
- [ ] Instalar editor recomendado, por ejemplo VS Code.
- [ ] Instalar extensión ESLint en el editor.
- [ ] Instalar extensión Prettier en el editor.
- [ ] Confirmar que `node -v` muestra versión compatible.
- [ ] Confirmar que `npm -v` muestra versión compatible.
- [ ] Confirmar que `git --version` funciona.

## Verificación local

Ejecutar:

```bash
node -v
npm -v
git --version
```

- [ ] Versiones registradas en notas personales o README si corresponde.
- [ ] Ambiente listo para crear backend y frontend.

## Criterio de aceptación de la fase

- [ ] El ambiente local permite ejecutar comandos Node, npm y Git.
- [ ] No hay dependencia externa obligatoria como Docker o PostgreSQL.

---

# Fase 2 — Repositorio y monorepo

Objetivo: crear una estructura de proyecto clara, revisable y fácil de levantar desde la raíz.

## Crear repositorio

- [ ] Crear carpeta raíz `taruca-calificaciones`.
- [ ] Inicializar Git.
- [ ] Crear repositorio público en GitHub.
- [ ] Conectar remoto `origin`.
- [ ] Crear rama principal `main`.
- [ ] Crear README inicial.
- [ ] Crear `.gitignore` inicial.

Comandos sugeridos:

```bash
mkdir taruca-calificaciones
cd taruca-calificaciones
git init
git branch -M main
```

## Estructura inicial esperada

```txt
taruca-calificaciones/
├── README.md
├── CHECKLIST_DESARROLLO_TARUCA.md
├── package.json
├── .gitignore
├── backend/
└── frontend/
```

- [ ] Crear carpeta `backend`.
- [ ] Crear carpeta `frontend`.
- [ ] Crear `package.json` raíz.
- [ ] Configurar `private: true` en `package.json` raíz.
- [ ] Configurar workspaces: `backend` y `frontend`.
- [ ] Instalar `concurrently` como dependencia de desarrollo en la raíz.

## Scripts raíz

Configurar scripts raíz:

```json
{
  "scripts": {
    "start": "concurrently -n backend,frontend \"npm run start:backend\" \"npm run start:frontend\"",
    "start:backend": "npm --workspace backend run start:dev",
    "start:frontend": "npm --workspace frontend run start",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "npm --workspace backend run build",
    "build:frontend": "npm --workspace frontend run build",
    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "npm --workspace backend run test",
    "test:frontend": "npm --workspace frontend run test",
    "lint": "npm run lint:backend && npm run lint:frontend",
    "lint:backend": "npm --workspace backend run lint",
    "lint:frontend": "npm --workspace frontend run lint"
  }
}
```

- [ ] Verificar que los scripts raíz existen.
- [ ] Verificar que `npm install` funciona desde la raíz.

## `.gitignore` recomendado

- [ ] Ignorar `node_modules/`.
- [ ] Ignorar `dist/`.
- [ ] Ignorar `coverage/`.
- [ ] Ignorar `.env`.
- [ ] Ignorar archivos SQLite generados.
- [ ] Ignorar `.DS_Store`.

Contenido sugerido:

```gitignore
node_modules/
dist/
coverage/
.env
backend/data/*.sqlite
backend/data/*.sqlite-shm
backend/data/*.sqlite-wal
.DS_Store
```

## Criterio de aceptación de la fase

- [ ] Existe monorepo con raíz, backend y frontend.
- [ ] `npm install` funciona desde la raíz.
- [ ] Scripts raíz están preparados.
- [ ] `.gitignore` evita subir artefactos generados.

Commit sugerido:

```bash
git add .
git commit -m "chore: setup monorepo structure"
```

---

# Fase 3 — Backend base NestJS

Objetivo: crear una API NestJS funcional, con configuración base y health check.

## Crear aplicación backend

- [ ] Crear proyecto NestJS dentro de `backend`.
- [ ] Confirmar que `backend/package.json` existe.
- [ ] Confirmar que `backend/src/main.ts` existe.
- [ ] Confirmar que `backend/src/app.module.ts` existe.
- [ ] Configurar puerto mediante variable `PORT`.
- [ ] Habilitar CORS para `http://localhost:4200`.
- [ ] Habilitar global validation pipe.
- [ ] Habilitar transformación de DTOs.
- [ ] Habilitar whitelist de propiedades.
- [ ] Habilitar rechazo de propiedades no permitidas si se desea mayor estrictez.

Ejemplo esperado en `main.ts`:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  })
);
```

## Configuración backend

- [ ] Instalar `@nestjs/config`.
- [ ] Crear `backend/.env.example`.
- [ ] Crear `backend/src/config/database.config.ts`.
- [ ] Leer `DATABASE_PATH` desde variables de entorno.
- [ ] Leer `CORS_ORIGIN` desde variables de entorno.
- [ ] Leer `JWT_SECRET` desde variables de entorno, aunque sea mock.

`.env.example` sugerido:

```env
PORT=3000
NODE_ENV=development
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/taruca.sqlite
DATABASE_LOGGING=false
DATABASE_SYNCHRONIZE=false
JWT_SECRET=taruca-local-secret
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:4200
SEED_ON_BOOTSTRAP=true
```

## Health check

- [ ] Crear `HealthController`.
- [ ] Crear endpoint `GET /health`.
- [ ] Responder `{ "status": "ok" }`.
- [ ] Probar endpoint en navegador o con curl.

Comando:

```bash
curl http://localhost:3000/health
```

Resultado esperado:

```json
{
  "status": "ok"
}
```

## Criterio de aceptación de la fase

- [ ] `npm --workspace backend run start:dev` levanta backend.
- [ ] `GET /health` responde correctamente.
- [ ] Variables de entorno están documentadas.
- [ ] ValidationPipe global está activo.

Commit sugerido:

```bash
git add .
git commit -m "feat(backend): initialize nestjs api with config and health check"
```

---

# Fase 4 — Modelo de dominio y base de datos

Objetivo: implementar entidades coherentes con la prueba técnica y listas para persistir con TypeORM.

## Configurar TypeORM y SQLite

- [ ] Instalar TypeORM.
- [ ] Instalar driver SQLite.
- [ ] Configurar `TypeOrmModule.forRootAsync`.
- [ ] Crear carpeta `backend/data`.
- [ ] Agregar `backend/data/.gitkeep`.
- [ ] Confirmar que el archivo SQLite se genera localmente.
- [ ] Decidir si usar migraciones o `synchronize` en desarrollo.
- [ ] Documentar decisión en README.

## Entidades obligatorias o recomendadas

### Institution

- [ ] Crear `InstitutionEntity`.
- [ ] Campo `id` como UUID o string consistente.
- [ ] Campo `name` obligatorio.
- [ ] Campos `createdAt` y `updatedAt`.
- [ ] Relación con usuarios.
- [ ] Relación con cursos.
- [ ] Relación con alumnos.
- [ ] Relación con períodos.

### User

- [ ] Crear `UserEntity`.
- [ ] Campo `id`.
- [ ] Campo `name`.
- [ ] Campo `email` único.
- [ ] Campo `role`.
- [ ] Campo `institutionId`.
- [ ] Relación con institución.
- [ ] Relación con asignaturas como profesor.

### UserRole enum

- [ ] Crear enum `UserRole`.
- [ ] Agregar `DIRECTOR`.
- [ ] Agregar `UTP`.
- [ ] Agregar `TEACHER`.

### AcademicPeriod

- [ ] Crear `AcademicPeriodEntity`.
- [ ] Campo `id`.
- [ ] Campo `name`, por ejemplo `1er semestre 2025`.
- [ ] Campo `year`.
- [ ] Campo `isOpen` con default `true`.
- [ ] Campo `institutionId`.
- [ ] Timestamps.

### Course

- [ ] Crear `CourseEntity`.
- [ ] Campo `id`.
- [ ] Campo `name`, por ejemplo `1° Medio A`.
- [ ] Campo `institutionId`.
- [ ] Timestamps.

### Student

- [ ] Crear `StudentEntity`.
- [ ] Campo `id`.
- [ ] Campo `firstName`.
- [ ] Campo `lastName`.
- [ ] Campo `rut` opcional o único.
- [ ] Campo `institutionId`.
- [ ] Timestamps.

### Enrollment

- [ ] Crear `EnrollmentEntity`.
- [ ] Campo `id`.
- [ ] Campo `studentId`.
- [ ] Campo `courseId`.
- [ ] Campo `academicPeriodId`.
- [ ] Campo `institutionId`.
- [ ] Crear índice único `studentId + academicPeriodId`.
- [ ] Validar que permite saber en qué curso está un alumno durante un período.

### Subject

- [ ] Crear `SubjectEntity`.
- [ ] Campo `id`.
- [ ] Campo `name`.
- [ ] Campo `courseId`.
- [ ] Campo `academicPeriodId`.
- [ ] Campo `teacherId`.
- [ ] Campo `institutionId`.
- [ ] Timestamps.
- [ ] Índice recomendado `courseId + academicPeriodId`.

### Evaluation

- [ ] Crear `EvaluationEntity`.
- [ ] Campo `id`.
- [ ] Campo `name`.
- [ ] Campo `description` nullable.
- [ ] Campo `subjectId`.
- [ ] Campo `academicPeriodId`.
- [ ] Campo `order`.
- [ ] Timestamps.
- [ ] Índice único recomendado `subjectId + academicPeriodId + name`.

### Grade

- [ ] Crear `GradeEntity`.
- [ ] Campo `id`.
- [ ] Campo `studentId`.
- [ ] Campo `evaluationId`.
- [ ] Campo `score`.
- [ ] Timestamps.
- [ ] Índice único `studentId + evaluationId`.
- [ ] Constraint o validación de `score >= 1.0` y `score <= 7.0`.

## Reglas de consistencia

- [ ] Todas las entidades multiinstitución tienen `institutionId` cuando corresponde.
- [ ] Todas las consultas críticas filtran por `currentUser.institutionId`.
- [ ] `Grade` no duplica `subjectId` ni `periodId` si esos datos se obtienen por `Evaluation`.
- [ ] `Evaluation` pertenece a una asignatura y período.
- [ ] `Subject` pertenece a curso y período.
- [ ] `Enrollment` conecta alumno, curso y período.

## Migraciones o esquema

- [ ] Crear migración inicial si se usa flujo productivo.
- [ ] Incluir tablas principales.
- [ ] Incluir índices únicos.
- [ ] Incluir índices de consulta frecuentes.
- [ ] Incluir `CHECK(score >= 1.0 AND score <= 7.0)` si se implementa.
- [ ] Probar que la migración corre sin errores.

Comando sugerido:

```bash
npm --workspace backend run migration:run
```

## Criterio de aceptación de la fase

- [ ] TypeORM conecta con SQLite.
- [ ] Las entidades compilan.
- [ ] La base se crea correctamente.
- [ ] El modelo representa períodos, asignaturas, alumnos, evaluaciones y calificaciones.
- [ ] Las relaciones permiten calcular promedio por alumno/asignatura/período.

Commit sugerido:

```bash
git add .
git commit -m "feat(backend): add academic domain entities and sqlite config"
```

---

# Fase 5 — Seeds y datos demo

Objetivo: permitir que el evaluador vea la app funcionando inmediatamente después de levantarla.

## Configuración de seeds

- [ ] Crear carpeta `backend/src/database/seeds`.
- [ ] Crear `seed-dev.ts` o servicio equivalente.
- [ ] Leer variable `SEED_ON_BOOTSTRAP`.
- [ ] Evitar duplicar datos si el seed corre varias veces.
- [ ] Usar UUID válidos si los DTOs validan UUID.
- [ ] Documentar cómo reiniciar la base local.

## Datos mínimos de seed

### Institución

- [ ] Crear institución `Colegio Taruca Demo`.

### Usuarios

- [ ] Crear Directora Demo con rol `DIRECTOR`.
- [ ] Crear Jefa UTP Demo con rol `UTP`.
- [ ] Crear Profesor Demo con rol `TEACHER`.
- [ ] Asociar todos a la misma institución.
- [ ] Preparar tokens mockeados para cada uno.

### Período

- [ ] Crear período `1er semestre 2025`.
- [ ] Marcar `isOpen = true` inicialmente.

### Curso

- [ ] Crear curso `1° Medio A`.

### Asignatura

- [ ] Crear asignatura `Matemática`.
- [ ] Asociar a curso.
- [ ] Asociar a período.
- [ ] Asociar a Profesor Demo como `teacherId`.

### Alumnos

- [ ] Crear Ana Pérez.
- [ ] Crear Juan Soto.
- [ ] Crear Camila Rojas.
- [ ] Crear Diego Fernández.
- [ ] Crear Valentina Muñoz.
- [ ] Asociar todos a institución.

### Inscripciones

- [ ] Inscribir Ana Pérez en `1° Medio A` para el período.
- [ ] Inscribir Juan Soto en `1° Medio A` para el período.
- [ ] Inscribir Camila Rojas en `1° Medio A` para el período.
- [ ] Inscribir Diego Fernández en `1° Medio A` para el período.
- [ ] Inscribir Valentina Muñoz en `1° Medio A` para el período.

### Evaluaciones

- [ ] Crear `Prueba 1`.
- [ ] Crear `Control 1`.
- [ ] Crear `Trabajo práctico`.
- [ ] Asignar `order` correcto.

### Calificaciones demo

- [ ] Ana Pérez: notas sobre 5.5.
- [ ] Juan Soto: promedio bajo 4.0.
- [ ] Camila Rojas: promedio alto.
- [ ] Diego Fernández: promedio cercano a 4.0.
- [ ] Valentina Muñoz: promedio alto.

## Validaciones de seed

- [ ] Al levantar backend, los datos aparecen en SQLite.
- [ ] No se duplican registros al reiniciar.
- [ ] Hay al menos un alumno con promedio bajo `4.0`.
- [ ] Hay suficientes notas para probar promedio.
- [ ] Hay suficientes evaluaciones para probar la grilla.

## Criterio de aceptación de la fase

- [ ] La app tiene datos visibles sin carga manual.
- [ ] Se puede probar libro de clases apenas inicia el proyecto.
- [ ] Los datos demo permiten mostrar casos exitosos y casos de alerta.

Commit sugerido:

```bash
git add .
git commit -m "feat(backend): add reproducible demo seed data"
```

---

# Fase 6 — Autenticación JWT mockeada y autorización

Objetivo: simular autenticación y permisos de manera suficiente para la prueba.

## Modelo de usuario actual

- [ ] Crear interface `CurrentUser`.
- [ ] Incluir `id`.
- [ ] Incluir `name`.
- [ ] Incluir `email`.
- [ ] Incluir `role`.
- [ ] Incluir `institutionId`.

## Tokens mockeados

- [ ] Definir `mock-director-token`.
- [ ] Definir `mock-utp-token`.
- [ ] Definir `mock-teacher-token`.
- [ ] Mapear cada token a un usuario demo.
- [ ] Retornar `401 Unauthorized` si el token falta.
- [ ] Retornar `401 Unauthorized` si el token no existe.

## Guard de autenticación

- [ ] Crear `JwtAuthGuard` o `MockJwtAuthGuard`.
- [ ] Leer header `Authorization`.
- [ ] Validar formato `Bearer <token>`.
- [ ] Inyectar usuario actual en request.
- [ ] Aplicar guard a controladores protegidos.

## Decoradores

- [ ] Crear `@CurrentUser()`.
- [ ] Crear `@Roles()` si se usa guard de roles.
- [ ] Crear `RolesGuard`.

## Permisos por rol

### Director

- [ ] Puede ver todas las asignaturas de su institución.
- [ ] Puede gestionar todas las calificaciones de su institución.
- [ ] Puede abrir y cerrar períodos.

### UTP

- [ ] Puede ver todas las asignaturas de su institución.
- [ ] Puede gestionar todas las calificaciones de su institución.
- [ ] Puede abrir y cerrar períodos.

### Profesor

- [ ] Puede ver sus asignaturas.
- [ ] Puede gestionar calificaciones solo de sus asignaturas.
- [ ] No puede gestionar asignaturas de otro profesor.
- [ ] No puede abrir ni cerrar períodos.

## Aislamiento por institución

- [ ] Toda consulta filtra por `institutionId`.
- [ ] Toda creación asigna o valida `institutionId`.
- [ ] Toda actualización verifica pertenencia a institución.
- [ ] Toda eliminación verifica pertenencia a institución.
- [ ] Agregar test o validación manual de acceso cruzado si es posible.

## Criterio de aceptación de la fase

- [ ] Los endpoints protegidos requieren token.
- [ ] Los roles tienen permisos diferenciados.
- [ ] Un profesor no puede modificar asignaturas ajenas.
- [ ] Director y UTP pueden operar a nivel institución.

Commit sugerido:

```bash
git add .
git commit -m "feat(backend): add mocked jwt auth and role guards"
```

---

# Fase 7 — Períodos académicos

Objetivo: implementar el estado abierto/cerrado del período y su impacto en escrituras.

## Módulo de períodos

- [ ] Crear `AcademicPeriodsModule`.
- [ ] Crear `AcademicPeriodsController`.
- [ ] Crear `AcademicPeriodsService`.
- [ ] Crear DTO para cambio de estado.

## Endpoints

### Listar períodos

- [ ] Implementar `GET /academic-periods`.
- [ ] Filtrar por institución del usuario actual.
- [ ] Retornar períodos ordenados por año o creación.

### Cambiar estado

- [ ] Implementar `PATCH /academic-periods/:id/status`.
- [ ] Recibir body `{ "isOpen": false }`.
- [ ] Validar que solo `DIRECTOR` y `UTP` puedan cambiar estado.
- [ ] Retornar `403` si profesor intenta cambiar estado.
- [ ] Retornar `404` si período no existe o no pertenece a institución.
- [ ] Retornar período actualizado.

## Reglas asociadas

- [ ] Crear helper o método `assertPeriodIsOpen`.
- [ ] Usar ese helper antes de crear calificaciones.
- [ ] Usar ese helper antes de editar calificaciones.
- [ ] Usar ese helper antes de eliminar calificaciones.
- [ ] Usar ese helper antes de crear evaluaciones.
- [ ] Usar ese helper antes de editar evaluaciones.
- [ ] Usar ese helper antes de eliminar evaluaciones.

## Pruebas manuales

- [ ] Con token director, cerrar período exitosamente.
- [ ] Con token profesor, intentar cerrar período y recibir `403`.
- [ ] Con período cerrado, intentar crear nota y recibir `403`.
- [ ] Con período cerrado, consultar libro de clases y recibir `200`.
- [ ] Reabrir período y confirmar que se pueden crear notas nuevamente.

## Criterio de aceptación de la fase

- [ ] El período puede abrirse y cerrarse.
- [ ] Las consultas funcionan en período cerrado.
- [ ] Las escrituras se bloquean en período cerrado.

Commit sugerido:

```bash
git add .
git commit -m "feat(backend): add academic period status management"
```

---

# Fase 8 — Cursos, alumnos, inscripciones y asignaturas

Objetivo: preparar la información base para listar alumnos y asignaturas correctamente.

## Cursos

- [ ] Crear entidad `Course`.
- [ ] Crear repositorio o usar TypeORM repository.
- [ ] Relacionar curso con institución.
- [ ] Asegurar que asignaturas se vinculen a curso.

## Alumnos

- [ ] Crear entidad `Student`.
- [ ] Agregar método o campo calculado `fullName` si se desea.
- [ ] Relacionar alumno con institución.

## Inscripciones

- [ ] Crear entidad `Enrollment`.
- [ ] Relacionar alumno, curso y período.
- [ ] Crear índice único para evitar doble inscripción en mismo período.
- [ ] Implementar consulta de alumnos por curso y período.

## Asignaturas

- [ ] Crear `SubjectsModule`.
- [ ] Crear `SubjectsController`.
- [ ] Crear `SubjectsService`.
- [ ] Implementar `GET /subjects`.
- [ ] Permitir query opcional `courseId`.
- [ ] Permitir query opcional `academicPeriodId`.
- [ ] Para director/UTP, listar todas las asignaturas de la institución.
- [ ] Para profesor, listar solo asignaturas donde `teacherId = currentUser.id`.

## Validaciones importantes

- [ ] Validar que asignatura pertenezca a institución del usuario.
- [ ] Validar que curso pertenezca a institución del usuario.
- [ ] Validar que período pertenezca a institución del usuario.
- [ ] Validar que profesor vea solo sus asignaturas.

## Criterio de aceptación de la fase

- [ ] Se pueden consultar asignaturas visibles para cada rol.
- [ ] Se pueden obtener alumnos inscritos en el curso de una asignatura.
- [ ] El modelo permite calcular libro de clases.

Commit sugerido:

```bash
git add .
git commit -m "feat(backend): add subjects and enrollment queries"
```

---

# Fase 9 — Evaluaciones

Objetivo: modelar las columnas del libro de clases y asociarlas a una asignatura/período.

## Módulo de evaluaciones

- [ ] Crear `EvaluationsModule`.
- [ ] Crear `EvaluationsController`.
- [ ] Crear `EvaluationsService`.
- [ ] Crear DTOs de creación y actualización.

## DTO de creación

- [ ] `name` obligatorio.
- [ ] `description` opcional.
- [ ] `subjectId` obligatorio.
- [ ] `academicPeriodId` obligatorio.
- [ ] `order` opcional, entero y mayor o igual a `0`.
- [ ] Validar UUID si se eligió UUID real.

## Endpoints recomendados

### Crear evaluación

- [ ] Implementar `POST /evaluations`.
- [ ] Validar permisos sobre asignatura.
- [ ] Validar que período esté abierto.
- [ ] Validar que asignatura y período coincidan.
- [ ] Evitar duplicar nombre en misma asignatura/período.

### Actualizar evaluación

- [ ] Implementar `PATCH /evaluations/:id`.
- [ ] Validar permisos.
- [ ] Validar período abierto.
- [ ] Permitir editar nombre, descripción y orden.

### Eliminar evaluación

- [ ] Implementar `DELETE /evaluations/:id`.
- [ ] Validar permisos.
- [ ] Validar período abierto.
- [ ] Si tiene notas asociadas, responder `409 Conflict`.
- [ ] Si no tiene notas, eliminar.

## Importancia para el enunciado

- [ ] Documentar que el campo “nombre/descripción de calificación” del enunciado se resuelve en `Evaluation`.
- [ ] Documentar que `Grade` queda como valor numérico del alumno.
- [ ] Asegurar que el frontend muestre evaluaciones como columnas.

## Criterio de aceptación de la fase

- [ ] Se pueden crear columnas de evaluación.
- [ ] Las evaluaciones se muestran ordenadas.
- [ ] No se crean evaluaciones duplicadas en la misma asignatura/período.
- [ ] No se modifican evaluaciones si el período está cerrado.

Commit sugerido:

```bash
git add .
git commit -m "feat(backend): add evaluations for gradebook columns"
```

---

# Fase 10 — CRUD de calificaciones

Objetivo: implementar la funcionalidad central exigida por la prueba técnica.

## Módulo de calificaciones

- [ ] Crear `GradesModule`.
- [ ] Crear `GradesController`.
- [ ] Crear `GradesService`.
- [ ] Crear `CreateGradeDto`.
- [ ] Crear `UpdateGradeDto`.
- [ ] Crear DTOs de respuesta si se desea.

## DTO `CreateGradeDto`

- [ ] `studentId` obligatorio.
- [ ] `evaluationId` obligatorio.
- [ ] `score` obligatorio.
- [ ] `score` numérico.
- [ ] `score >= 1.0`.
- [ ] `score <= 7.0`.
- [ ] Limitar decimales si se decide aceptar solo un decimal.

Ejemplo:

```ts
export class CreateGradeDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  evaluationId: string;

  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(7)
  score: number;
}
```

## DTO `UpdateGradeDto`

- [ ] `score` opcional.
- [ ] Si viene, debe ser numérico.
- [ ] Si viene, debe estar entre `1.0` y `7.0`.
- [ ] Validar máximo de decimales si corresponde.

## Endpoints CRUD

### Crear calificación

- [ ] Implementar `POST /grades`.
- [ ] Validar DTO.
- [ ] Validar que estudiante existe.
- [ ] Validar que evaluación existe.
- [ ] Validar que evaluación pertenece a una asignatura visible para usuario.
- [ ] Validar que alumno pertenece al curso de la asignatura en ese período.
- [ ] Validar que período está abierto.
- [ ] Validar que no existe nota previa para `studentId + evaluationId`.
- [ ] Crear calificación.
- [ ] Retornar `201 Created`.

### Listar calificaciones

- [ ] Implementar `GET /grades`.
- [ ] Permitir filtro por `studentId`.
- [ ] Permitir filtro por `subjectId`.
- [ ] Permitir filtro por `academicPeriodId`.
- [ ] Permitir filtro por `evaluationId`.
- [ ] Filtrar por institución.
- [ ] Filtrar por permisos de usuario.

### Ver detalle

- [ ] Implementar `GET /grades/:id`.
- [ ] Retornar `404` si no existe.
- [ ] Retornar `403` si existe pero usuario no tiene permiso.
- [ ] Retornar calificación con evaluación y alumno si es útil.

### Actualizar calificación

- [ ] Implementar `PATCH /grades/:id`.
- [ ] Validar DTO.
- [ ] Validar permisos.
- [ ] Validar período abierto.
- [ ] Actualizar score.
- [ ] Retornar calificación actualizada.

### Eliminar calificación

- [ ] Implementar `DELETE /grades/:id`.
- [ ] Validar permisos.
- [ ] Validar período abierto.
- [ ] Eliminar calificación.
- [ ] Retornar `204 No Content` o respuesta controlada.

## Endpoint requerido: notas de alumno en asignatura

- [ ] Implementar `GET /students/:studentId/subjects/:subjectId/grades`.
- [ ] Recibir `academicPeriodId` como query param.
- [ ] Validar alumno.
- [ ] Validar asignatura.
- [ ] Validar permisos.
- [ ] Retornar notas del alumno en evaluaciones de esa asignatura/período.

## Casos de error

- [ ] Nota menor a `1.0` retorna `400`.
- [ ] Nota mayor a `7.0` retorna `400`.
- [ ] Estudiante inexistente retorna `404`.
- [ ] Evaluación inexistente retorna `404`.
- [ ] Período cerrado retorna `403`.
- [ ] Profesor sin permiso retorna `403`.
- [ ] Nota duplicada retorna `409`.
- [ ] Alumno no inscrito en el curso retorna `400`.

## Criterio de aceptación de la fase

- [ ] El CRUD de calificaciones funciona completo.
- [ ] Todas las reglas de negocio principales se aplican.
- [ ] Los errores HTTP son coherentes.

Commit sugerido:

```bash
git add .
git commit -m "feat(backend): add grades crud and business validations"
```

---

# Fase 11 — Libro de clases y promedios

Objetivo: entregar una respuesta optimizada para la grilla del frontend.

## Endpoint principal

- [ ] Implementar `GET /subjects/:subjectId/gradebook`.
- [ ] Recibir `academicPeriodId` como query param.
- [ ] Validar que asignatura existe.
- [ ] Validar que asignatura pertenece a institución del usuario.
- [ ] Validar permisos del usuario.
- [ ] Obtener curso de la asignatura.
- [ ] Obtener período académico.
- [ ] Obtener alumnos inscritos en curso/período.
- [ ] Obtener evaluaciones de asignatura/período ordenadas por `order`.
- [ ] Obtener calificaciones asociadas.
- [ ] Armar matriz alumno × evaluación.

## Promedio

- [ ] Crear utilidad `calculateAverage`.
- [ ] Si no hay notas, retornar `null`.
- [ ] Si hay notas, calcular media aritmética simple.
- [ ] Retornar `average` sin redondear o con precisión suficiente.
- [ ] Retornar `averageRounded` con un decimal.
- [ ] Calcular `isBelowPassingGrade`.
- [ ] Considerar bajo aprobación si `average !== null && average < 4.0`.

## Respuesta sugerida

- [ ] Incluir datos de asignatura.
- [ ] Incluir datos de curso.
- [ ] Incluir datos del período.
- [ ] Incluir `isOpen` del período.
- [ ] Incluir evaluaciones.
- [ ] Incluir estudiantes.
- [ ] Incluir calificaciones por estudiante.
- [ ] Incluir promedio y estado de aprobación.

Estructura esperada:

```json
{
  "subject": {
    "id": "...",
    "name": "Matemática",
    "course": {
      "id": "...",
      "name": "1° Medio A"
    },
    "academicPeriod": {
      "id": "...",
      "name": "1er semestre 2025",
      "isOpen": true
    }
  },
  "evaluations": [
    {
      "id": "...",
      "name": "Prueba 1",
      "description": "Unidad 1",
      "order": 1
    }
  ],
  "students": [
    {
      "id": "...",
      "fullName": "Ana Pérez",
      "grades": [
        {
          "id": "...",
          "evaluationId": "...",
          "score": 6.5
        }
      ],
      "average": 6.5,
      "averageRounded": 6.5,
      "isBelowPassingGrade": false
    }
  ]
}
```

## Optimización mínima

- [ ] Evitar N+1 queries innecesarias.
- [ ] Cargar evaluaciones en una consulta.
- [ ] Cargar alumnos en una consulta.
- [ ] Cargar notas en una consulta filtrada por evaluaciones y alumnos.
- [ ] Armar mapa por `studentId + evaluationId` en memoria.

## Criterio de aceptación de la fase

- [ ] El endpoint retorna todo lo necesario para la grilla.
- [ ] Los promedios son correctos.
- [ ] Los alumnos bajo 4.0 se identifican correctamente.
- [ ] Se respeta institución y permisos.

Commit sugerido:

```bash
git add .
git commit -m "feat(backend): add gradebook endpoint with averages"
```

---

# Fase 12 — Validaciones, errores y reglas de negocio

Objetivo: robustecer la API con validaciones coherentes y errores correctos.

## Validaciones de DTO

- [ ] Usar `class-validator` en todos los DTOs de entrada.
- [ ] Usar `@IsUUID()` si se usan UUID reales.
- [ ] Usar `@IsString()` para textos.
- [ ] Usar `@IsOptional()` para campos opcionales.
- [ ] Usar `@IsNumber()` para notas.
- [ ] Usar `@Min(1)` y `@Max(7)` para `score`.
- [ ] Usar `@IsBoolean()` para cambio de estado de período.

## Validaciones de servicio

- [ ] Validar existencia de recursos.
- [ ] Validar pertenencia a institución.
- [ ] Validar permisos por rol.
- [ ] Validar período abierto antes de escrituras.
- [ ] Validar inscripción del alumno al curso.
- [ ] Validar duplicado de nota.
- [ ] Validar coherencia entre asignatura y período.

## Errores HTTP

- [ ] Usar `BadRequestException` para payload inválido o alumno fuera del curso.
- [ ] Usar `UnauthorizedException` para token ausente o inválido.
- [ ] Usar `ForbiddenException` para permisos insuficientes o período cerrado.
- [ ] Usar `NotFoundException` para recursos inexistentes.
- [ ] Usar `ConflictException` para nota duplicada o eliminación bloqueada.

## Mensajes de error profesionales

- [ ] Mensaje claro para nota fuera de rango.
- [ ] Mensaje claro para período cerrado.
- [ ] Mensaje claro para falta de permisos.
- [ ] Mensaje claro para nota duplicada.
- [ ] Mensaje claro para alumno no inscrito.

Ejemplos:

```txt
La nota debe estar entre 1.0 y 7.0.
No se pueden modificar calificaciones porque el período está cerrado.
El usuario no tiene permisos para gestionar esta asignatura.
El alumno ya tiene una nota registrada para esta evaluación.
El alumno no pertenece al curso de la asignatura en este período.
```

## Criterio de aceptación de la fase

- [ ] La API no acepta datos inválidos.
- [ ] Los códigos HTTP coinciden con el tipo de error.
- [ ] Los mensajes son útiles para frontend y evaluador.

Commit sugerido:

```bash
git add .
git commit -m "refactor(backend): standardize validations and error handling"
```

---

# Fase 13 — Tests backend

Objetivo: cubrir el service principal y reglas de negocio exigidas por la prueba.

## Configuración de tests

- [ ] Confirmar que Jest funciona en backend.
- [ ] Confirmar script `npm --workspace backend run test`.
- [ ] Crear archivo `grades.service.spec.ts`.
- [ ] Mockear repositorios o usar testing module.
- [ ] Mantener tests rápidos y deterministas.

## Tests mínimos obligatorios

### Creación exitosa

- [ ] Test: crea una calificación válida.
- [ ] Verifica que se consulta estudiante.
- [ ] Verifica que se consulta evaluación.
- [ ] Verifica que se valida período abierto.
- [ ] Verifica que se guarda nota.
- [ ] Verifica que retorna score correcto.

### Rechazo de nota fuera de rango

- [ ] Test: rechaza nota menor a `1.0`.
- [ ] Test: rechaza nota mayor a `7.0`.
- [ ] Verifica que lanza `BadRequestException` o error de validación esperado.
- [ ] Verifica que no guarda datos inválidos.

### Cálculo de promedio

- [ ] Test: calcula promedio simple correctamente.
- [ ] Caso: `5.0`, `6.0`, `7.0` da `6.0`.
- [ ] Test: retorna `null` si no hay notas.
- [ ] Test: redondea correctamente si se implementa `averageRounded`.

## Tests recomendados adicionales

- [ ] Rechaza creación si período está cerrado.
- [ ] Rechaza creación si profesor no pertenece a asignatura.
- [ ] Rechaza nota duplicada para alumno/evaluación.
- [ ] Rechaza si alumno no está inscrito en curso.
- [ ] Gradebook retorna alumnos con evaluaciones y promedios.
- [ ] Gradebook marca `isBelowPassingGrade` cuando promedio menor a `4.0`.
- [ ] Director puede gestionar asignatura.
- [ ] UTP puede gestionar asignatura.
- [ ] Profesor puede gestionar solo su asignatura.

## Comandos

```bash
npm run test:backend
```

O directamente:

```bash
npm --workspace backend run test
```

## Criterio de aceptación de la fase

- [ ] Tests backend pasan.
- [ ] Se cubren los tres casos mínimos de la prueba.
- [ ] Hay al menos un test de regla de negocio adicional.

Commit sugerido:

```bash
git add .
git commit -m "test(backend): add grades service business rule tests"
```

---

# Fase 14 — Frontend base Angular

Objetivo: crear una app Angular moderna con standalone components y rutas claras.

## Crear aplicación frontend

- [ ] Crear proyecto Angular dentro de `frontend`.
- [ ] Usar Angular reciente.
- [ ] Usar standalone components.
- [ ] Confirmar que `frontend/package.json` existe.
- [ ] Confirmar que `frontend/src/main.ts` existe.
- [ ] Confirmar que `frontend/src/app/app.component.ts` existe.
- [ ] Confirmar que `frontend/src/app/app.routes.ts` existe.

## Configuración frontend

- [ ] Configurar `environment.ts`.
- [ ] Configurar `environment.development.ts`.
- [ ] Definir `apiUrl`.
- [ ] Definir token mockeado inicial.
- [ ] Configurar `proxy.conf.json` si se usa proxy.
- [ ] Confirmar que `npm --workspace frontend run start` levanta Angular.

Ejemplo environment:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  mockToken: 'mock-director-token'
};
```

## Estructura recomendada

- [ ] Crear carpeta `core`.
- [ ] Crear carpeta `shared`.
- [ ] Crear carpeta `features/gradebook`.
- [ ] Crear modelos compartidos.
- [ ] Crear servicios de API.
- [ ] Crear componentes de feature.

Estructura sugerida:

```txt
frontend/src/app/
├── core/
│   ├── interceptors/
│   ├── models/
│   └── services/
├── shared/
│   ├── components/
│   └── utils/
└── features/
    └── gradebook/
        ├── pages/
        ├── components/
        ├── services/
        └── models/
```

## Criterio de aceptación de la fase

- [ ] Angular levanta en `http://localhost:4200`.
- [ ] App usa standalone components.
- [ ] Existe estructura clara por feature.

Commit sugerido:

```bash
git add .
git commit -m "feat(frontend): initialize angular standalone app"
```

---

# Fase 15 — Integración frontend con API

Objetivo: conectar Angular con NestJS de forma limpia y tipada.

## Modelos TypeScript

- [ ] Crear `AcademicPeriod`.
- [ ] Crear `Subject`.
- [ ] Crear `Evaluation`.
- [ ] Crear `Student`.
- [ ] Crear `Grade`.
- [ ] Crear `GradebookResponse`.
- [ ] Crear `CreateGradePayload`.
- [ ] Crear `UpdateGradePayload`.
- [ ] Crear `CreateEvaluationPayload` si se implementa desde frontend.

## Interceptor de autenticación

- [ ] Crear `auth-token.interceptor.ts`.
- [ ] Leer token desde environment o servicio.
- [ ] Agregar header `Authorization: Bearer <token>`.
- [ ] Registrar interceptor en configuración Angular.

## Servicio de usuario actual

- [ ] Crear `CurrentUserService`.
- [ ] Permitir elegir o simular rol si es útil para demo.
- [ ] Exponer token actual.
- [ ] Documentar tokens disponibles.

## Servicio API

Crear `GradebookApiService` con métodos:

- [ ] `getSubjects()`.
- [ ] `getAcademicPeriods()`.
- [ ] `getGradebook(subjectId, academicPeriodId)`.
- [ ] `createGrade(payload)`.
- [ ] `updateGrade(id, payload)`.
- [ ] `deleteGrade(id)`.
- [ ] `createEvaluation(payload)` si se expone.
- [ ] `setPeriodStatus(periodId, isOpen)`.

## Manejo de errores

- [ ] Crear helper para extraer mensaje de error HTTP.
- [ ] Mostrar mensaje claro si backend retorna validación.
- [ ] Mostrar mensaje claro si backend retorna `403`.
- [ ] Mostrar mensaje claro si backend no está disponible.

## Criterio de aceptación de la fase

- [ ] Frontend consume backend con token mockeado.
- [ ] Los modelos están tipados.
- [ ] Los errores de API se pueden mostrar al usuario.

Commit sugerido:

```bash
git add .
git commit -m "feat(frontend): add typed api integration and auth interceptor"
```

---

# Fase 16 — Pantalla de libro de clases

Objetivo: implementar la vista principal solicitada por la prueba.

## Página principal

- [ ] Crear `GradebookPageComponent`.
- [ ] Configurar ruta principal hacia la página.
- [ ] Cargar asignatura demo por defecto o selector.
- [ ] Cargar período demo por defecto o selector.
- [ ] Llamar `getGradebook` al iniciar.
- [ ] Manejar estado de carga.
- [ ] Manejar estado de error.
- [ ] Manejar estado vacío.

## Grilla

- [ ] Crear `GradeGridComponent`.
- [ ] Mostrar alumnos en filas.
- [ ] Mostrar evaluaciones en columnas.
- [ ] Mostrar notas existentes.
- [ ] Mostrar celda vacía si no existe nota.
- [ ] Mostrar columna promedio.
- [ ] Mostrar `Sin notas` cuando promedio es `null`.
- [ ] Mostrar promedio redondeado a un decimal.
- [ ] Destacar visualmente promedio bajo `4.0`.
- [ ] Emitir evento al seleccionar nota para editar.
- [ ] Emitir evento al seleccionar celda vacía para crear.

## UX mínima

- [ ] Título claro de la pantalla.
- [ ] Mostrar nombre de asignatura.
- [ ] Mostrar nombre de curso.
- [ ] Mostrar nombre de período.
- [ ] Mostrar estado del período: abierto/cerrado.
- [ ] Mostrar leyenda de promedio bajo.
- [ ] Mostrar botón o acción para refrescar.

## Diseño visual

- [ ] Tabla legible.
- [ ] Encabezados fijos o claros.
- [ ] Alineación numérica de notas.
- [ ] Estado bajo 4.0 claramente visible.
- [ ] Modo responsive básico o scroll horizontal.

## Criterio de aceptación de la fase

- [ ] Se ve libro de clases completo.
- [ ] La grilla refleja alumnos, evaluaciones, notas y promedios.
- [ ] Un alumno bajo 4.0 se identifica visualmente.

Commit sugerido:

```bash
git add .
git commit -m "feat(frontend): add gradebook grid page"
```

---

# Fase 17 — Formulario de ingreso y edición de notas

Objetivo: permitir crear y editar calificaciones con validación frontend.

## Componente de formulario

- [ ] Crear `GradeFormComponent`.
- [ ] Usar Angular Reactive Forms.
- [ ] Usar typed forms si la versión lo permite.
- [ ] Recibir modo `create` o `edit`.
- [ ] Recibir alumno seleccionado.
- [ ] Recibir evaluación seleccionada.
- [ ] Recibir nota existente si se edita.
- [ ] Emitir submit con payload tipado.
- [ ] Emitir cancelación.

## Campos para crear nota

- [ ] Alumno.
- [ ] Evaluación.
- [ ] Nota `score`.
- [ ] Si se permite crear evaluación desde formulario, incluir nombre/descripción.

## Validaciones frontend

- [ ] Nota requerida.
- [ ] Nota numérica.
- [ ] Nota mínima `1.0`.
- [ ] Nota máxima `7.0`.
- [ ] Mensaje claro si está fuera de rango.
- [ ] Botón guardar deshabilitado si el formulario es inválido.

Mensaje sugerido:

```txt
La nota debe estar entre 1.0 y 7.0.
```

## Flujo crear nota

- [ ] Seleccionar celda vacía o botón nueva nota.
- [ ] Mostrar formulario.
- [ ] Ingresar nota válida.
- [ ] Enviar `POST /grades`.
- [ ] Refrescar libro de clases.
- [ ] Mostrar mensaje de éxito.
- [ ] Ver promedio actualizado.

## Flujo editar nota

- [ ] Seleccionar nota existente.
- [ ] Mostrar formulario con valor actual.
- [ ] Cambiar nota.
- [ ] Enviar `PATCH /grades/:id`.
- [ ] Refrescar libro de clases.
- [ ] Mostrar mensaje de éxito.
- [ ] Ver promedio actualizado.

## Flujo eliminar nota, si se implementa en UI

- [ ] Mostrar acción eliminar.
- [ ] Pedir confirmación.
- [ ] Enviar `DELETE /grades/:id`.
- [ ] Refrescar libro de clases.
- [ ] Mostrar mensaje de éxito.

## Criterio de aceptación de la fase

- [ ] Se puede crear una nota válida.
- [ ] Se puede editar una nota existente.
- [ ] No se puede enviar nota fuera de rango desde frontend.
- [ ] El promedio se actualiza después de guardar.

Commit sugerido:

```bash
git add .
git commit -m "feat(frontend): add typed grade form with validations"
```

---

# Fase 18 — Estados de UI, período cerrado y permisos

Objetivo: hacer que la interfaz comunique claramente estados, errores y restricciones.

## Banner de período

- [ ] Crear `PeriodStatusBannerComponent`.
- [ ] Mostrar `Período abierto` cuando `isOpen = true`.
- [ ] Mostrar `Período cerrado` cuando `isOpen = false`.
- [ ] Explicar que en período cerrado la vista es solo lectura.
- [ ] Deshabilitar creación/edición/eliminación si período cerrado.

## Estados de carga

- [ ] Mostrar spinner o mensaje `Cargando libro de clases...`.
- [ ] Evitar tabla incompleta mientras carga.
- [ ] Permitir reintentar si falla.

## Estados de error

- [ ] Error cuando backend no responde.
- [ ] Error cuando usuario no tiene permisos.
- [ ] Error cuando payload es inválido.
- [ ] Error cuando período está cerrado.
- [ ] Error cuando nota está duplicada.

## Estados vacíos

- [ ] Mensaje si no hay alumnos.
- [ ] Mensaje si no hay evaluaciones.
- [ ] Mensaje si alumno no tiene notas.

## Permisos en UI

- [ ] Si rol es profesor, mostrar solo sus asignaturas.
- [ ] Si rol es director/UTP, permitir ver todas las asignaturas.
- [ ] Si usuario no puede editar, ocultar o deshabilitar acciones.
- [ ] Aunque la UI oculte acciones, backend debe seguir validando permisos.

## Cambio de estado de período desde UI, si se implementa

- [ ] Mostrar acción solo a director/UTP.
- [ ] Permitir cerrar período.
- [ ] Permitir abrir período.
- [ ] Pedir confirmación antes de cerrar.
- [ ] Refrescar libro de clases después del cambio.

## Criterio de aceptación de la fase

- [ ] La UI no permite editar cuando el período está cerrado.
- [ ] Los errores se muestran de forma comprensible.
- [ ] El usuario entiende qué está pasando en cada estado.

Commit sugerido:

```bash
git add .
git commit -m "feat(frontend): add period status and ui state handling"
```

---

# Fase 19 — Tests frontend

Objetivo: cumplir la prueba con tests de componente o servicio que cubran casos relevantes.

## Configuración

- [ ] Confirmar framework de tests frontend.
- [ ] Confirmar script `npm --workspace frontend run test`.
- [ ] Configurar entorno si se necesita.
- [ ] Evitar tests frágiles dependientes de estilos exactos.

## Tests mínimos recomendados

### GradeFormComponent

- [ ] Test: invalida nota menor a `1.0`.
- [ ] Test: invalida nota mayor a `7.0`.
- [ ] Test: formulario válido emite payload correcto.
- [ ] Test: botón guardar se deshabilita si formulario inválido.

### GradeGridComponent

- [ ] Test: muestra alumnos y evaluaciones.
- [ ] Test: muestra promedio redondeado.
- [ ] Test: muestra indicador visual cuando promedio menor a `4.0`.
- [ ] Test: emite evento al seleccionar nota.

### GradebookApiService

- [ ] Test: llama endpoint correcto de gradebook.
- [ ] Test: envía payload correcto al crear nota.
- [ ] Test: envía payload correcto al actualizar nota.

## Caso de borde obligatorio sugerido

- [ ] Nota `0.9` debe ser inválida.
- [ ] Nota `7.1` debe ser inválida.
- [ ] Promedio `3.9` debe marcar bajo aprobación.
- [ ] Promedio `4.0` no debe marcar bajo aprobación.

## Comandos

```bash
npm run test:frontend
```

O directamente:

```bash
npm --workspace frontend run test
```

## Criterio de aceptación de la fase

- [ ] Hay al menos 1–2 tests no triviales.
- [ ] Al menos un test cubre validación o caso borde.
- [ ] Tests frontend pasan localmente.

Commit sugerido:

```bash
git add .
git commit -m "test(frontend): add grade form and gradebook validation tests"
```

---

# Fase 20 — QA manual end-to-end

Objetivo: revisar la aplicación como lo haría un evaluador.

## Levantamiento completo

- [ ] Borrar base SQLite local si se quiere probar desde cero.
- [ ] Ejecutar `npm install` desde raíz.
- [ ] Ejecutar `npm start` desde raíz.
- [ ] Confirmar backend en `http://localhost:3000`.
- [ ] Confirmar frontend en `http://localhost:4200`.
- [ ] Confirmar `GET /health`.
- [ ] Confirmar que seeds aparecen en UI.

## Flujo libro de clases

- [ ] Abrir frontend.
- [ ] Ver asignatura Matemática.
- [ ] Ver curso `1° Medio A`.
- [ ] Ver período `1er semestre 2025`.
- [ ] Ver alumnos demo.
- [ ] Ver evaluaciones demo.
- [ ] Ver notas demo.
- [ ] Ver promedios calculados.
- [ ] Ver al menos un alumno bajo `4.0` destacado.

## Flujo crear nota válida

- [ ] Seleccionar alumno/evaluación sin nota o crear caso.
- [ ] Ingresar nota `6.5`.
- [ ] Guardar.
- [ ] Confirmar éxito.
- [ ] Confirmar que la grilla se actualiza.
- [ ] Confirmar que promedio cambia correctamente.

## Flujo nota inválida

- [ ] Intentar ingresar `0.9`.
- [ ] Confirmar que frontend muestra error.
- [ ] Confirmar que no se envía o backend rechaza.
- [ ] Intentar ingresar `7.1`.
- [ ] Confirmar error claro.

## Flujo editar nota

- [ ] Seleccionar nota existente.
- [ ] Cambiar a `5.8`.
- [ ] Guardar.
- [ ] Confirmar que nota cambió.
- [ ] Confirmar promedio actualizado.

## Flujo eliminar nota, si aplica

- [ ] Seleccionar nota existente.
- [ ] Eliminar.
- [ ] Confirmar acción.
- [ ] Confirmar que celda queda vacía.
- [ ] Confirmar promedio actualizado o `null` si no quedan notas.

## Flujo período cerrado

- [ ] Cerrar período con token director o UTP.
- [ ] Confirmar banner de período cerrado.
- [ ] Intentar crear nota.
- [ ] Confirmar que UI bloquea acción.
- [ ] Si se fuerza por API, confirmar `403`.
- [ ] Intentar editar nota.
- [ ] Confirmar bloqueo.
- [ ] Confirmar que consultar libro de clases sigue funcionando.
- [ ] Reabrir período.
- [ ] Confirmar que edición vuelve a estar disponible.

## Flujo permisos

- [ ] Probar con `mock-director-token`.
- [ ] Confirmar que puede ver todas las asignaturas.
- [ ] Confirmar que puede editar notas.
- [ ] Confirmar que puede cerrar período.
- [ ] Probar con `mock-utp-token`.
- [ ] Confirmar permisos equivalentes a directivo.
- [ ] Probar con `mock-teacher-token`.
- [ ] Confirmar que solo ve sus asignaturas.
- [ ] Confirmar que no puede cerrar período.
- [ ] Confirmar que no puede gestionar asignaturas ajenas si existen datos para probarlo.

## Verificación por API con curl

- [ ] Probar health.
- [ ] Probar obtener períodos.
- [ ] Probar obtener asignaturas.
- [ ] Probar obtener gradebook.
- [ ] Probar crear nota válida.
- [ ] Probar crear nota inválida.
- [ ] Probar cerrar período.
- [ ] Probar escribir con período cerrado.

Ejemplo:

```bash
curl -H "Authorization: Bearer mock-director-token" \
  http://localhost:3000/subjects
```

## Criterio de aceptación de la fase

- [ ] La demo completa funciona sin intervención técnica adicional.
- [ ] Los flujos principales están revisados.
- [ ] Los errores esperados aparecen correctamente.

Commit sugerido:

```bash
git add .
git commit -m "chore: verify end-to-end demo flow"
```

---

# Fase 21 — Calidad, lint, build y formato

Objetivo: entregar un proyecto que compile, sea legible y tenga señales de calidad profesional.

## Formato

- [ ] Configurar Prettier si no viene configurado.
- [ ] Formatear backend.
- [ ] Formatear frontend.
- [ ] Evitar archivos con formato inconsistente.

## Lint

- [ ] Configurar ESLint backend.
- [ ] Configurar ESLint frontend.
- [ ] Ejecutar lint backend.
- [ ] Ejecutar lint frontend.
- [ ] Corregir errores relevantes.

Comando:

```bash
npm run lint
```

## Build

- [ ] Ejecutar build backend.
- [ ] Ejecutar build frontend.
- [ ] Corregir errores TypeScript.
- [ ] Confirmar que ambos builds pasan desde raíz.

Comando:

```bash
npm run build
```

## Tests

- [ ] Ejecutar tests backend.
- [ ] Ejecutar tests frontend.
- [ ] Ejecutar test raíz.

Comando:

```bash
npm test
```

## Revisión de código

- [ ] Eliminar `console.log` innecesarios.
- [ ] Eliminar código muerto.
- [ ] Eliminar archivos temporales.
- [ ] Revisar nombres de variables.
- [ ] Revisar imports no usados.
- [ ] Revisar manejo de errores.
- [ ] Revisar consistencia de idioma en código.
- [ ] Revisar consistencia de nombres de carpetas.

## Criterio de aceptación de la fase

- [ ] `npm run build` pasa.
- [ ] `npm test` pasa.
- [ ] `npm run lint` pasa o sus excepciones están justificadas.
- [ ] El código está limpio y revisable.

Commit sugerido:

```bash
git add .
git commit -m "chore: polish code quality and build checks"
```

---

# Fase 22 — README profesional

Objetivo: dejar una documentación que venda bien la solución y facilite la evaluación.

## Contenido obligatorio del README

- [ ] Nombre del proyecto.
- [ ] Resumen funcional.
- [ ] Stack técnico.
- [ ] Arquitectura general.
- [ ] Estructura del repositorio.
- [ ] Requisitos locales.
- [ ] Instrucciones de instalación.
- [ ] Instrucciones para levantar backend y frontend.
- [ ] Scripts disponibles.
- [ ] Variables de entorno.
- [ ] Modelo de dominio.
- [ ] Modelo de base de datos.
- [ ] Reglas de negocio.
- [ ] Autenticación mockeada.
- [ ] Roles y permisos.
- [ ] Endpoints principales.
- [ ] Frontend y componentes.
- [ ] Backend y módulos.
- [ ] Seeds y datos iniciales.
- [ ] Tests.
- [ ] Decisiones de diseño.
- [ ] Supuestos.
- [ ] Qué quedó fuera.
- [ ] Mejoras futuras.
- [ ] Checklist de entrega.
- [ ] Guía del video.

## Ajustes finos recomendados

- [ ] Incluir URL real del repositorio público.
- [ ] Marcar checklist con `[x]` solo si está realmente implementado.
- [ ] Aclarar `Evaluation` vs `Grade`.
- [ ] Asegurar que ejemplos de IDs coincidan con validadores reales.
- [ ] Agregar comandos verificados.
- [ ] Agregar resultado esperado de tests/build.
- [ ] Evitar lenguaje demasiado hipotético si ya está implementado.
- [ ] Cambiar “se recomienda” por “la solución implementa” cuando corresponda.

## Sección de estado de entrega

- [ ] Agregar resumen de qué está implementado.
- [ ] Agregar limitaciones conocidas.
- [ ] Agregar cómo revisar la demo.

Ejemplo:

```md
## Estado de la entrega

Esta versión implementa el alcance obligatorio de la prueba técnica:

- Backend NestJS + TypeORM + SQLite.
- Frontend Angular con standalone components.
- JWT mockeado con roles.
- CRUD de calificaciones.
- Libro de clases con promedio por alumno.
- Bloqueo de edición en período cerrado.
- Tests unitarios backend y frontend.

Limitaciones conocidas:

- No hay autenticación real.
- No hay ponderaciones.
- No hay auditoría de cambios.
```

## Criterio de aceptación de la fase

- [ ] El README permite levantar el proyecto sin explicación adicional.
- [ ] El README justifica decisiones de diseño.
- [ ] El README declara supuestos y mejoras futuras.
- [ ] El README no promete funcionalidades inexistentes.

Commit sugerido:

```bash
git add README.md
git commit -m "docs: add complete technical readme"
```

---

# Fase 23 — Video de entrega

Objetivo: preparar una presentación clara de máximo 5 minutos.

## Preparación antes de grabar

- [ ] Proyecto levantado localmente.
- [ ] Datos demo cargados.
- [ ] Navegador abierto en frontend.
- [ ] Terminal lista para mostrar comandos si hace falta.
- [ ] README abierto en sección de arquitectura o decisiones.
- [ ] Evitar pestañas innecesarias.
- [ ] Tener guion breve.

## Guion sugerido de 5 minutos

### Minuto 0:00–0:45 — Contexto y arquitectura

- [ ] Presentar el módulo de calificaciones.
- [ ] Mencionar monorepo.
- [ ] Mencionar NestJS + TypeORM + SQLite.
- [ ] Mencionar Angular standalone.
- [ ] Mencionar JWT mockeado.

### Minuto 0:45–1:30 — Modelo de dominio

- [ ] Explicar período académico abierto/cerrado.
- [ ] Explicar curso, asignatura y alumno.
- [ ] Explicar `Evaluation` como columna del libro.
- [ ] Explicar `Grade` como nota del alumno.
- [ ] Explicar promedio simple.

### Minuto 1:30–3:30 — Demo funcional

- [ ] Mostrar libro de clases.
- [ ] Mostrar alumnos y evaluaciones.
- [ ] Mostrar promedio calculado.
- [ ] Mostrar alumno bajo 4.0.
- [ ] Crear una nota válida.
- [ ] Editar una nota.
- [ ] Intentar nota inválida.
- [ ] Cerrar período y mostrar bloqueo.

### Minuto 3:30–4:30 — Decisiones destacadas

- [ ] SQLite para facilitar evaluación local.
- [ ] Separación `Evaluation` y `Grade`.
- [ ] Validación en frontend y backend.
- [ ] Roles y permisos con JWT mockeado.
- [ ] Monorepo con `npm start` desde raíz.

### Minuto 4:30–5:00 — Mejoras futuras

- [ ] Autenticación real.
- [ ] Ponderaciones.
- [ ] Auditoría.
- [ ] Importación/exportación.
- [ ] Soft delete.

## Checklist técnico antes de grabar

- [ ] `npm start` funcionando.
- [ ] UI sin errores visibles.
- [ ] API sin errores en terminal.
- [ ] Datos demo en estado inicial correcto.
- [ ] Período abierto al iniciar demo.
- [ ] Hay al menos una nota editable.
- [ ] Hay al menos un alumno bajo 4.0.

## Criterio de aceptación de la fase

- [ ] Video dura máximo 5 minutos.
- [ ] Se entiende arquitectura.
- [ ] Se demuestra funcionalidad central.
- [ ] Se explican decisiones y mejoras futuras.

Commit sugerido si agregas link en README:

```bash
git add README.md
git commit -m "docs: add delivery video reference"
```

---

# Fase 24 — Repositorio público y entrega

Objetivo: dejar la entrega lista para enviar.

## Repositorio GitHub

- [ ] Crear repo público.
- [ ] Confirmar que no hay secretos en el repo.
- [ ] Confirmar que `.env` no está versionado.
- [ ] Confirmar que SQLite generada no está versionada.
- [ ] Confirmar que `node_modules` no está versionado.
- [ ] Confirmar que README aparece correctamente en GitHub.
- [ ] Confirmar que Mermaid se renderiza o no rompe lectura.
- [ ] Confirmar que los comandos copiados desde README funcionan.

## Historial de commits

- [ ] Evitar un solo commit gigante.
- [ ] Tener commits por configuración, backend, frontend, tests y docs.
- [ ] Mensajes de commit claros.
- [ ] Revisar `git log --oneline`.

Ejemplo de historial profesional:

```txt
chore: setup monorepo structure
feat(backend): initialize nestjs api with config and health check
feat(backend): add academic domain entities and sqlite config
feat(backend): add reproducible demo seed data
feat(backend): add mocked jwt auth and role guards
feat(backend): add grades crud and business validations
feat(backend): add gradebook endpoint with averages
feat(frontend): initialize angular standalone app
feat(frontend): add typed api integration and auth interceptor
feat(frontend): add gradebook grid page
feat(frontend): add typed grade form with validations
test(backend): add grades service business rule tests
test(frontend): add grade form and gradebook validation tests
docs: add complete technical readme
```

## Push final

- [ ] Ejecutar `git status`.
- [ ] Confirmar working tree limpio.
- [ ] Hacer push a GitHub.
- [ ] Abrir GitHub y confirmar que los archivos están.
- [ ] Copiar URL pública del repo.
- [ ] Agregar link del video si corresponde.

Comandos:

```bash
git status
git push origin main
```

## Entrega

- [ ] Enviar URL del repositorio público.
- [ ] Enviar URL del video si se pide por separado.
- [ ] Confirmar que README incluye instrucciones claras.

## Criterio de aceptación de la fase

- [ ] El evaluador puede clonar, instalar, ejecutar y revisar el proyecto.
- [ ] El repositorio está limpio y profesional.

---

# Fase 25 — Checklist final de auditoría

Objetivo: validar cumplimiento contra el enunciado antes de enviar.

## Backend — cumplimiento funcional

- [ ] NestJS implementado.
- [ ] TypeORM implementado.
- [ ] SQLite configurado.
- [ ] DTOs explícitos con validaciones.
- [ ] CRUD de calificaciones completo.
- [ ] Crear calificación.
- [ ] Listar calificaciones.
- [ ] Ver detalle de calificación.
- [ ] Actualizar calificación.
- [ ] Eliminar calificación.
- [ ] Listar alumnos de asignatura con promedio.
- [ ] Listar calificaciones de alumno en asignatura.
- [ ] Abrir/cerrar período.
- [ ] Nota fuera de rango retorna error.
- [ ] Promedio calculado como media simple.
- [ ] Errores `400`, `403`, `404`, `409` usados correctamente.
- [ ] Tests unitarios del service principal.

## Frontend — cumplimiento funcional

- [ ] Angular reciente.
- [ ] Standalone components.
- [ ] Vista de libro de clases.
- [ ] Alumnos en filas.
- [ ] Evaluaciones en columnas.
- [ ] Notas visibles.
- [ ] Promedio visible por alumno.
- [ ] Promedio actualizado al crear/editar.
- [ ] Indicación visual bajo 4.0.
- [ ] Formulario de ingreso de notas.
- [ ] Formulario de edición de notas.
- [ ] Validación frontend rango `1.0` a `7.0`.
- [ ] Mensaje de error claro.
- [ ] Formulario tipado.
- [ ] Tests frontend no triviales.
- [ ] Al menos un test de validación o caso borde.

## Autenticación y autorización

- [ ] JWT mockeado.
- [ ] Usuario actual mockeado.
- [ ] Rol incluido en usuario actual.
- [ ] Institución incluida en usuario actual.
- [ ] Profesor restringido a sus asignaturas.
- [ ] Directivo puede ver todas las asignaturas.
- [ ] Usuario no puede acceder a datos de otra institución.

## Documentación

- [ ] README con instrucciones para levantar backend y frontend.
- [ ] README con decisiones de diseño.
- [ ] README con supuestos.
- [ ] README con qué quedó fuera.
- [ ] README con mejoras futuras.
- [ ] README con comandos rápidos.
- [ ] README con tokens mockeados.
- [ ] README con endpoints principales.
- [ ] README con tests.

## Calidad de entrega

- [ ] `npm install` probado desde raíz.
- [ ] `npm start` probado desde raíz.
- [ ] `npm test` probado desde raíz.
- [ ] `npm run build` probado desde raíz.
- [ ] Repo público.
- [ ] Commits ordenados.
- [ ] Sin secretos.
- [ ] Sin base SQLite generada versionada.
- [ ] Sin `node_modules` versionado.
- [ ] Video máximo 5 minutos.

## Prueba desde cero recomendada

Ejecutar en una carpeta limpia:

```bash
git clone <url-del-repo>
cd taruca-calificaciones
npm install
npm start
```

Luego abrir:

```txt
http://localhost:4200
```

Y verificar:

- [ ] Se ve la app.
- [ ] Se ve libro de clases.
- [ ] Se puede crear nota.
- [ ] Se puede editar nota.
- [ ] Se calcula promedio.
- [ ] Se bloquea período cerrado.

---

# Backlog opcional si queda tiempo

Estas mejoras no son necesarias para cumplir el alcance base, pero pueden sumar puntos si se implementan bien y sin romper lo principal.

## Mejoras backend

- [ ] Migraciones TypeORM completas en vez de `synchronize`.
- [ ] Soft delete para calificaciones.
- [ ] Auditoría de cambios de notas.
- [ ] Tabla `grade_audit_logs`.
- [ ] Tests de integración de endpoints.
- [ ] Swagger/OpenAPI.
- [ ] Paginación en listados.
- [ ] Filtros avanzados.
- [ ] Guard global de institución.
- [ ] Mejor manejo centralizado de excepciones.

## Mejoras frontend

- [ ] Selector de curso.
- [ ] Selector de asignatura.
- [ ] Selector de período.
- [ ] Cambio de rol demo desde UI.
- [ ] Edición inline directa en tabla.
- [ ] Toasts de éxito/error.
- [ ] Confirmación antes de eliminar.
- [ ] Skeleton loading.
- [ ] Mejor responsive.
- [ ] Accesibilidad básica con labels y aria.

## Mejoras funcionales

- [ ] Ponderaciones por evaluación.
- [ ] Tipos de evaluación.
- [ ] Importar notas desde CSV.
- [ ] Exportar libro de clases a CSV.
- [ ] Exportar a Excel.
- [ ] Exportar a PDF.
- [ ] Reporte de alumnos en riesgo.
- [ ] Historial de cambios por nota.

## Mejoras de entrega

- [ ] Capturas en README.
- [ ] Diagrama de arquitectura en README.
- [ ] Diagrama ER en README.
- [ ] Tabla de endpoints más completa.
- [ ] Link al video en README.
- [ ] Sección “Cómo revisar rápido en 2 minutos”.

---

# Comandos rápidos de verificación

```bash
npm install
npm start
npm test
npm run build
npm run lint
```

Backend:

```bash
npm run start:backend
npm run test:backend
npm run build:backend
```

Frontend:

```bash
npm run start:frontend
npm run test:frontend
npm run build:frontend
```

Health check:

```bash
curl http://localhost:3000/health
```

API con token:

```bash
curl -H "Authorization: Bearer mock-director-token" \
  http://localhost:3000/subjects
```

---

# Resultado esperado final

Al completar este checklist, deberías tener una entrega con:

- Proyecto fullstack funcional.
- Arquitectura clara.
- Backend con reglas de negocio sólidas.
- Frontend con libro de clases usable.
- Tests relevantes.
- README profesional.
- Repositorio público ordenado.
- Demo en video convincente.

