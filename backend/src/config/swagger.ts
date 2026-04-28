import { ProjectStatus, Role, TaskPriority, TaskStatus } from "@prisma/client";
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { env } from "./env";
import { loginSchema, registerSchema } from "../validators/authValidators";
import { idParamSchema, paginationQuerySchema } from "../validators/commonValidators";
import { createProjectSchema, projectListQuerySchema, updateProjectSchema } from "../validators/projectValidators";
import { createTaskSchema, taskListQuerySchema, taskStatusSchema, updateTaskSchema } from "../validators/taskValidators";
import { createUserSchema, updateProfileSchema, updateUserSchema, userListQuerySchema } from "../validators/userValidators";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "taskflow_token",
  description: "Cookie creada despues de hacer login en /auth/login.",
});

const roleSchema = z.nativeEnum(Role).openapi({
  example: Role.ADMIN,
});

const projectStatusSchema = z.nativeEnum(ProjectStatus).openapi({
  example: ProjectStatus.ACTIVE,
});

const taskStatusEnumSchema = z.nativeEnum(TaskStatus).openapi({
  example: TaskStatus.TODO,
});

const taskPrioritySchema = z.nativeEnum(TaskPriority).openapi({
  example: TaskPriority.HIGH,
});

const paginationMetaSchema = registry.register(
  "PaginationMeta",
  z.object({
    page: z.number().int().openapi({ example: 1 }),
    limit: z.number().int().openapi({ example: 10 }),
    total: z.number().int().openapi({ example: 45 }),
    totalPages: z.number().int().openapi({ example: 5 }),
  }),
);

const basicUserSchema = registry.register(
  "BasicUser",
  z.object({
    id: z.number().int().openapi({ example: 1 }),
    name: z.string().openapi({ example: "Administrador General" }),
    email: z.string().email().openapi({ example: "admin@taskflow.com" }),
    role: roleSchema,
  }),
);

const publicUserSchema = registry.register(
  "PublicUser",
  basicUserSchema.extend({
    avatarUrl: z.string().nullable().openapi({ example: null }),
    deletedAt: z.string().datetime().nullable().openapi({ example: null }),
    createdAt: z.string().datetime().openapi({ example: "2026-04-28T13:48:25.709Z" }),
    updatedAt: z.string().datetime().openapi({ example: "2026-04-28T13:48:25.709Z" }),
  }),
);

const projectSummarySchema = registry.register(
  "ProjectSummary",
  z.object({
    id: z.number().int().openapi({ example: 3 }),
    name: z.string().openapi({ example: "Rediseno del sitio web" }),
    description: z.string().openapi({ example: "Actualizacion de la landing page y del sitio de marketing." }),
    status: projectStatusSchema,
    owner: basicUserSchema,
    createdAt: z.string().datetime().openapi({ example: "2026-04-28T13:48:25.709Z" }),
    updatedAt: z.string().datetime().openapi({ example: "2026-04-28T13:48:25.709Z" }),
    _count: z.object({
      tasks: z.number().int().openapi({ example: 3 }),
    }),
  }),
);

const projectDetailSchema = registry.register(
  "ProjectDetail",
  z.object({
    id: z.number().int().openapi({ example: 3 }),
    name: z.string().openapi({ example: "Rediseno del sitio web" }),
    description: z.string().openapi({ example: "Actualizacion de la landing page y del sitio de marketing." }),
    status: projectStatusSchema,
    owner: basicUserSchema,
    createdAt: z.string().datetime().openapi({ example: "2026-04-28T13:48:25.709Z" }),
    updatedAt: z.string().datetime().openapi({ example: "2026-04-28T13:48:25.709Z" }),
    tasks: z.array(
      z.object({
        id: z.number().int().openapi({ example: 6 }),
        title: z.string().openapi({ example: "Definir secciones de la pagina principal" }),
        description: z.string().openapi({
          example: "Desglosar las secciones finales de la pagina principal para contenido y estructura.",
        }),
        status: taskStatusEnumSchema,
        priority: taskPrioritySchema,
        projectId: z.number().int().openapi({ example: 3 }),
        assignedToId: z.number().int().openapi({ example: 6 }),
        createdById: z.number().int().openapi({ example: 5 }),
        dueDate: z.string().datetime().openapi({ example: "2026-05-01T13:48:25.709Z" }),
        createdAt: z.string().datetime().openapi({ example: "2026-04-28T13:48:25.709Z" }),
        updatedAt: z.string().datetime().openapi({ example: "2026-04-28T13:48:25.709Z" }),
        assignedTo: basicUserSchema,
        createdBy: basicUserSchema,
      }),
    ),
  }),
);

const taskSchema = registry.register(
  "Task",
  z.object({
    id: z.number().int().openapi({ example: 6 }),
    title: z.string().openapi({ example: "Definir secciones de la pagina principal" }),
    description: z.string().openapi({
      example: "Desglosar las secciones finales de la pagina principal para contenido y estructura.",
    }),
    status: taskStatusEnumSchema,
    priority: taskPrioritySchema,
    projectId: z.number().int().openapi({ example: 3 }),
    assignedToId: z.number().int().openapi({ example: 6 }),
    createdById: z.number().int().openapi({ example: 5 }),
    dueDate: z.string().datetime().openapi({ example: "2026-05-01T13:48:25.709Z" }),
    createdAt: z.string().datetime().openapi({ example: "2026-04-28T13:48:25.709Z" }),
    updatedAt: z.string().datetime().openapi({ example: "2026-04-28T13:48:25.709Z" }),
    project: z.object({
      id: z.number().int().openapi({ example: 3 }),
      name: z.string().openapi({ example: "Rediseno del sitio web" }),
      description: z.string().openapi({ example: "Actualizacion de la landing page y del sitio de marketing." }),
      status: projectStatusSchema,
      ownerId: z.number().int().openapi({ example: 5 }),
      createdAt: z.string().datetime().openapi({ example: "2026-04-28T13:48:25.709Z" }),
      updatedAt: z.string().datetime().openapi({ example: "2026-04-28T13:48:25.709Z" }),
    }),
    assignedTo: basicUserSchema,
    createdBy: basicUserSchema,
  }),
);

const dashboardSummarySchema = registry.register(
  "DashboardSummary",
  z.object({
    taskCounts: z.record(taskStatusEnumSchema, z.number().int()).openapi({
      example: {
        TODO: 2,
        IN_PROGRESS: 1,
        IN_REVIEW: 1,
        DONE: 1,
      },
    }),
    upcomingTasks: z.array(taskSchema),
    recentActivity: z.array(taskSchema),
  }),
);

const errorResponseSchema = registry.register(
  "ErrorResponse",
  z.object({
    success: z.literal(false),
    message: z.string().openapi({ example: "Error de validacion" }),
    errors: z.record(z.string(), z.array(z.string())).optional().openapi({
      example: {
        email: ["El email ya esta registrado"],
      },
    }),
  }),
);

function successResponseSchema<T extends z.ZodTypeAny>(dataSchema: T, withMeta = false) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().openapi({ example: "Operacion realizada correctamente" }),
    ...(withMeta ? { meta: paginationMetaSchema } : {}),
  });
}

function jsonContent<T extends z.ZodTypeAny>(schema: T, example?: unknown) {
  return {
    "application/json": {
      schema,
      ...(example !== undefined ? { example } : {}),
    },
  };
}

const authTag = ["Auth"];
const usersTag = ["Users"];
const projectsTag = ["Projects"];
const tasksTag = ["Tasks"];
const dashboardTag = ["Dashboard"];

registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: authTag,
  summary: "Registrar usuario",
  description: "Crea una cuenta nueva de tipo DEVELOPER.",
  request: {
    body: {
      description: "Datos del usuario a registrar.",
      required: true,
      content: jsonContent(registerSchema, {
        name: "Nuevo Desarrollador",
        email: "dev@taskflow.com",
        password: "Dev12345!",
        avatarUrl: "https://example.com/avatar.png",
      }),
    },
  },
  responses: {
    201: {
      description: "Usuario registrado correctamente.",
      content: jsonContent(successResponseSchema(publicUserSchema)),
    },
    422: {
      description: "Error de validacion.",
      content: jsonContent(errorResponseSchema),
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: authTag,
  summary: "Iniciar sesion",
  description: "Valida credenciales y crea la cookie taskflow_token.",
  request: {
    body: {
      description: "Credenciales del usuario.",
      required: true,
      content: jsonContent(loginSchema, {
        email: "admin@taskflow.com",
        password: "Admin123!",
      }),
    },
  },
  responses: {
    200: {
      description: "Sesion iniciada correctamente.",
      headers: {
        "Set-Cookie": {
          description: "Cookie de sesion taskflow_token.",
          schema: {
            type: "string",
          },
        },
      },
      content: jsonContent(successResponseSchema(publicUserSchema)),
    },
    401: {
      description: "Credenciales invalidas.",
      content: jsonContent(errorResponseSchema),
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: authTag,
  summary: "Cerrar sesion",
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: "Sesion cerrada correctamente.",
      content: jsonContent(successResponseSchema(z.null())),
    },
    401: {
      description: "No autenticado.",
      content: jsonContent(errorResponseSchema),
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/auth/me",
  tags: authTag,
  summary: "Obtener usuario autenticado",
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: "Usuario actual.",
      content: jsonContent(successResponseSchema(publicUserSchema.nullable())),
    },
    401: {
      description: "No autenticado.",
      content: jsonContent(errorResponseSchema),
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/users/options",
  tags: usersTag,
  summary: "Listar usuarios asignables",
  description: "Devuelve usuarios activos para usar en formularios de asignacion.",
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: "Usuarios asignables.",
      content: jsonContent(successResponseSchema(z.array(basicUserSchema))),
    },
    401: {
      description: "No autenticado.",
      content: jsonContent(errorResponseSchema),
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/users/profile",
  tags: usersTag,
  summary: "Ver perfil propio",
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: "Perfil del usuario autenticado.",
      content: jsonContent(successResponseSchema(publicUserSchema)),
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/users/profile",
  tags: usersTag,
  summary: "Actualizar perfil propio",
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      required: true,
      content: jsonContent(updateProfileSchema, {
        name: "Administrador General",
        email: "admin@taskflow.com",
        avatarUrl: "https://example.com/admin.png",
      }),
    },
  },
  responses: {
    200: {
      description: "Perfil actualizado correctamente.",
      content: jsonContent(successResponseSchema(publicUserSchema)),
    },
    422: {
      description: "Error de validacion.",
      content: jsonContent(errorResponseSchema),
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/users",
  tags: usersTag,
  summary: "Listar usuarios",
  description: "Disponible solo para ADMIN.",
  security: [{ cookieAuth: [] }],
  request: {
    query: userListQuerySchema,
  },
  responses: {
    200: {
      description: "Listado paginado de usuarios.",
      content: jsonContent(successResponseSchema(z.array(publicUserSchema), true)),
    },
    403: {
      description: "Sin permisos.",
      content: jsonContent(errorResponseSchema),
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/users",
  tags: usersTag,
  summary: "Crear usuario",
  description: "Disponible solo para ADMIN.",
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      required: true,
      content: jsonContent(createUserSchema, {
        name: "Ana Perez",
        email: "ana@taskflow.com",
        password: "Ana12345!",
        role: "DEVELOPER",
        avatarUrl: "https://example.com/ana.png",
      }),
    },
  },
  responses: {
    201: {
      description: "Usuario creado correctamente.",
      content: jsonContent(successResponseSchema(publicUserSchema)),
    },
    422: {
      description: "Error de validacion.",
      content: jsonContent(errorResponseSchema),
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/users/{id}",
  tags: usersTag,
  summary: "Obtener usuario por id",
  security: [{ cookieAuth: [] }],
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: "Usuario encontrado.",
      content: jsonContent(successResponseSchema(publicUserSchema)),
    },
    404: {
      description: "Usuario no encontrado.",
      content: jsonContent(errorResponseSchema),
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/users/{id}",
  tags: usersTag,
  summary: "Actualizar usuario",
  security: [{ cookieAuth: [] }],
  request: {
    params: idParamSchema,
    body: {
      required: true,
      content: jsonContent(updateUserSchema, {
        name: "Ana Perez Actualizada",
        email: "ana.perez@taskflow.com",
        role: "PROJECT_MANAGER",
        avatarUrl: "https://example.com/ana-v2.png",
      }),
    },
  },
  responses: {
    200: {
      description: "Usuario actualizado correctamente.",
      content: jsonContent(successResponseSchema(publicUserSchema)),
    },
    422: {
      description: "Error de validacion.",
      content: jsonContent(errorResponseSchema),
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/users/{id}",
  tags: usersTag,
  summary: "Eliminar usuario (soft delete)",
  security: [{ cookieAuth: [] }],
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: "Usuario eliminado correctamente.",
      content: jsonContent(successResponseSchema(publicUserSchema)),
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/projects",
  tags: projectsTag,
  summary: "Listar proyectos",
  security: [{ cookieAuth: [] }],
  request: {
    query: projectListQuerySchema,
  },
  responses: {
    200: {
      description: "Listado paginado de proyectos.",
      content: jsonContent(successResponseSchema(z.array(projectSummarySchema), true)),
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/projects/{id}",
  tags: projectsTag,
  summary: "Ver detalle de proyecto",
  security: [{ cookieAuth: [] }],
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: "Detalle del proyecto con tareas asociadas.",
      content: jsonContent(successResponseSchema(projectDetailSchema)),
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/projects",
  tags: projectsTag,
  summary: "Crear proyecto",
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      required: true,
      content: jsonContent(createProjectSchema, {
        name: "Portal de clientes",
        description: "Implementacion del portal para seguimiento de solicitudes.",
      }),
    },
  },
  responses: {
    201: {
      description: "Proyecto creado correctamente.",
      content: jsonContent(successResponseSchema(projectSummarySchema)),
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/projects/{id}",
  tags: projectsTag,
  summary: "Actualizar proyecto",
  security: [{ cookieAuth: [] }],
  request: {
    params: idParamSchema,
    body: {
      required: true,
      content: jsonContent(updateProjectSchema, {
        name: "Portal de clientes v2",
        description: "Ajustes de contenido y cambios en el flujo principal.",
      }),
    },
  },
  responses: {
    200: {
      description: "Proyecto actualizado correctamente.",
      content: jsonContent(successResponseSchema(projectSummarySchema)),
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/projects/{id}/archive",
  tags: projectsTag,
  summary: "Archivar proyecto",
  description: "Disponible solo para ADMIN.",
  security: [{ cookieAuth: [] }],
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: "Proyecto archivado correctamente.",
      content: jsonContent(successResponseSchema(projectSummarySchema)),
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/projects/{id}",
  tags: projectsTag,
  summary: "Eliminar proyecto",
  description: "Disponible solo para ADMIN. Elimina el proyecto y sus tareas asociadas.",
  security: [{ cookieAuth: [] }],
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: "Proyecto eliminado correctamente.",
      content: jsonContent(successResponseSchema(z.null())),
    },
    404: {
      description: "Proyecto no encontrado.",
      content: jsonContent(errorResponseSchema),
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/tasks",
  tags: tasksTag,
  summary: "Listar tareas",
  security: [{ cookieAuth: [] }],
  request: {
    query: taskListQuerySchema,
  },
  responses: {
    200: {
      description: "Listado paginado de tareas.",
      content: jsonContent(successResponseSchema(z.array(taskSchema), true)),
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/tasks/{id}",
  tags: tasksTag,
  summary: "Obtener tarea por id",
  security: [{ cookieAuth: [] }],
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: "Detalle de la tarea.",
      content: jsonContent(successResponseSchema(taskSchema)),
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/tasks",
  tags: tasksTag,
  summary: "Crear tarea",
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      required: true,
      content: jsonContent(createTaskSchema, {
        title: "Preparar backlog",
        description: "Definir historias iniciales para el sprint.",
        priority: "HIGH",
        projectId: 3,
        assignedToId: 6,
        dueDate: "2026-05-02T10:00:00.000Z",
      }),
    },
  },
  responses: {
    201: {
      description: "Tarea creada correctamente.",
      content: jsonContent(successResponseSchema(taskSchema)),
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/tasks/{id}",
  tags: tasksTag,
  summary: "Actualizar tarea",
  security: [{ cookieAuth: [] }],
  request: {
    params: idParamSchema,
    body: {
      required: true,
      content: jsonContent(updateTaskSchema, {
        title: "Preparar backlog refinado",
        description: "Agregar criterios de aceptacion a las historias.",
        priority: "CRITICAL",
        assignedToId: 6,
        dueDate: "2026-05-03T14:00:00.000Z",
        status: "IN_PROGRESS",
      }),
    },
  },
  responses: {
    200: {
      description: "Tarea actualizada correctamente.",
      content: jsonContent(successResponseSchema(taskSchema)),
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/tasks/{id}/status",
  tags: tasksTag,
  summary: "Cambiar estado de tarea",
  security: [{ cookieAuth: [] }],
  request: {
    params: idParamSchema,
    body: {
      required: true,
      content: jsonContent(taskStatusSchema, {
        status: "IN_REVIEW",
      }),
    },
  },
  responses: {
    200: {
      description: "Estado actualizado correctamente.",
      content: jsonContent(successResponseSchema(taskSchema)),
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/tasks/{id}",
  tags: tasksTag,
  summary: "Eliminar tarea",
  security: [{ cookieAuth: [] }],
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: "Tarea eliminada correctamente.",
      content: jsonContent(successResponseSchema(z.null())),
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/dashboard",
  tags: dashboardTag,
  summary: "Resumen del dashboard",
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: "Metricas del dashboard segun el rol del usuario.",
      content: jsonContent(successResponseSchema(dashboardSummarySchema)),
    },
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "TaskFlow Pro API",
    version: "1.0.0",
    description:
      "Documentacion viva generada desde los mismos esquemas Zod que validan la API. Usa /auth/login para crear la cookie y luego prueba las rutas protegidas.",
  },
  servers: [{ url: `http://localhost:${env.APP_PORT}/api/v1` }],
  tags: [
    { name: "Auth", description: "Autenticacion y sesion." },
    { name: "Users", description: "Gestion de usuarios y perfil." },
    { name: "Projects", description: "Gestion y consulta de proyectos." },
    { name: "Tasks", description: "Gestion y consulta de tareas." },
    { name: "Dashboard", description: "Resumen de actividad y metricas." },
  ],
});
