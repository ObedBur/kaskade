import type { ReactNode } from "react";

interface SettingsSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function SettingsSection({
  title,
  description,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section className={`space-y-6 ${className ?? ""}`}>
      {(title || description) ? (
        <header className="mb-8">
          {title ? (
            <h2 className="text-lg font-bold uppercase tracking-[0.2em] text-[var(--chocolat)]">
              {title}
            </h2>
          ) : null}

          {description ? (
            <p className="max-w-3xl text-sm leading-6 text-[var(--chocolat-muted)]">
              {description}
            </p>
          ) : null}
        </header>
      ) : null}

      <div className="space-y-6">{children}</div>
    </section>
  );
}
