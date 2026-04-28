export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "TaskFlow Pro API",
    version: "1.0.0",
    description: "REST API for TaskFlow Pro.",
  },
  servers: [{ url: "http://localhost:3000/api/v1" }],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "taskflow_token",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string" },
          role: { type: "string" },
          avatarUrl: { type: "string", nullable: true },
          deletedAt: { type: "string", nullable: true },
          createdAt: { type: "string" },
          updatedAt: { type: "string" },
        },
      },
      Project: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "string" },
        },
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          description: { type: "string" },
          status: { type: "string" },
          priority: { type: "string" },
          dueDate: { type: "string", format: "date-time" },
        },
      },
    },
  },
  paths: {
    "/auth/register": { post: { summary: "Register a developer account" } },
    "/auth/login": { post: { summary: "Log in and set auth cookie" } },
    "/auth/logout": { post: { summary: "Clear the auth cookie" } },
    "/auth/me": {
      get: {
        summary: "Get current session user",
        security: [{ cookieAuth: [] }],
      },
    },
    "/users": {
      get: { summary: "List users", security: [{ cookieAuth: [] }] },
      post: { summary: "Create user", security: [{ cookieAuth: [] }] },
    },
    "/projects": {
      get: { summary: "List projects", security: [{ cookieAuth: [] }] },
      post: { summary: "Create project", security: [{ cookieAuth: [] }] },
    },
    "/tasks": {
      get: { summary: "List tasks", security: [{ cookieAuth: [] }] },
      post: { summary: "Create task", security: [{ cookieAuth: [] }] },
    },
    "/dashboard": {
      get: { summary: "Dashboard summary", security: [{ cookieAuth: [] }] },
    },
  },
};
