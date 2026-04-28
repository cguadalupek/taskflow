import bcrypt from "bcryptjs";
import { PrismaClient, ProjectStatus, Role, TaskPriority, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const [adminPassword, managerPassword, developerPassword] = await Promise.all([
    bcrypt.hash("Admin123!", saltRounds),
    bcrypt.hash("Maria123!", saltRounds),
    bcrypt.hash("Kevin123!", saltRounds),
  ]);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@taskflow.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Maria Garcia",
      email: "maria@taskflow.com",
      passwordHash: managerPassword,
      role: Role.PROJECT_MANAGER,
    },
  });

  const developer = await prisma.user.create({
    data: {
      name: "Kevin Carmen",
      email: "kevin@taskflow.com",
      passwordHash: developerPassword,
      role: Role.DEVELOPER,
    },
  });

  const websiteProject = await prisma.project.create({
    data: {
      name: "Rediseno del sitio web",
      description: "Actualizacion de la landing page y del sitio de marketing.",
      status: ProjectStatus.ACTIVE,
      ownerId: manager.id,
    },
  });

  const mobileProject = await prisma.project.create({
    data: {
      name: "Control de calidad de la app movil",
      description: "Sprint de estabilizacion para la salida de la aplicacion movil.",
      status: ProjectStatus.ARCHIVED,
      ownerId: admin.id,
    },
  });

  const now = new Date();
  const addDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        title: "Definir secciones de la pagina principal",
        description: "Desglosar las secciones finales de la pagina principal para contenido y estructura.",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        projectId: websiteProject.id,
        assignedToId: developer.id,
        createdById: manager.id,
        dueDate: addDays(2),
      },
      {
        title: "Implementar rediseno del hero",
        description: "Construir el componente principal con CTA actualizada y un layout responsive.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.CRITICAL,
        projectId: websiteProject.id,
        assignedToId: developer.id,
        createdById: manager.id,
        dueDate: addDays(4),
      },
      {
        title: "Revisar borrador del contenido",
        description: "Validar el texto final antes de publicar la landing page.",
        status: TaskStatus.IN_REVIEW,
        priority: TaskPriority.MEDIUM,
        projectId: websiteProject.id,
        assignedToId: manager.id,
        createdById: admin.id,
        dueDate: addDays(1),
      },
      {
        title: "Cerrar lista de regresiones de QA",
        description: "Verificar que los bugs archivados esten documentados antes del congelamiento de release.",
        status: TaskStatus.DONE,
        priority: TaskPriority.LOW,
        projectId: mobileProject.id,
        assignedToId: admin.id,
        createdById: admin.id,
        dueDate: addDays(-2),
      },
      {
        title: "Preparar notas de version",
        description: "Resumir los resultados del sprint archivado para los stakeholders.",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        projectId: mobileProject.id,
        assignedToId: developer.id,
        createdById: admin.id,
        dueDate: addDays(6),
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
