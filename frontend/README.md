# Taruca Frontend — Módulo de Calificaciones

Angular 21 standalone SPA que alimenta el libro de calificaciones del platforma Taruca para instituciones educativas chilenas.

## Stack

| Tecnología | Detalle |
|---|---|
| Angular 21 | Standalone components, signals-ready |
| Reactive Forms | Tipado strict con `FormGroup` |
| HttpClient | Proxy `/api` → backend en puerto 3000 |
| CSS puro | Sin frameworks de estilos |
| Vitest | Tests unitarios |

## Vistas

| Ruta | Componente | Descripción |
|---|---|---|
| `/login` | `LoginPageComponent` | Autenticación mock con perfiles de prueba |
| `/forgot-password` | `ForgotPasswordPageComponent` | Recuperación de contraseña |
| `/app/dashboard` | `DashboardPageComponent` | KPIs: asignaturas, períodos, indicadores |
| `/app/gradebook` | `GradebookPageComponent` | Libro de calificaciones con grilla alumno × evaluación |
| `/app/data` | `DataOverviewPageComponent` | Vista general de asignaturas y períodos |
| `/app/students/:id` | `StudentDetailsPageComponent` | Detalle de calificaciones por alumno |

## Servicios core

| Servicio | Responsabilidad |
|---|---|
| `CurrentUserService` | Token mock en `localStorage`, perfiles de prueba |
| `AuthApiService` | `POST /api/auth/forgot-password` |
| `GradebookApiService` | CRUD de calificaciones, libro de clases, asignaturas |
| `AuthTokenInterceptor` | Inyecta `Authorization: Bearer <token>` en cada request |
| `authGuard` / `guestGuard` | Protección de rutas por estado de autenticación |

## Autenticación mock

4 perfiles precargados — click para autocompletar el formulario:

| Email | Rol | Token |
|---|---|---|
| `director@taruca.cl` | DIRECTOR | `director-token` |
| `utp@taruca.cl` | UTP | `utp-token` |
| `teacher@taruca.cl` | TEACHER | `teacher-token` |
| `teacher-other@taruca.cl` | TEACHER | `teacher-other-token` |

## Desarrollo

```bash
npm run start:frontend   # ng serve en puerto 4200
npm run test:frontend    # Vitest
npm run build:frontend   # Production build → dist/
```

Proxy configurado en `proxy.conf.json`: `/api` → `http://localhost:3000`.

## Arquitectura de componentes

```
AppComponent (router-outlet raíz)
├── guestGuard → LoginPageComponent
└── authGuard → AppShellComponent (sidebar + router-outlet)
    ├── DashboardPageComponent
    ├── GradebookPageComponent
    │   ├── GradeGridComponent
    │   ├── GradeFormComponent
    │   └── PeriodStatusBannerComponent
    └── DataOverviewPageComponent
```

## Estados por vista

Todas las vistas que consumen API siguen el patrón:

```
loading = true
  ├── Éxito → loading = false, datos poblados
  ├── Error → loading = false, error = mensaje
  └── Vacío → loading = false, datos = []
```

## Scripts disponibles (workspace)

```bash
npm run ng --workspace frontend -- <comando>   # Ejecuta Angular CLI
npm run start:frontend                          # Alias para ng serve
npm run test:frontend                          # Vitest (--watch=false)
```
