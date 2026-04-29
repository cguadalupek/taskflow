# TaskFlow Pro Architecture

## Resumen

TaskFlow Pro se construyó como un monorepo simple con dos aplicaciones separadas:

- `backend/`: API REST versionada en `/api/v1`
- `frontend/`: interfaz Next.js con App Router y guards por sesión

La meta de esta versión es priorizar una entrega funcional, entendible y defendible en entrevista antes que una plataforma demasiado abstracta.

## Justificación del stack

- Next.js 15 permite construir una UI rápida con routing claro y despliegue estándar.
- Express mantiene el backend simple.
- Prisma acelera modelado, relaciones y acceso seguro a MySQL.
- Zod centraliza la validación de entrada.
- JWT en cookie `httpOnly` simplifica el flujo de autenticación entre frontend y backend sin exponer el token en `localStorage`.

## Arquitectura general

### Backend

Patrón usado: `controller -> service -> prisma`

- `routes/`: define endpoints, validación y middlewares
- `controllers/`: traduce request/response sin lógica de negocio pesada
- `services/`: concentra permisos, reglas y operaciones Prisma
- `middlewares/`: auth, roles, sanitización, validación y manejo de errores
- `utils/`: helpers de respuesta, JWT, logging y reglas comunes

### Frontend

- `app/`: páginas del App Router
- `components/`: shell, guards, formularios y badges reutilizables
- `services/api.ts`: cliente `fetch` con `credentials: include`
- `types/`: contratos de UI para entidades y envelopes de API

## Autenticación y autorización

- `POST /auth/login` valida credenciales, firma un JWT y lo guarda en cookie `taskflow_token`.
- `requireAuth` verifica cookie, valida token y vuelve a cargar al usuario desde la base.
- `authorizeRoles` cubre permisos de alto nivel por rol.
- Las reglas finas de acceso a proyectos y tareas viven en los servicios para evitar duplicación.

## Modelo de datos

- `User`
  - soft delete con `deleted_at`
  - roles: `ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`
- `Project`
  - pertenece a un owner
  - estados: `ACTIVE`, `ARCHIVED`
- `Task`
  - pertenece a un proyecto
  - tiene creador y asignado
  - estados: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`
  - prioridades: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

## Reglas clave de negocio

- `ADMIN` tiene control total.
- `PROJECT_MANAGER` solo administra proyectos propios y tareas dentro de esos proyectos.
- `DEVELOPER` solo ve tareas asignadas, puede editar campos básicos de sus tareas y crear tareas autoasignadas en proyectos donde ya participa.
- Las transiciones de estado de tarea son secuenciales hacia adelante.

## Trade-offs

- No se implementó la entidad `Comment` en v1.
- La documentación Swagger es intencionalmente ligera pero suficiente para navegar la API.
- El borrado de proyectos se resolvió como archivado, evitando cascadas y pérdida accidental de historial.

## Mejoras futuras

- Comentarios por tarea
- Tests automatizados unitarios e integración
- Refresh tokens o sesiones revocables
- Búsqueda por texto y filtros más completos
- UI con modales y flujos más refinados
