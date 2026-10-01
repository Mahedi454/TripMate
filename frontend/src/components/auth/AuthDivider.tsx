interface AuthDividerProps {
  children?: string;
}

/** Thin rule with a centered label, used to separate "or continue with". */
export function AuthDivider({ children = "OR" }: AuthDividerProps) {
  return (
    <div className="flex items-center gap-4" role="separator" aria-label={children}>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {children}
      </span>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
    </div>
  );
}