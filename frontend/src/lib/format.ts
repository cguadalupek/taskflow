import type { ApiErrorResponse } from "@/types";

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function formatDateInput(date: string) {
  return new Date(date).toISOString().slice(0, 16);
}

export function getFirstErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado";
}

export function flattenApiErrors(errors?: ApiErrorResponse["errors"]) {
  if (!errors) {
    return [];
  }

  return Object.values(errors).flat();
}
