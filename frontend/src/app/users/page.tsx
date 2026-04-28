"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { UserForm } from "@/components/UserForm";
import { roleLabels } from "@/lib/constants";
import { flattenApiErrors, formatDate, getFirstErrorMessage } from "@/lib/format";
import { ApiClientError, api } from "@/services/api";
import type { User, UserPayload } from "@/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const response = await api.getUsers({ page: 1, limit: 50, sortBy: "createdAt", sortOrder: "desc" });
      setUsers(response.data);
    } catch (caughtError) {
      setError(getFirstErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (payload: UserPayload) => {
    try {
      await api.createUser(payload);
      setError(null);
      await loadUsers();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError([caughtError.message, ...flattenApiErrors(caughtError.errors)].join(" "));
      } else {
        setError(getFirstErrorMessage(caughtError));
      }
    }
  };

  const handleUpdate = async (payload: UserPayload) => {
    if (!selectedUser) {
      return;
    }

    try {
      await api.updateUser(selectedUser.id, payload);
      setSelectedUser(null);
      setError(null);
      await loadUsers();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError([caughtError.message, ...flattenApiErrors(caughtError.errors)].join(" "));
      } else {
        setError(getFirstErrorMessage(caughtError));
      }
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      await api.deleteUser(userId);
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
      setError(null);
      await loadUsers();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError([caughtError.message, ...flattenApiErrors(caughtError.errors)].join(" "));
      } else {
        setError(getFirstErrorMessage(caughtError));
      }
    }
  };

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <PageHeader title="Usuarios" description="Administracion de usuarios con soft delete y roles." />
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <div className="mb-4">
        <UserForm
          submitLabel={selectedUser ? "Actualizar usuario" : "Crear usuario"}
          initialUser={selectedUser}
          onInteraction={() => setError(null)}
          onSubmit={selectedUser ? handleUpdate : handleCreate}
        />
        {selectedUser ? (
          <button className="btn btn-link px-0 mt-2" onClick={() => setSelectedUser(null)}>
            Cancelar edicion
          </button>
        ) : null}
      </div>
      {loading ? <LoadingState label="Cargando usuarios..." /> : null}
      {!loading ? (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Creado</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {users.length ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{roleLabels[user.role]}</td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedUser(user)}>
                              Editar
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(user.id)}>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-secondary">
                        No hay usuarios disponibles.
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
