"use client";

import { useState } from "react";
import type { ProjectPayload } from "@/types";

type ProjectFormProps = {
  initialValues?: ProjectPayload;
  submitLabel: string;
  onSubmit: (payload: ProjectPayload) => Promise<void>;
};

export function ProjectForm({ initialValues, submitLabel, onSubmit }: ProjectFormProps) {
  const [form, setForm] = useState<ProjectPayload>(
    initialValues ?? {
      name: "",
      description: "",
    },
  );
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      await onSubmit(form);
      if (!initialValues) {
        setForm({ name: "", description: "" });
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
            <label className="form-label">Name</label>
            <input
              className="form-control"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </div>
          <div className="col-md-8">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              required
            />
          </div>
        </div>
        <div className="mt-3">
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
