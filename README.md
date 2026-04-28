# TaskFlow Pro

TaskFlow Pro es una prueba técnica full stack para gestionar proyectos, tareas y usuarios en equipos pequeños. Incluye autenticación por JWT en cookie `httpOnly`, autorización por roles, CRUD principal, dashboard, Swagger y soporte con Docker Compose.

## Stack

- Frontend: Next.js 15.5, React 19, TypeScript, Bootstrap 5.3
- Backend: Node.js, Express, TypeScript, Zod, JWT, bcryptjs
- Base de datos: MySQL 8, Prisma ORM
- Tooling: Swagger UI, Morgan, Winston, Docker Compose

## Estructura

```txt
taskflow/
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
├── README.md
└── .gitignore
```

## Requisitos previos

- Node.js 20+
- npm 10+
- MySQL 8 local o Docker Desktop

## Variables de entorno

1. Backend:
   - Copia [backend/.env.example](/C:/proyectos/taskflow/backend/.env.example) a `backend/.env`
2. Frontend:
   - Copia [frontend/.env.example](/C:/proyectos/taskflow/frontend/.env.example) a `frontend/.env.local`

## Instalación manual

1. Backend:
   ```bash
   cd backend
   npm install
   npm run prisma:generate
   npm run prisma:migrate -- --name init
   npm run prisma:seed
   npm run dev
   ```
2. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Abre:
   - Frontend: [http://localhost:3001](http://localhost:3001)
   - Backend API: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
   - Swagger: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Docker Compose

```bash
docker compose up --build
```

Servicios levantados:

- MySQL 8 en `localhost:3306`
- Backend en `http://localhost:3000`
- Frontend en `http://localhost:3001`

## Seeder

Credenciales iniciales:

- Admin: `admin@taskflow.com` / `Admin123!`
- Project Manager: `maria@taskflow.com` / `Maria123!`
- Developer: `kevin@taskflow.com` / `Kevin123!`

Además se crean:

- 2 proyectos
- 5 tareas con distintos estados y prioridades

## Endpoints principales

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/users`
- `GET /api/v1/projects`
- `GET /api/v1/tasks`
- `GET /api/v1/dashboard`

## Roles

- `ADMIN`: gestiona usuarios, proyectos y tareas globalmente.
- `PROJECT_MANAGER`: gestiona solo sus proyectos y tareas asociadas.
- `DEVELOPER`: ve y edita sus tareas asignadas; puede crear tareas autoasignadas dentro de proyectos donde ya participa.

## Comandos útiles

Backend:

```bash
npm run dev
npm run build
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
```

## Documentación adicional

- Arquitectura: [docs/ARCHITECTURE.md](/C:/proyectos/taskflow/docs/ARCHITECTURE.md)
- Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
