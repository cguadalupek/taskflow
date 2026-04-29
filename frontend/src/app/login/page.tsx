"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { flattenApiErrors, getFirstErrorMessage } from "@/lib/format";
import { ApiClientError } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, user } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [nextPath, setNextPath] = useState("/dashboard");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath);
    }
  }, [loading, nextPath, router, user]);

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next) {
      setNextPath(next);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await login(form);
      startTransition(() => {
        router.push(nextPath);
      });
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
    <div className="min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4 p-lg-5">
                <div className="mb-4">
                  <span className="badge text-bg-success-subtle border border-success-subtle text-success mb-3">
                    TaskFlow Pro
                  </span>
                  <h1 className="h3 mb-2">Iniciar sesion</h1>
                  <p className="text-secondary mb-0">
                    Ingresa con tu cuenta para acceder a la plataforma.
                  </p>
                </div>
                {error ? <div className="alert alert-danger">{error}</div> : null}
                <form onSubmit={handleSubmit}>
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
                    <label className="form-label">Contraseña</label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        value={form.password}
                        onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                          >
                            <path d="M13.359 11.238 15 13.5l-.707.707-2.013-2.013A8.94 8.94 0 0 1 8 13C3 13 0 8 0 8a15.73 15.73 0 0 1 3.08-3.898L1.146 2.168l.708-.707 12 12-.707.707-1.788-1.788ZM11.297 10.176l-1.473-1.473a2 2 0 0 1-2.523-2.523L5.35 4.228A14.52 14.52 0 0 0 1.173 8 13.13 13.13 0 0 0 8 11.5a7.69 7.69 0 0 0 3.297-.824ZM10.477 5.82l1.57 1.57c.238.2.465.413.68.638a15.73 15.73 0 0 0-3.08-3.898A8.94 8.94 0 0 0 8 3c-.732 0-1.43.09-2.09.262l1.216 1.216A2 2 0 0 1 10.477 5.82Z" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                          >
                            <path d="M16 8s-3-5-8-5-8 5-8 5 3 5 8 5 8-5 8-5ZM1.173 8A13.13 13.13 0 0 1 8 4.5 13.13 13.13 0 0 1 14.827 8 13.13 13.13 0 0 1 8 11.5 13.13 13.13 0 0 1 1.173 8Z" />
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm0 1a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <button className="btn btn-primary w-100" disabled={busy}>
                    {busy ? "Ingresando..." : "Entrar"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
