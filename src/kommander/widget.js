// "use client";

// import React, { useState } from "react";

// const Widget = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const togglePanel = () => {
//     setIsOpen((prev) => !prev);
//   };

//   return (
//     <>
//       <button
//         onClick={togglePanel}
//         className="ml-4 flex items-center justify-centeAr w-8 h-8"
//         >
//         <img src="/logo-kommander.png" alt="kommander-icon" className="w-full h-full" />
//       </button>


//       {isOpen && (
//         <div className="fixed inset-0 flex items-center justify-center z-50">
//           <div style={{
//             width: '60%',
//             height: '650px',
//             backgroundColor: 'white',
//             border: '1px solid #ddd',
//             borderRadius: '10px',
//             boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
//             overflow: 'hidden',
//             zIndex: 1000,
//           }} className="relative w-11/12 max-w-4xl border border-gray-300 rounded-lg shadow-lg overflow-hidden">
//             <ChatWidget/>
//             <button
//               onClick={togglePanel}
//               className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
//             >
//               ✖
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Widget;