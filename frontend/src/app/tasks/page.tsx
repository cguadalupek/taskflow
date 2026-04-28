"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { PriorityBadge, TaskStatusBadge } from "@/components/StatusBadge";
import { TaskForm } from "@/components/TaskForm";
import { useAuth } from "@/hooks/useAuth";
import { priorityLabels, statusLabels, taskPriorities, taskStatuses } from "@/lib/constants";
import { flattenApiErrors, formatDate, getFirstErrorMessage } from "@/lib/format";
import { ApiClientError, api } from "@/services/api";
import type { BasicUser, Project, Task, TaskPayload, User } from "@/types";

type Filters = {
  status: string;
  priority: string;
  assignedTo: string;
  projectId: string;
};

export default function TasksPage() {
  const { user } = useAuth();
  const currentRole = user?.role ?? "DEVELOPER";
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<BasicUser[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: "",
    priority: "",
    assignedTo: "",
    projectId: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const overdueCount = tasks.filter((task) => new Date(task.dueDate) < new Date() && task.status !== "DONE").length;
  const inProgressCount = tasks.filter((task) => task.status === "IN_PROGRESS").length;
  const reviewCount = tasks.filter((task) => task.status === "IN_REVIEW").length;
  const dueSoonCount = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    const daysLeft = dueDate.getTime() - Date.now();
    return daysLeft > 0 && daysLeft <= 3 * 24 * 60 * 60 * 1000 && task.status !== "DONE";
  }).length;

  const loadData = useCallback(async () => {
    try {
      const [tasksResponse, projectsResponse, usersResponse] = await Promise.all([
        api.getTasks({
          page: 1,
          limit: 50,
          sortBy: "updatedAt",
          sortOrder: "desc",
          ...filters,
        }),
        api.getProjects({ page: 1, limit: 50, sortBy: "updatedAt", sortOrder: "desc" }),
        api.getAssignableUsers(),
      ]);

      setTasks(tasksResponse.data);
      setProjects(projectsResponse.data);
      setUsers(usersResponse.data as User[]);
    } catch (caughtError) {
      setError(getFirstErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateTask = async (payload: TaskPayload) => {
    try {
      await api.createTask(payload);
      setError(null);
      await loadData();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError([caughtError.message, ...flattenApiErrors(caughtError.errors)].join(" "));
      } else {
        setError(getFirstErrorMessage(caughtError));
      }
    }
  };

  const handleUpdateTask = async (payload: TaskPayload) => {
    if (!selectedTask) {
      return;
    }

    try {
      await api.updateTask(selectedTask.id, payload);
      setSelectedTask(null);
      setError(null);
      await loadData();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError([caughtError.message, ...flattenApiErrors(caughtError.errors)].join(" "));
      } else {
        setError(getFirstErrorMessage(caughtError));
      }
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.deleteTask(taskId);
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
      setError(null);
      await loadData();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError([caughtError.message, ...flattenApiErrors(caughtError.errors)].join(" "));
      } else {
        setError(getFirstErrorMessage(caughtError));
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      priority: "",
      assignedTo: "",
      projectId: "",
    });
  };

  return (
    <AuthGuard>
      <PageHeader
        title="Tareas"
        description="Consulta el tablero, aplica filtros y gestiona cada tarea sin mezclar la vista con la edicion."
        actions={
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedTask(null);
              document.getElementById("task-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            Nueva tarea
          </button>
        }
      />
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="small text-secondary text-uppercase">Tareas visibles</div>
              <div className="display-6 fw-semibold">{tasks.length}</div>
              <div className="small text-secondary">Segun los filtros aplicados.</div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="small text-secondary text-uppercase">En progreso</div>
              <div className="display-6 fw-semibold">{inProgressCount}</div>
              <div className="small text-secondary">Trabajo que ya esta avanzando.</div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="small text-secondary text-uppercase">Por revisar</div>
              <div className="display-6 fw-semibold">{reviewCount}</div>
              <div className="small text-secondary">Pendientes de validacion o feedback.</div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="small text-secondary text-uppercase">Atencion cercana</div>
              <div className="display-6 fw-semibold">{overdueCount + dueSoonCount}</div>
              <div className="small text-secondary">
                {overdueCount} vencidas y {dueSoonCount} por vencer pronto.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 align-items-start">
        <div className="col-xl-8">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                <div>
                  <div className="small text-secondary text-uppercase fw-semibold">Vista de tareas</div>
                  <h2 className="h5 mb-1">Filtros</h2>
                  <p className="text-secondary mb-0">
                    Usa estos criterios para encontrar rapidamente lo que necesitas sin tocar el formulario de edicion.
                  </p>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="badge text-bg-light border">
                    {activeFilterCount ? `${activeFilterCount} filtro(s) activo(s)` : "Sin filtros activos"}
                  </span>
                  {activeFilterCount ? (
                    <button className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
                      Limpiar filtros
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="row g-3">
                <div className="col-md-6 col-lg-3">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={filters.status}
                    onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                  >
                    <option value="">Todos</option>
                    {taskStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 col-lg-3">
                  <label className="form-label">Prioridad</label>
                  <select
                    className="form-select"
                    value={filters.priority}
                    onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
                  >
                    <option value="">Todas</option>
                    {taskPriorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priorityLabels[priority]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 col-lg-3">
                  <label className="form-label">Asignado a</label>
                  <select
                    className="form-select"
                    value={filters.assignedTo}
                    onChange={(event) => setFilters((current) => ({ ...current, assignedTo: event.target.value }))}
                  >
                    <option value="">Todos</option>
                    {users.map((assignableUser) => (
                      <option key={assignableUser.id} value={assignableUser.id}>
                        {assignableUser.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 col-lg-3">
                  <label className="form-label">Proyecto</label>
                  <select
                    className="form-select"
                    value={filters.projectId}
                    onChange={(event) => setFilters((current) => ({ ...current, projectId: event.target.value }))}
                  >
                    <option value="">Todos</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading ? <LoadingState label="Cargando tareas..." /> : null}
          {!loading ? (
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                  <div>
                    <div className="small text-secondary text-uppercase fw-semibold">Listado principal</div>
                    <h2 className="h5 mb-1">Tareas del tablero</h2>
                    <p className="text-secondary mb-0">
                      Revisa el detalle, identifica responsables y actua sobre cada tarea desde esta tabla.
                    </p>
                  </div>
                  <span className="badge text-bg-success-subtle border border-success-subtle text-success">
                    {tasks.length} resultado(s)
                  </span>
                </div>
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Tarea</th>
                        <th>Proyecto</th>
                        <th>Asignado a</th>
                        <th>Estado</th>
                        <th>Prioridad</th>
                        <th>Vence</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.length ? (
                        tasks.map((task) => (
                          <tr key={task.id}>
                            <td>
                              <div className="fw-semibold">{task.title}</div>
                              <div className="small text-secondary">{task.description}</div>
                            </td>
                            <td>{task.project.name}</td>
                            <td>{task.assignedTo.name}</td>
                            <td>
                              <TaskStatusBadge status={task.status} />
                            </td>
                            <td>
                              <PriorityBadge priority={task.priority} />
                            </td>
                            <td>{formatDate(task.dueDate)}</td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-2 flex-wrap">
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => {
                                    setSelectedTask(task);
                                    document.getElementById("task-editor")?.scrollIntoView({
                                      behavior: "smooth",
                                      block: "start",
                                    });
                                  }}
                                >
                                  Editar
                                </button>
                                {currentRole !== "DEVELOPER" ? (
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteTask(task.id)}
                                  >
                                    Eliminar
                                  </button>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center py-5 text-secondary">
                            No se encontraron tareas con la combinacion actual de filtros.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="col-xl-4">
          <div id="task-editor" className="task-sidebar">
            <div className="card shadow-sm border-0 mb-3">
              <div className="card-body">
                <div className="small text-secondary text-uppercase fw-semibold">
                  {selectedTask ? "Edicion" : ""}
                </div>
                <h2 className="h5 mb-1">{selectedTask ? "Editar tarea" : "Nueva tarea"}</h2>
                <p className="text-secondary mb-0">
                  {selectedTask
                    ? "Actualiza el contenido, responsable o estado de la tarea seleccionada."
                    : "Completa los datos principales para registrar una nueva tarea sin perder de vista el tablero."}
                </p>
              </div>
            </div>

            <TaskForm
              role={currentRole}
              projects={projects}
              users={users}
              submitLabel={selectedTask ? "Actualizar tarea" : "Crear tarea"}
              initialTask={selectedTask}
              onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
              editableFields={{
                project: !selectedTask,
                assignee: currentRole !== "DEVELOPER",
                priority: currentRole !== "DEVELOPER",
                status: Boolean(selectedTask),
              }}
            />
            {selectedTask ? (
              <button className="btn btn-link px-0 mt-2" onClick={() => setSelectedTask(null)}>
                Cancelar edicion
              </button>
            ) : (
              <div className="small text-secondary mt-2">
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
