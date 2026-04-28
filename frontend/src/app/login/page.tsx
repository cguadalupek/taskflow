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
    email: "admin@taskflow.com",
    password: "Admin123!",
  });
  const [nextPath, setNextPath] = useState("/dashboard");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

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
                    Usa las credenciales del seeder o entra con tu cuenta registrada.
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
                    <label className="form-label">Contrasena</label>
                    <input
                      type="password"
                      className="form-control"
                      value={form.password}
                      onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                      required
                    />
                  </div>
                  <button className="btn btn-primary w-100" disabled={busy}>
                    {busy ? "Ingresando..." : "Entrar"}
                  </button>
                </form>
                <div className="mt-4 p-3 rounded bg-light border">
                  <div className="small text-secondary">Usuario admin de prueba</div>
                  <div className="fw-semibold">admin@taskflow.com</div>
                  <div className="fw-semibold">Admin123!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
