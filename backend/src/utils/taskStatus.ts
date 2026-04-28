import { TaskStatus } from "@prisma/client";
import { ApiError } from "./apiError";

const orderedStatuses = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

export function ensureValidTaskTransition(currentStatus: TaskStatus, nextStatus: TaskStatus) {
  if (currentStatus === nextStatus) {
    return;
  }

  const currentIndex = orderedStatuses.indexOf(currentStatus);
  const nextIndex = orderedStatuses.indexOf(nextStatus);

  if (nextIndex !== currentIndex + 1) {
    throw new ApiError(422, "La transición de estado no es válida", {
      status: [`${currentStatus} no puede cambiar a ${nextStatus}`],
    });
  }
}
