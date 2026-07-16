export default function ParametresLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-5 w-56 rounded-full bg-[var(--settings-hover)]" />

      <div className="rounded-[28px] border border-[color:var(--settings-border)] bg-white p-8 shadow-sm">
        <div className="space-y-4">
          <div className="h-4 w-40 rounded-full bg-[var(--settings-hover)]" />
          <div className="h-4 w-72 rounded-full bg-[var(--settings-hover)]" />
        </div>

        <div className="mt-8 grid gap-4">
          <div className="h-20 rounded-2xl bg-[var(--settings-hover)]" />
          <div className="h-20 rounded-2xl bg-[var(--settings-hover)]" />
          <div className="h-20 rounded-2xl bg-[var(--settings-hover)]" />
        </div>
      </div>

      <div className="rounded-[28px] border border-[color:var(--settings-border)] bg-white p-8 shadow-sm">
        <div className="space-y-4">
          <div className="h-4 w-32 rounded-full bg-[var(--settings-hover)]" />
          <div className="h-4 w-64 rounded-full bg-[var(--settings-hover)]" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="h-28 rounded-2xl bg-[var(--settings-hover)]" />
          <div className="h-28 rounded-2xl bg-[var(--settings-hover)]" />
        </div>
      </div>
    </div>
  );
}
