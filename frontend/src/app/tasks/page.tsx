"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { PriorityBadge, TaskStatusBadge } from "@/components/StatusBadge";
import { TaskForm } from "@/components/TaskForm";
import { useAuth } from "@/hooks/useAuth";
import { taskPriorities, taskStatuses } from "@/lib/constants";
import { formatDate, getFirstErrorMessage } from "@/lib/format";
import { api } from "@/services/api";
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
    await api.createTask(payload);
    setError(null);
    await loadData();
  };

  const handleUpdateTask = async (payload: TaskPayload) => {
    if (!selectedTask) {
      return;
    }

    await api.updateTask(selectedTask.id, payload);
    setSelectedTask(null);
    setError(null);
    await loadData();
  };

  const handleDeleteTask = async (taskId: number) => {
    await api.deleteTask(taskId);
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
    await loadData();
  };

  return (
    <AuthGuard>
      <PageHeader title="Tasks" description="Crea, filtra y administra tareas según tu rol actual." />
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <div className="row g-4 mb-4">
        <div className="col-lg-5">
          <TaskForm
            role={currentRole}
            projects={projects}
            users={users}
            submitLabel={selectedTask ? "Update task" : "Create task"}
            initialTask={selectedTask}
            onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
            editableFields={{
              project: false,
              assignee: currentRole !== "DEVELOPER",
              priority: currentRole !== "DEVELOPER",
              status: Boolean(selectedTask),
            }}
          />
          {selectedTask ? (
            <button className="btn btn-link px-0 mt-2" onClick={() => setSelectedTask(null)}>
              Cancel editing
            </button>
          ) : null}
        </div>
        <div className="col-lg-7">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={filters.status}
                    onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                  >
                    <option value="">All</option>
                    {taskStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={filters.priority}
                    onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
                  >
                    <option value="">All</option>
                    {taskPriorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Assignee</label>
                  <select
                    className="form-select"
                    value={filters.assignedTo}
                    onChange={(event) => setFilters((current) => ({ ...current, assignedTo: event.target.value }))}
                  >
                    <option value="">All</option>
                    {users.map((assignableUser) => (
                      <option key={assignableUser.id} value={assignableUser.id}>
                        {assignableUser.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Project</label>
                  <select
                    className="form-select"
                    value={filters.projectId}
                    onChange={(event) => setFilters((current) => ({ ...current, projectId: event.target.value }))}
                  >
                    <option value="">All</option>
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
        </div>
      </div>

      {loading ? <LoadingState label="Cargando tareas..." /> : null}
      {!loading ? (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Assignee</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due</th>
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
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedTask(task)}>
                              Edit
                            </button>
                            {currentRole !== "DEVELOPER" ? (
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteTask(task.id)}>
                                Delete
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-secondary">
                        No tasks found for the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </AuthGuard>
  );
}
