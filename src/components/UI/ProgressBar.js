import React from 'react';

const ProgressBar = ({ usage, total }) => {
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

  const containerStyles = {
    height: 20,
    width: '100%',
    backgroundColor: '#cbd5e1',
    borderRadius: 50,
  };

  const fillerStyles = {
    height: '100%',
    width: `${Math.min(100, completed)}%`,
    backgroundColor: getBarColor(completed),
    borderRadius: 'inherit',
    textAlign: 'right',
  };

  const labelStyles = {
    padding: 5,
    color: 'white',
    fontWeight: 'bold',
  };

  const label = completed > 20 ? `${usage}/${total} ${completed}%` : `${usage}/${total} `;

  return (
    <div style={containerStyles}>
      <div style={fillerStyles}>
        <span style={labelStyles}>{label}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
