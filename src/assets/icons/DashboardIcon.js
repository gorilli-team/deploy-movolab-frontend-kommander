import React from 'react';

export default function DashboardIcon({ selected }) {
  return (
    <svg viewBox="0 0 24 24" className="flex-shrink-0 h-6 w-6 lg:mr-3">
      <path
        className={`fill-current text-white ${selected && 'text-white'}`}
        d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0z"
      />
      <path
        className={`fill-current text-slate-200 ${selected && 'text-slate-300'}`}
        d="M12 3c-4.963 0-9 4.037-9 9s4.037 9 9 9 9-4.037 9-9-4.037-9-9-9z"
      />
      <path
        className={`fill-current text-slate-400 ${selected && 'text-slate-500'}`}
        d="M12 15c-1.654 0-3-1.346-3-3 0-.462.113-.894.3-1.285L6 6l4.714 3.301A2.973 2.973 0 0112 9c1.654
            0 3 1.346 3 3s-1.346 3-3 3z"
      />
    </svg>
  );
}
