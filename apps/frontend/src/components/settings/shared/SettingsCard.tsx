import type { ReactNode } from "react";

interface SettingsCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  className?: string;
}

export default function SettingsCard({
  children,
  title,
  description,
  actionLabel,
  className,
}: SettingsCardProps) {
  return (
    <article
      className={`rounded-2xl border border-[color:var(--settings-border-strong)] bg-white p-6 lg:p-8 shadow-sm ${className ?? ""}`}
    >
      {title || description || actionLabel ? (
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title ? (
              <h3 className="text-lg font-bold tracking-[-0.02em] text-[var(--chocolat)]">
                {title}
              </h3>
            ) : null}

            {description ? (
              <p className="mt-2 text-sm leading-6 text-[var(--chocolat-muted)]">
                {description}
              </p>
            ) : null}
          </div>

          {actionLabel ? (
            <button
              type="button"
              className="shrink-0 rounded-full border border-[color:var(--settings-border-strong)] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--chocolat)] transition-colors hover:bg-[var(--settings-hover)]"
            >
              {actionLabel}
            </button>
          ) : null}
        </header>
      ) : null}

      <div>{children}</div>
    </article>
  );
}
