import React from 'react';
import './Loader.css'; // Import the CSS for the spinner

const Loader = () => {
  return (
    <div className="min-w-60 min-h-[4rem] flex items-center justify-center">
      <div className="spinner"></div>
    </div>
  );
};

export default Loader;
