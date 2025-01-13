import React from 'react';

const SmartAssistantButton = ({ text = 'Smart Assistant ✨', onClick }) => {
  return (
    <div className="">
      <button
        onClick={onClick}
        className="relative inline-block px-4 py-2 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300 cursor-pointer" // Styled like a button
      >
        <span className="absolute inset-0 w-full h-full bg-white opacity-0 transition-opacity duration-300 hover:opacity-10 rounded-lg"></span>
        {text}
      </button>
    </div>
  );
};

export default SmartAssistantButton;
