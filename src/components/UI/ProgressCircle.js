import React from 'react';

const ProgressCircle = ({ usage, total }) => {
  const completed = Math.round((usage / total) * 100, 2);
  const getBarColor = (completed) => {
    if (completed < 75) {
      return '#22c55e';
    } else if (completed < 100) {
      return '#eab308';
    } else {
      return '#ef4444';
    }
  };

  const fillerStyles = {
    background: `conic-gradient(${getBarColor(completed)} calc(${completed} * 1%), #e7eef4 0)`,
    mask: `radial-gradient(farthest-side, #0000 calc(75%), #000 calc(77%))`
  };

  const label = completed > 20 ? `${usage}/${total} ${completed}%` : `${usage}/${total} `;

  return (
    <div className="aspect-square w-full bg-white rounded-full inline-grid border-4 border-white relative">
      <div style={fillerStyles} className="rounded-full flex items-center justify-center" />
      <div className="text-slate-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-bold">{label}</div>
    </div>
  );
};

export default ProgressCircle;
