import * as React from 'react';

export default function SettingsIcon({ selected }) {
  return (
    <svg viewBox="0 0 24 24" className="flex-shrink-0 h-6 w-6 lg:mr-3 ml-2">
      <path
        className={`fill-current text-white ${selected && 'text-white'}`}
        d="M19.714 14.7l-7.007 7.007-1.414-1.414 7.007-7.007c-.195-.4-.298-.84-.3-1.286a3 3 0 113 3 2.969 2.969 0 01-1.286-.3z"
      />
      <path
        className={`fill-current text-white ${selected && 'text-white'}`}
        d="M10.714 18.3c.4-.195.84-.298 1.286-.3a3 3 0 11-3 3c.002-.446.105-.885.3-1.286l-6.007-6.007 1.414-1.414 6.007 6.007z"
      />
      <path
        className={`fill-current text-white ${selected && 'text-white'}`}
        d="M5.7 10.714c.195.4.298.84.3 1.286a3 3 0 11-3-3c.446.002.885.105 1.286.3l7.007-7.007 1.414 1.414L5.7 10.714z"
      />
      <path
        className={`fill-current text-white ${selected && 'text-white'}`}
        d="M19.707 9.292a3.012 3.012 0 00-1.415 1.415L13.286 5.7c-.4.195-.84.298-1.286.3a3 3 0 113-3 2.969 2.969 0 01-.3 1.286l5.007 5.006z"
      />
    </svg>
  );
}
