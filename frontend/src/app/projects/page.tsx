"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { ProjectForm } from "@/components/ProjectForm";
import { ProjectStatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { flattenApiErrors, getFirstErrorMessage } from "@/lib/format";
import { ApiClientError, api } from "@/services/api";
import type { Project, ProjectPayload } from "@/types";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const canManageProjects = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  const loadProjects = async () => {
    try {
      const response = await api.getProjects({ page: 1, limit: 50, sortBy: "updatedAt", sortOrder: "desc" });
      setProjects(response.data);
    } catch (caughtError) {
      setError(getFirstErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (payload: ProjectPayload) => {
    try {
      await api.createProject(payload);
      setError(null);
      await loadProjects();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError([caughtError.message, ...flattenApiErrors(caughtError.errors)].join(" "));
      } else {
        setError(getFirstErrorMessage(caughtError));
      }
    }
  };

  const handleUpdate = async (payload: ProjectPayload) => {
    if (!editingProject) {
      return;
    }

    try {
      await api.updateProject(editingProject.id, payload);
      setEditingProject(null);
      setError(null);
      await loadProjects();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError([caughtError.message, ...flattenApiErrors(caughtError.errors)].join(" "));
      } else {
        setError(getFirstErrorMessage(caughtError));
      }
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await api.archiveProject(id);
      setError(null);
      await loadProjects();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError([caughtError.message, ...flattenApiErrors(caughtError.errors)].join(" "));
      } else {
        setError(getFirstErrorMessage(caughtError));
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteProject(id);
      if (editingProject?.id === id) {
        setEditingProject(null);
      }
      setError(null);
      await loadProjects();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError([caughtError.message, ...flattenApiErrors(caughtError.errors)].join(" "));
      } else {
        setError(getFirstErrorMessage(caughtError));
      }
    }
  };

  return (
    <AuthGuard>
      <PageHeader
        title="Proyectos"
        description="Lista de proyectos visibles segun tu rol y acceso actual."
      />
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {canManageProjects ? (
        <div className="mb-4">
          <ProjectForm
            submitLabel={editingProject ? "Actualizar proyecto" : "Crear proyecto"}
            initialValues={
              editingProject
                ? {
                    name: editingProject.name,
                    description: editingProject.description,
                  }
                : undefined
            }
            onSubmit={editingProject ? handleUpdate : handleCreate}
          />
          {editingProject ? (
            <div className="mt-2">
              <button className="btn btn-link px-0" onClick={() => setEditingProject(null)}>
                Cancelar edicion
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      {loading ? <LoadingState label="Cargando proyectos..." /> : null}
      {!loading ? (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Responsable</th>
                    <th>Estado</th>
                    <th>Tareas</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {projects.length ? (
                    projects.map((project) => (
                      <tr key={project.id}>
                        <td>
                          <div className="fw-semibold">{project.name}</div>
                          <div className="small text-secondary">{project.description}</div>
                        </td>
                        <td>{project.owner.name}</td>
                        <td>
                          <ProjectStatusBadge status={project.status} />
                        </td>
                        <td>{project._count?.tasks ?? project.tasks?.length ?? 0}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2 flex-wrap">
                            <Link href={`/projects/${project.id}`} className="btn btn-sm btn-outline-primary">
                              Detalle
                            </Link>
                            {canManageProjects ? (
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingProject(project)}>
                                Editar
                              </button>
                            ) : null}
                            {user?.role === "ADMIN" && project.status !== "ARCHIVED" ? (
                              <button className="btn btn-sm btn-outline-dark" onClick={() => handleArchive(project.id)}>
                                Archivar
                              </button>
                            ) : null}
                            {user?.role === "ADMIN" ? (
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(project.id)}>
                                Eliminar
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-secondary">
                        No hay proyectos disponibles.
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
