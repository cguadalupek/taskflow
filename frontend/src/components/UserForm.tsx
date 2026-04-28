"use client";

import { useEffect, useState } from "react";
import { roles } from "@/lib/constants";
import type { Role, User, UserPayload } from "@/types";

type UserFormProps = {
  submitLabel: string;
  onSubmit: (payload: UserPayload) => Promise<void>;
  initialUser?: User | null;
};

function buildInitialState(initialUser?: User | null) {
  return {
    name: initialUser?.name ?? "",
    email: initialUser?.email ?? "",
    password: "",
    role: initialUser?.role ?? ("DEVELOPER" as Role),
    avatarUrl: initialUser?.avatarUrl ?? "",
  };
}

export function UserForm({ submitLabel, onSubmit, initialUser }: UserFormProps) {
  const [form, setForm] = useState(() => buildInitialState(initialUser));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(buildInitialState(initialUser));
  }, [initialUser]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);

    try {
      const avatarUrl = form.avatarUrl || (initialUser ? null : undefined);

      await onSubmit({
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        role: form.role,
        avatarUrl,
      });

      if (!initialUser) {
        setForm(buildInitialState(null));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card shadow-sm border-0" onSubmit={handleSubmit}>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Correo</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Rol</label>
            <select
              className="form-select"
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as Role }))}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          {!initialUser ? (
            <div className="col-md-6">
              <label className="form-label">Contrasena</label>
              <input
                type="password"
                className="form-control"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                required
              />
            </div>
          ) : null}
          <div className="col-md-6">
            <label className="form-label">URL del avatar</label>
            <input
              type="url"
              className="form-control"
              value={form.avatarUrl}
              onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
            />
          </div>
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
