# DATABASE.md — Taruca Calificaciones

## Motor y estrategia
- Motor local: SQLite con driver `better-sqlite3`.
- ORM: TypeORM.
- `synchronize`: `false`.
- Esquema inicial: migración `InitialSchema1710000000000`.
- Seed: carga automática al iniciar backend (`SEED_ON_BOOTSTRAP=true` por defecto).

Ruta de base local:
- `backend/data/taruca.sqlite`

## Entidades persistidas
- `institutions`
- `users`
- `academic_periods`
- `courses`
- `students` (con `rut` opcional y `is_active` para soft delete)
- `enrollments`
- `subjects`
- `evaluations`
- `grades`

## Relaciones clave
- `users.institution_id -> institutions.id`
- `academic_periods.institution_id -> institutions.id`
- `courses.institution_id -> institutions.id`
- `students.institution_id -> institutions.id`
- `enrollments.student_id -> students.id`
- `enrollments.course_id -> courses.id`
- `enrollments.academic_period_id -> academic_periods.id`
- `subjects.course_id -> courses.id`
- `subjects.academic_period_id -> academic_periods.id`
- `subjects.teacher_id -> users.id`
- `evaluations.subject_id -> subjects.id`
- `evaluations.academic_period_id -> academic_periods.id`
- `grades.student_id -> students.id`
- `grades.evaluation_id -> evaluations.id`

## Restricciones de integridad implementadas
- `grades.score` con check: `score >= 1.0 AND score <= 7.0`.
- `students.rut` opcional, validado con regex en backend.
- `students.is_active` boolean (default true) para soft delete.
- Índice único: `grades(student_id, evaluation_id)`.
- Índice único: `enrollments(student_id, academic_period_id)`.
- Índice único: `evaluations(subject_id, academic_period_id, name)`.
- Índice único: `users(email)`.

## Modelo de autorización aplicado por servicio
La autorización no se resuelve solo con constraints SQL; se refuerza en servicios backend:
- Scope por `currentUser.institutionId`.
- Profesor limitado a asignaturas donde `subjects.teacher_id === currentUser.id`.
- Director y UTP con gestión de asignaturas de su institución.

## Reglas de negocio reflejadas en persistencia + servicio
1. Nota en rango `1.0..7.0`.
2. Una única nota por alumno/evaluación.
3. Alumno debe estar inscrito en curso/período de la asignatura.
4. Período cerrado bloquea `POST/PATCH/DELETE` de notas.
5. Promedio simple calculado en capa de aplicación.
6. Sin notas => promedio `null`.

## Seed demo
El seed inicial crea:
- Institución demo.
- Usuarios demo: director, utp, teacher, teacher-other.
- Período 2026 abierto.
- Curso `8vo Básico A`.
- 35 alumnos con nombres chilenos realistas, RUT y distribución variada de calificaciones (sobresalientes, buenos, promedio, bajo promedio y con notas faltantes).
- 2 alumnos inactivos (soft delete demo).
- Asignaturas: Matemáticas (teacher), Historia (teacher-other).
- Evaluaciones de Matemáticas: `Prueba 1`, `Control 1`, `Trabajo práctico`.
- ~90 notas distribuidas para validar promedios, riesgo y edge cases.

IDs demo y tokens mock están definidos en:
- `backend/src/database/seed/constants.ts`

## Operación
Desde raíz:
```bash
npm install
npm start
```

Solo backend:
```bash
npm run start:backend
```

Build + tests:
```bash
npm run build
npm test
```

## Evolución sugerida
- Para producción: PostgreSQL + migraciones versionadas por entorno.
- Agregar auditoría de cambios de nota.
- Añadir índices compuestos adicionales si crece volumen de consultas por tenant/período.
