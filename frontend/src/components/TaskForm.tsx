"use client";

import { useEffect, useState } from "react";
import { priorityLabels, roleLabels, statusLabels, taskPriorities, taskStatuses } from "@/lib/constants";
import { formatDateInput } from "@/lib/format";
import type { BasicUser, Project, Role, Task, TaskPayload, TaskPriority, TaskStatus } from "@/types";

type EditableFields = {
  project?: boolean;
  assignee?: boolean;
  priority?: boolean;
  status?: boolean;
};

type TaskFormProps = {
  role: Role;
  projects: Project[];
  users: BasicUser[];
  submitLabel: string;
  onSubmit: (payload: TaskPayload) => Promise<void>;
  initialTask?: Task | null;
  lockedProjectId?: number;
  editableFields?: EditableFields;
};

type FormState = {
  title: string;
  description: string;
  priority: TaskPriority;
  projectId: string;
  assignedToId: string;
  dueDate: string;
  status: TaskStatus;
};

function buildInitialState(task?: Task | null, lockedProjectId?: number): FormState {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "MEDIUM",
    projectId: String(lockedProjectId ?? task?.projectId ?? ""),
    assignedToId: String(task?.assignedToId ?? ""),
    dueDate: task ? formatDateInput(task.dueDate) : "",
    status: task?.status ?? "TODO",
  };
}

export function TaskForm({
  role,
  projects,
  users,
  submitLabel,
  onSubmit,
  initialTask,
  lockedProjectId,
  editableFields = {},
}: TaskFormProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(initialTask, lockedProjectId));
  const [busy, setBusy] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    setForm(buildInitialState(initialTask, lockedProjectId));
    setClientError(null);
  }, [initialTask, lockedProjectId]);

  const canEditProject = editableFields.project ?? !lockedProjectId;
  const canEditAssignee = editableFields.assignee ?? role !== "DEVELOPER";
  const canEditPriority = editableFields.priority ?? true;
  const canEditStatus = editableFields.status ?? Boolean(initialTask);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = form.title.trim();
    const trimmedDescription = form.description.trim();
    const selectedProjectId = Number(lockedProjectId ?? form.projectId);

    if (trimmedTitle.length < 2) {
      setClientError("El titulo debe tener al menos 2 caracteres.");
      return;
    }

    if (trimmedDescription.length < 5) {
      setClientError("La descripcion debe tener al menos 5 caracteres.");
      return;
    }

    if (!form.dueDate) {
      setClientError("Debes indicar una fecha limite.");
      return;
    }

    if (!initialTask && (!selectedProjectId || Number.isNaN(selectedProjectId))) {
      setClientError("Debes seleccionar un proyecto.");
      return;
    }

    if (!initialTask && canEditAssignee && !form.assignedToId) {
      setClientError("Debes asignar la tarea a un usuario.");
      return;
    }

    setClientError(null);
    setBusy(true);

    try {
      const payload: TaskPayload = {
        title: trimmedTitle,
        description: trimmedDescription,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      };

      if (!initialTask) {
        payload.priority = form.priority;
        payload.projectId = selectedProjectId;
        if (role !== "DEVELOPER" && form.assignedToId) {
          payload.assignedToId = Number(form.assignedToId);
        }
      } else {
        if (canEditPriority) {
          payload.priority = form.priority;
        }
        if (canEditAssignee && form.assignedToId) {
          payload.assignedToId = Number(form.assignedToId);
        }
        if (canEditStatus) {
          payload.status = form.status;
        }
      }

      await onSubmit(payload);

      if (!initialTask) {
        setForm(buildInitialState(null, lockedProjectId));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card shadow-sm border-0" onSubmit={handleSubmit}>
      <div className="card-body">
        {clientError ? <div className="alert alert-warning">{clientError}</div> : null}
        <div className="small text-secondary mb-3">
          Completa los datos esenciales y usa los campos avanzados solo cuando apliquen para tu rol.
        </div>
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">Titulo</label>
            <input
              className="form-control"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Fecha limite</label>
            <input
              type="datetime-local"
              className="form-control"
              value={form.dueDate}
              onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
              required
            />
          </div>
          {canEditPriority ? (
            <div className="col-md-6">
              <label className="form-label">Prioridad</label>
              <select
                className="form-select"
                value={form.priority}
                onChange={(event) =>
                  setForm((current) => ({ ...current, priority: event.target.value as TaskPriority }))
                }
              >
                {taskPriorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priorityLabels[priority]}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="col-12">
            <label className="form-label">Descripcion</label>
            <textarea
              className="form-control"
              rows={4}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              required
            />
          </div>
          {!lockedProjectId || canEditProject ? (
            <div className="col-md-6">
              <label className="form-label">Proyecto</label>
              <select
                className="form-select"
                value={form.projectId}
                onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}
                disabled={!canEditProject}
                required
              >
                <option value="">Selecciona un proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {canEditAssignee ? (
            <div className="col-md-6">
              <label className="form-label">Asignado a</label>
              <select
                className="form-select"
                value={form.assignedToId}
                onChange={(event) => setForm((current) => ({ ...current, assignedToId: event.target.value }))}
                required={!initialTask}
              >
                <option value="">Selecciona un usuario</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({roleLabels[user.role]})
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {canEditStatus ? (
            <div className="col-12">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as TaskStatus }))}
              >
                {taskStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
        <div className="mt-3">
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Guardando..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
