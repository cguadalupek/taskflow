"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { TaskForm } from "@/components/TaskForm";
import { PriorityBadge, ProjectStatusBadge, TaskStatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, getFirstErrorMessage } from "@/lib/format";
import { api } from "@/services/api";
import type { BasicUser, Project, TaskPayload, User } from "@/types";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const currentRole = user?.role ?? "DEVELOPER";
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<BasicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    try {
      const [projectResponse, usersResponse] = await Promise.all([
        api.getProject(Number(params.id)),
        api.getAssignableUsers(),
      ]);
      setProject(projectResponse.data);
      setUsers(usersResponse.data as User[]);
    } catch (caughtError) {
      setError(getFirstErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  const handleCreateTask = async (payload: TaskPayload) => {
    await api.createTask({
      ...payload,
      projectId: Number(params.id),
    });
    await loadProject();
  };

  return (
    <AuthGuard>
      {loading ? <LoadingState label="Cargando proyecto..." /> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {project && !loading ? (
        <>
          <PageHeader
            title={project.name}
            description={project.description}
            actions={<ProjectStatusBadge status={project.status} />}
          />

          <div className="row g-4">
            <div className="col-lg-5">
              <TaskForm
                role={currentRole}
                projects={[project]}
                users={users}
                lockedProjectId={project.id}
                submitLabel="Create task"
                onSubmit={handleCreateTask}
                editableFields={{ project: false, assignee: currentRole !== "DEVELOPER", priority: true, status: false }}
              />
            </div>
            <div className="col-lg-7">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h5 mb-0">Tasks</h2>
                    <Link href="/tasks" className="btn btn-sm btn-outline-primary">
                      Manage all tasks
                    </Link>
                  </div>
                  <div className="d-flex flex-column gap-3">
                    {project.tasks?.length ? (
                      project.tasks.map((task) => (
                        <div key={task.id} className="border rounded p-3">
                          <div className="d-flex justify-content-between gap-3 flex-wrap mb-2">
                            <div>
                              <div className="fw-semibold">{task.title}</div>
                              <div className="small text-secondary">{task.description}</div>
                            </div>
                            <div className="d-flex gap-2">
                              <TaskStatusBadge status={task.status} />
                              <PriorityBadge priority={task.priority} />
                            </div>
                          </div>
                          <div className="small text-secondary">
                            Assigned to {task.assignedTo.name} • Due {formatDate(task.dueDate)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-secondary mb-0">No tasks registered for this project.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </AuthGuard>
  );
}
