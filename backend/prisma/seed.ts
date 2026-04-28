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
    bcrypt.hash("Carlos123!", saltRounds),
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
      name: "María García",
      email: "maria@taskflow.com",
      passwordHash: managerPassword,
      role: Role.PROJECT_MANAGER,
    },
  });

  const developer = await prisma.user.create({
    data: {
      name: "Carlos López",
      email: "carlos@taskflow.com",
      passwordHash: developerPassword,
      role: Role.DEVELOPER,
    },
  });

  const websiteProject = await prisma.project.create({
    data: {
      name: "Website Refresh",
      description: "Landing page and marketing site refresh.",
      status: ProjectStatus.ACTIVE,
      ownerId: manager.id,
    },
  });

  const mobileProject = await prisma.project.create({
    data: {
      name: "Mobile App QA",
      description: "Stabilization sprint for the mobile release.",
      status: ProjectStatus.ARCHIVED,
      ownerId: admin.id,
    },
  });

  const now = new Date();
  const addDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        title: "Define homepage sections",
        description: "Break down the final homepage sections for content and layout.",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        projectId: websiteProject.id,
        assignedToId: developer.id,
        createdById: manager.id,
        dueDate: addDays(2),
      },
      {
        title: "Implement hero redesign",
        description: "Build the hero component with updated CTA and responsive layout.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.CRITICAL,
        projectId: websiteProject.id,
        assignedToId: developer.id,
        createdById: manager.id,
        dueDate: addDays(4),
      },
      {
        title: "Review copy draft",
        description: "Validate final copy before publishing the landing page.",
        status: TaskStatus.IN_REVIEW,
        priority: TaskPriority.MEDIUM,
        projectId: websiteProject.id,
        assignedToId: manager.id,
        createdById: admin.id,
        dueDate: addDays(1),
      },
      {
        title: "Close QA regression list",
        description: "Verify archived bugs are documented before release freeze.",
        status: TaskStatus.DONE,
        priority: TaskPriority.LOW,
        projectId: mobileProject.id,
        assignedToId: admin.id,
        createdById: admin.id,
        dueDate: addDays(-2),
      },
      {
        title: "Prepare release notes",
        description: "Summarize the archived sprint outcomes for stakeholders.",
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
