/**
 * Page heading for catalog routes: a display-font title (Montserrat Black
 * Italic) with an optional muted subtitle. Keeps titles consistent and on-brand.
 */
export function PageHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-8">
      <h1 className="font-display text-3xl text-ink sm:text-4xl">{title}</h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl font-meta text-sm text-ink-soft">
          {subtitle}
        </p>
      )}
    </header>
  );
}
