export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
      <div>
        <h1 className="h3 mb-1">{title}</h1>
        <p className="text-secondary mb-0">{description}</p>
      </div>
      {actions}
    </div>
  );
}
