# Taruca Agents Pack

Este paquete contiene agentes expertos para desarrollar y revisar el proyecto **Taruca — Módulo de Calificaciones**.

## Archivos

- `../AGENTS.md`: guía principal y contexto común para todos los agentes.
- `backend-expert.agent.md`: agente experto backend NestJS + TypeORM + SQLite.
- `frontend-expert.agent.md`: agente experto frontend Angular standalone.
- `supervisor.agent.md`: agente supervisor técnico, producto y entrega.
- `testing-qa.agent.md`: agente de testing, QA manual y regresión.
- `handoff-template.md`: plantilla de traspaso entre agentes.

## Uso sugerido

Copia `AGENTS.md` en la raíz del repositorio y conserva esta carpeta `agents/`.

```txt
taruca-calificaciones/
├── AGENTS.md
├── agents/
│   ├── backend-expert.agent.md
│   ├── frontend-expert.agent.md
│   ├── supervisor.agent.md
│   ├── testing-qa.agent.md
│   └── handoff-template.md
├── backend/
└── frontend/
```

Para trabajar con un asistente, pega primero el contexto común de `AGENTS.md` y luego el archivo del agente especializado que corresponda.
