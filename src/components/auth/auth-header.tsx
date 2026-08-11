export function AuthHeader({
  id,
  title,
  subtitle,
}: {
  id: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h1
        id={id}
        className="text-xl font-medium text-content-primary"
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-content-secondary">{subtitle}</p>
      )}
    </div>
  );
}
