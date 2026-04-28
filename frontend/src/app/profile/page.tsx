"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { flattenApiErrors, getFirstErrorMessage } from "@/lib/format";
import { ApiClientError, api } from "@/services/api";

export default function ProfilePage() {
  const { refreshUser, user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    avatarUrl: "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl ?? "",
      });
    }
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      await api.updateProfile({
        name: form.name,
        email: form.email,
        avatarUrl: form.avatarUrl || null,
      });
      await refreshUser();
      setMessage("Perfil actualizado correctamente.");
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError([caughtError.message, ...flattenApiErrors(caughtError.errors)].join(" "));
      } else {
        setError(getFirstErrorMessage(caughtError));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthGuard>
      <PageHeader title="Perfil" description="Actualiza tus datos basicos y tu avatar opcional." />
      <div className="row">
        <div className="col-lg-7">
          <form className="card shadow-sm border-0" onSubmit={handleSubmit}>
            <div className="card-body">
              {message ? <div className="alert alert-success">{message}</div> : null}
              {error ? <div className="alert alert-danger">{error}</div> : null}
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Correo</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label">URL del avatar</label>
                <input
                  type="url"
                  className="form-control"
                  value={form.avatarUrl}
                  onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                />
              </div>
              <button className="btn btn-primary" disabled={busy}>
                {busy ? "Guardando..." : "Guardar perfil"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
