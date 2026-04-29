"use client";

import { useEffect, useState } from "react";
import { roles } from "@/lib/constants";
import type { Role, User, UserPayload } from "@/types";

type UserFormProps = {
  submitLabel: string;
  onSubmit: (payload: UserPayload) => Promise<void>;
  initialUser?: User | null;
  onInteraction?: () => void;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getValidationError(form: ReturnType<typeof buildInitialState>, initialUser?: User | null) {
  const trimmedName = form.name.trim();
  const trimmedEmail = form.email.trim();
  const trimmedAvatarUrl = form.avatarUrl.trim();

  if (trimmedName.length < 2) {
    return "El nombre debe tener al menos 2 caracteres.";
  }

  if (trimmedName.length > 100) {
    return "El nombre no puede superar los 100 caracteres.";
  }

  if (!emailPattern.test(trimmedEmail)) {
    return "Ingresa un correo valido.";
  }

  if (!initialUser) {
    if (form.password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }

    if (!/[A-Z]/.test(form.password)) {
      return "La contraseña debe contener al menos una mayuscula.";
    }

    if (!/[a-z]/.test(form.password)) {
      return "La contraseña debe contener al menos una minuscula.";
    }

    if (!/[0-9]/.test(form.password)) {
      return "La contraseña debe contener al menos un numero.";
    }

    if (!/[^A-Za-z0-9]/.test(form.password)) {
      return "La contraseña debe contener al menos un caracter especial.";
    }
  }

  if (trimmedAvatarUrl && !isValidUrl(trimmedAvatarUrl)) {
    return "La URL del avatar debe ser valida.";
  }

  return null;
}

function buildInitialState(initialUser?: User | null) {
  return {
    name: initialUser?.name ?? "",
    email: initialUser?.email ?? "",
    password: "",
    role: initialUser?.role ?? ("DEVELOPER" as Role),
    avatarUrl: initialUser?.avatarUrl ?? "",
  };
}

export function UserForm({ submitLabel, onSubmit, initialUser, onInteraction }: UserFormProps) {
  const [form, setForm] = useState(() => buildInitialState(initialUser));
  const [busy, setBusy] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const updateField = <K extends keyof ReturnType<typeof buildInitialState>>(key: K, value: (typeof form)[K]) => {
    setClientError(null);
    onInteraction?.();
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    setForm(buildInitialState(initialUser));
    setClientError(null);
  }, [initialUser]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = getValidationError(form, initialUser);

    if (validationError) {
      setClientError(validationError);
      onInteraction?.();
      return;
    }

    setBusy(true);

    try {
      const avatarUrl = form.avatarUrl.trim() || (initialUser ? null : undefined);

      await onSubmit({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password || undefined,
        role: form.role,
        avatarUrl,
      });

      setClientError(null);

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
        {clientError ? <div className="alert alert-warning">{clientError}</div> : null}
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Correo</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Rol</label>
            <select
              className="form-select"
              value={form.role}
              onChange={(event) => updateField("role", event.target.value as Role)}
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
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                required
              />
              <div className="form-text">
                Minimo 8 caracteres, con mayuscula, minuscula, numero y caracter especial.
              </div>
            </div>
          ) : null}
          <div className="col-md-6">
            <label className="form-label">URL del avatar</label>
            <input
              type="url"
              className="form-control"
              value={form.avatarUrl}
              onChange={(event) => updateField("avatarUrl", event.target.value)}
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
