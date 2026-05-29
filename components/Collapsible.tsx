import { useState, type ReactNode } from 'react';

interface CollapsibleProps {
  title: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Collapsible({ title, defaultOpen = false, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="collapsible">
      <button
        type="button"
        className="collapsible__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {title}
        <span className={`collapsible__chevron ${open ? 'collapsible__chevron--open' : ''}`}>
          ▼
        </span>
      </button>
      {open && <div className="collapsible__body">{children}</div>}
    </div>
  );
}
