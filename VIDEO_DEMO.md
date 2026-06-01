# Guion Video Final (5 minutos)

## Objetivo
Guion literal para grabar la entrega del módulo de calificaciones de Taruca en máximo 5 minutos.

---

## 0:00 - 0:20 | Presentación

**Decir:**

"Hola, soy [tu nombre]. En este video presento la prueba técnica de Taruca: el módulo de calificaciones.  
Implementé un monorepo con backend en NestJS y frontend en Angular standalone, con autenticación JWT mockeada y control de acceso por rol."

---

## 0:20 - 1:00 | Arquitectura general

**Mostrar en pantalla:** estructura del repo (`backend`, `frontend`, `README.md`, `DATABASE.md`).

**Decir:**

"La solución está dividida en dos workspaces:
- Backend: NestJS + TypeORM + SQLite.
- Frontend: Angular 21 con standalone components y formularios reactivos tipados.

En backend separé controladores, servicios y entidades.  
La validación se hace con DTOs y class-validator.  
La base se inicializa con migración y seed demo para levantar rápido el flujo funcional."

---

## 1:00 - 1:45 | Backend y reglas de negocio

**Mostrar en pantalla:** Swagger en `/api/docs` y endpoints clave.

**Decir:**

"Los endpoints mínimos requeridos están implementados:
- CRUD de calificaciones en `/grades`.
- Libro de clases por asignatura en `/subjects/:subjectId/gradebook`.
- Notas de alumno por asignatura en `/subjects/:subjectId/students/:studentId/grades`.
- Apertura y cierre de período en `/academic-periods/:id/status`.

Reglas de negocio clave:
- Nota válida entre 1.0 y 7.0.
- Promedio aritmético simple por alumno/asignatura/período.
- Si no hay notas, el promedio es null.
- Si el período está cerrado, se bloquea creación, edición y eliminación.
- Profesor solo gestiona sus asignaturas; UTP y Director gestionan toda su institución."

---

## 1:45 - 3:50 | Demo funcional frontend

### Paso A: Login y roles (1:45 - 2:10)
**Mostrar:** login y perfiles mock.

**Decir:**

"Ingreso con perfiles mock para validar permisos por rol:
- Profesora de Matemáticas.
- UTP."

### Paso B: Libro de clases (2:10 - 2:50)
**Mostrar:** `Gradebook`.

**Decir:**

"Esta es la vista principal del libro de clases: grilla alumno por evaluación.  
Cada fila es un alumno, cada columna una evaluación, y al final está el promedio.  
El promedio bajo 4.0 se destaca visualmente en rojo."

### Paso C: Validación de notas y edición (2:50 - 3:15)
**Mostrar:** abrir edición de nota y probar valor fuera de rango.

**Decir:**

"La edición de notas se hace desde formulario.  
Si intento ingresar un valor fuera de rango, por ejemplo 8 o 0, el frontend bloquea el guardado con validación explícita entre 1.0 y 7.0."

### Paso D: Período cerrado y bloqueo preventivo (3:15 - 3:35)
**Mostrar:** estado período cerrado.

**Decir:**

"Con período cerrado, el sistema pasa a modo solo lectura:
- Celdas deshabilitadas.
- Botón ‘Nueva Evaluación’ deshabilitado.
- No se abre modal de creación.
Además, backend también rechaza escrituras si alguien intenta forzarlas."

### Paso E: Consistencia dashboard por rol (3:35 - 3:50)
**Mostrar:** dashboard con docente y luego UTP.

**Decir:**

"En dashboard, ‘Asignaturas visibles’ coincide con ‘Carga Académica Actual’.  
Docente ve 1 asignatura; UTP ve 2.  
Con esto evitamos inconsistencias de contexto por permisos."

---

## 3:50 - 4:25 | Tests y calidad

**Mostrar:** terminal con `npm test` y `npm run build`.

**Decir:**

"En calidad técnica, el proyecto incluye pruebas backend y frontend, y ambos builds compilan correctamente.  
Se cubren casos críticos como:
- creación válida de calificación,
- rechazo de nota fuera de rango,
- cálculo de promedio,
- restricciones por rol y período cerrado."

---

## 4:25 - 5:00 | Cierre: decisiones y mejoras

**Decir:**

"Las decisiones que más destaco son:
1. Reglas de negocio centralizadas en servicios backend con validación estricta.
2. Control de permisos por rol e institución para multi-tenant.
3. Bloqueo preventivo en frontend más validación defensiva en backend.

Si tuviera más tiempo, agregaría:
- pruebas E2E completas,
- auditoría de cambios de calificaciones,
- métricas reales para dashboard académico.

Gracias."

---

## Checklist antes de grabar

- [ ] Cerrar apps que consumen CPU/RAM (evitar lag en grabación).
- [ ] Tener abierto: `README.md`, Swagger (`/api/docs`) y frontend (`/app/gradebook`).
- [ ] Confirmar backend y frontend arriba con `npm start`.
- [ ] Verificar rápido `npm test` y `npm run build`.
- [ ] Preparar credenciales mock visibles en login.
- [ ] Mantener el video entre 4:30 y 5:00.
