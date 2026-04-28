export function LoadingState({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="d-flex justify-content-center align-items-center py-5 gap-3">
      <div className="spinner-border text-primary" role="status" />
      <span className="text-secondary">{label}</span>
    </div>
  );
}
