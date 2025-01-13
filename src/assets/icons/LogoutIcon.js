import * as React from 'react';

export default function LogoutIcon({ selected }) {
  return (
    <svg viewBox="0 0 24 24" className="flex-shrink-0 h-6 w-6 lg:mr-3">
      <path
        className={`fill-current text-blue-400 ${selected && 'text-blue-500'}`}
        d="M8.07 16H10V8H8.07a8 8 0 1 1 0 8z"
      />
      <path
        className={`fill-current text-blue-600 ${selected && 'text-blue-600'}`}
        d="M12 3c-4.963 0-9 4.037-9 9s4.037 9 9 9 9-4.037 9-9-4.037-9-9-9z"
      />
      <path
        className={`fill-current text-blue-400 ${selected && 'text-blue-200'}`}
        d="M15 12 8 6v5H0v2h8v5z"
      />
    </svg>
  );
}
