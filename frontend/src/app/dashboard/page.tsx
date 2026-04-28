"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { PriorityBadge, TaskStatusBadge } from "@/components/StatusBadge";
import { roleLabels, statusLabels, taskStatuses } from "@/lib/constants";
import { formatDate, getFirstErrorMessage } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import type { DashboardSummary } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.getDashboard();
        setSummary(response.data);
      } catch (caughtError) {
        setError(getFirstErrorMessage(caughtError));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <AuthGuard>
      <PageHeader
        title="Panel"
        description={`Vista ${user ? roleLabels[user.role] : ""} con actividad reciente y proximos vencimientos.`}
      />
      {loading ? <LoadingState label="Cargando panel..." /> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {summary && !loading ? (
        <>
          <div className="row g-3 mb-4">
            {taskStatuses.map((status) => (
              <div key={status} className="col-md-3">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <div className="text-secondary small">{statusLabels[status]}</div>
                    <div className="display-6 fw-semibold">{summary.taskCounts[status] ?? 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h5 mb-0">Proximos vencimientos</h2>
                    <Link href="/tasks" className="btn btn-sm btn-outline-primary">
                      Ver tareas
                    </Link>
                  </div>
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Tarea</th>
                          <th>Estado</th>
                          <th>Prioridad</th>
                          <th>Vence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.upcomingTasks.length ? (
                          summary.upcomingTasks.map((task) => (
                            <tr key={task.id}>
                              <td>
                                <div className="fw-semibold">{task.title}</div>
                                <div className="small text-secondary">{task.project.name}</div>
                              </td>
                              <td>
                                <TaskStatusBadge status={task.status} />
                              </td>
                              <td>
                                <PriorityBadge priority={task.priority} />
                              </td>
                              <td>{formatDate(task.dueDate)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center text-secondary py-4">
                              No hay tareas proximas.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h2 className="h5 mb-3">Actividad reciente</h2>
                  <div className="d-flex flex-column gap-3">
                    {summary.recentActivity.length ? (
                      summary.recentActivity.map((task) => (
                        <div key={task.id} className="border rounded p-3 bg-light-subtle">
                          <div className="d-flex justify-content-between gap-3 flex-wrap">
                            <div>
                              <div className="fw-semibold">{task.title}</div>
                              <div className="small text-secondary">
                                {task.project.name} - actualizada {formatDate(task.updatedAt)}
                              </div>
                            </div>
                            <TaskStatusBadge status={task.status} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-secondary mb-0">Todavia no hay actividad reciente.</p>
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
