# Taruca Agents Pack — Módulo de Calificaciones

Set de agentes especializados para desarrollar, revisar y entregar el proyecto **Taruca — Módulo de Calificaciones** de forma ordenada y profesional.

Estos agentes están pensados para usarse en herramientas como ChatGPT, Cursor, Claude Code, GitHub Copilot Chat u otro asistente de desarrollo. Cada archivo funciona como una instrucción base que se puede copiar en el contexto del agente correspondiente.

---

## 1. Objetivo del pack

Coordinar el desarrollo fullstack del módulo de calificaciones usando cuatro roles:

| Agente | Propósito |
|---|---|
| `backend-expert.agent.md` | Implementar y revisar backend NestJS, TypeORM, SQLite, API REST, reglas de negocio y tests backend. |
| `frontend-expert.agent.md` | Implementar y revisar frontend Angular, standalone components, libro de clases, formularios, UX y tests frontend. |
| `supervisor.agent.md` | Coordinar el proyecto, dividir tareas, validar alcance, revisar entregables, mantener coherencia y preparar entrega. |
| `testing-qa.agent.md` | Diseñar y ejecutar estrategia de pruebas, QA manual, casos borde, regresión y criterios de aceptación. |

---

## 2. Contexto común del proyecto

Taruca es una plataforma SaaS para instituciones educativas chilenas. El módulo de calificaciones permite que profesores registren notas y que directivos hagan seguimiento del rendimiento académico.

El proyecto se implementa como monorepo con:

```txt
taruca-calificaciones/
├── backend/   NestJS + TypeORM + SQLite
├── frontend/  Angular standalone components
├── README.md
├── DATABASE.md
└── CHECKLIST_DESARROLLO_TARUCA.md
```

### Stack obligatorio

Backend:

- NestJS.
- TypeScript.
- TypeORM.
- SQLite como base local.
- DTOs con `class-validator`.
- JWT mockeado.
- Jest.

Frontend:

- Angular reciente.
- Standalone components.
- TypeScript.
- Reactive Forms tipados.
- HttpClient.
- Tests unitarios o de componentes.

Entrega:

- Repositorio Git público.
- Commits ordenados.
- README con instrucciones, decisiones, supuestos y mejoras futuras.
- Video máximo 5 minutos.

---

## 3. Alcance funcional obligatorio

### Backend

Debe existir:

- CRUD de calificaciones.
- Endpoint para listar alumnos de una asignatura con promedio calculado.
- Endpoint para listar calificaciones de un alumno en una asignatura.
- Endpoint para abrir o cerrar un período académico.
- Validación de nota entre `1.0` y `7.0`.
- Promedio aritmético simple por alumno/asignatura/período.
- DTOs explícitos con validaciones.
- Errores HTTP correctos: `400`, `401`, `403`, `404`, `409` según corresponda.
- Tests unitarios del service principal.

### Frontend

Debe existir:

- Libro de clases tipo grilla: alumno × evaluación.
- Columna de promedio por alumno.
- Indicador visual claro cuando el promedio es menor que `4.0`.
- Formulario para crear y editar notas.
- Validación frontend de rango `1.0` a `7.0`.
- Formulario tipado con Angular Reactive Forms.
- 1 a 2 tests no triviales de componente o servicio.

---

## 4. Modelo de dominio compartido

Entidades principales:

| Entidad | Responsabilidad |
|---|---|
| `Institution` | Institución educativa y límite de acceso multi-tenant. |
| `User` | Usuario con rol e institución. |
| `AcademicPeriod` | Período académico abierto o cerrado. |
| `Course` | Curso de la institución. |
| `Student` | Alumno de la institución. |
| `Enrollment` | Inscripción de alumno en curso y período. |
| `Subject` | Asignatura asociada a curso, período y profesor. |
| `Evaluation` | Columna del libro de clases, por ejemplo `Prueba 1`. |
| `Grade` | Nota numérica de un alumno para una evaluación. |

Decisión clave:

- `Evaluation` guarda el nombre o descripción de la evaluación.
- `Grade` guarda la nota de un alumno para esa evaluación.

Esto evita duplicar `Prueba 1`, `Control 1` o `Trabajo práctico` en cada nota individual.

---

## 5. Reglas de negocio no negociables

1. Una nota válida cumple `1.0 <= score <= 7.0`.
2. El promedio es media aritmética simple.
3. Si un alumno no tiene notas, el promedio debe ser `null`, no `0`.
4. La nota mínima de aprobación visual es `4.0`.
5. Un período cerrado permite lectura, pero bloquea creación, edición y eliminación.
6. Un alumno solo puede recibir nota si está inscrito en el curso de la asignatura.
7. Debe existir como máximo una nota por alumno y evaluación.
8. Profesor solo gestiona sus asignaturas.
9. Director y UTP pueden gestionar asignaturas de su institución.
10. Toda consulta debe respetar `currentUser.institutionId`.
11. No implementar login real; usar JWT mockeado salvo que el supervisor indique lo contrario.
12. No agregar ponderaciones ni tipos de evaluación al alcance base.

---

## 6. Convenciones comunes

### Idioma

- Documentación y comunicación: español.
- Código, nombres de clases, archivos, variables y endpoints: inglés.
- Mensajes de error visibles para usuario: español cuando estén en frontend.

### Estilo de código

- TypeScript estricto donde sea posible.
- Controladores livianos.
- Servicios con lógica de negocio.
- DTOs explícitos.
- Componentes pequeños y reutilizables.
- Validación en frontend y backend.
- Tests para reglas críticas.

### Git

Usar commits pequeños y descriptivos:

```txt
chore: setup monorepo with backend and frontend
feat(backend): add academic domain entities and sqlite config
feat(backend): add grades crud and validations
feat(backend): add gradebook endpoint with averages
feat(backend): add mocked jwt auth and role guards
feat(frontend): add gradebook page and api service
feat(frontend): add grade form with typed validations
test(backend): add grades service unit tests
test(frontend): add grade form validation tests
docs: add architecture and setup instructions
```

---

## 7. Comandos esperados

Desde la raíz:

```bash
npm install
npm start
npm test
npm run build
```

Servicios:

```txt
Backend:  http://localhost:3000
Frontend: http://localhost:4200
SQLite:   backend/data/taruca.sqlite
```

---

## 8. Protocolo de trabajo entre agentes

Todo agente debe responder con una estructura clara cuando entregue trabajo técnico:

```md
## Resumen
Qué se hizo o qué se recomienda.

## Archivos impactados
- ruta/archivo.ts: motivo del cambio.

## Decisiones
- Decisión tomada y justificación.

## Validaciones
- Comandos ejecutados.
- Tests agregados o actualizados.

## Riesgos o pendientes
- Riesgos detectados.
- Pendientes concretos.
```

Cuando un agente derive trabajo a otro, debe usar:

```md
## Handoff para <agente>

### Contexto
...

### Objetivo
...

### Restricciones
...

### Criterios de aceptación
- [ ] ...

### Archivos relevantes
- ...
```

---

## 9. Enrutamiento recomendado

| Tipo de tarea | Agente principal | Agente revisor |
|---|---|---|
| Crear entidad TypeORM | Backend Expert | Supervisor |
| Crear migración o seed | Backend Expert | Testing QA |
| Crear endpoint | Backend Expert | Testing QA |
| Crear guard de roles | Backend Expert | Supervisor |
| Crear servicio Angular API | Frontend Expert | Testing QA |
| Crear grilla de notas | Frontend Expert | Supervisor |
| Crear formulario tipado | Frontend Expert | Testing QA |
| Definir alcance | Supervisor | Backend/Frontend según caso |
| Preparar video | Supervisor | Testing QA |
| Diseñar casos de prueba | Testing QA | Supervisor |
| Revisar entrega final | Supervisor | Testing QA |

---

## 10. Definición de terminado del proyecto

El proyecto está listo cuando:

- [ ] `npm install` funciona desde la raíz.
- [ ] `npm start` levanta backend y frontend.
- [ ] Backend responde en `http://localhost:3000`.
- [ ] Frontend responde en `http://localhost:4200`.
- [ ] SQLite se crea o inicializa correctamente.
- [ ] Existen seeds demo suficientes.
- [ ] CRUD de calificaciones funciona.
- [ ] Libro de clases muestra alumnos, evaluaciones, notas y promedios.
- [ ] Promedio bajo `4.0` se destaca visualmente.
- [ ] Nota fuera de rango se rechaza en frontend y backend.
- [ ] Período cerrado bloquea escritura.
- [ ] Profesor solo gestiona sus asignaturas.
- [ ] Director y UTP pueden gestionar todas las asignaturas de su institución.
- [ ] Tests backend pasan.
- [ ] Tests frontend pasan.
- [ ] README está actualizado.
- [ ] DATABASE.md está alineado con entidades y migraciones.
- [ ] Checklist de desarrollo está actualizado.
- [ ] Video demuestra arquitectura, decisiones, demo y mejoras futuras.

---

## 11. Uso sugerido

1. Usar `supervisor.agent.md` para dividir el trabajo en tickets.
2. Pasar cada ticket técnico al agente especialista correspondiente.
3. Pedir a `testing-qa.agent.md` que genere o revise pruebas antes de cerrar cada bloque.
4. Volver al supervisor para verificar alcance, documentación y entrega.

