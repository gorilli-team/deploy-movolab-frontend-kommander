// import React, { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import ClientsTableItem from './ClientsTableItem';
// // import UsersFilterContainer from './UsersFilterContainer';
// import Navigation from '../../UI/Navigation';

// import { exportToCsv, http } from '../../../utils/Utils';

// const ClientsTable = () => {
//   const [isSimple, setIsSimple] = useState(true);
//   const [clients, setClients] = useState([]);
//   const [userCompaniesCount, setUserCompaniesCount] = useState(0);
//   const [from, setFrom] = useState(0);

//   useEffect(() => {
//     fetchUserCompanies();
//   }, []);

//   const fetchClients = async (skip = 0, limit = 10) => {
//     try {
//       const response = await http({ url: `/userCompanies?skip=${skip}&limit=${limit}` });
//       setClients(response.clients);
//       setUserCompaniesCount(response.count);
//     } catch (err) {
//       console.error(err);
//       toast.error(err?.reason?.error || 'Errore');
//     }
//   };

//   const precFunction = () => {
//     if (from - 10 < 0) return;
//     fetchUserCompanies(from - 10, 10);
//     setFrom(from - 10);
//   };

//   const succFunction = () => {
//     if (from + 10 > userCompaniesCount) return;
//     fetchUserCompanies(from + 10, 10);
//     setFrom(from + 10);
//   };

//   //eslint-disable-next-line
//   const dataExportHandler = () => {
//     return exportToCsv('users', userCompanies);
//   };

//   return (
//     <div>
//       <header className="">
//         <div className="flex items-start justify-between py-4">
//           <div className="flex px-4 space-x-2">
//             <button
//               type="button" // onClick={dataExportHandler}
//               className="rounded-lg border border-slate-300 whitespace-nowrap text-sm mb-1 sm:w-auto xs:w-auto enabled:hover:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed sm:mb-0 px-3 py-1"
//             >
//               Esporta
//             </button>

//             <button
//               type="button"
//               onClick={() => setIsSimple(!isSimple)}
//               className="rounded-lg border border-slate-300 whitespace-nowrap text-sm mb-1 sm:w-auto xs:w-auto enabled:hover:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed sm:mb-0 px-3 py-1"
//             >
//               {isSimple ? 'Ricerca avanzata' : 'Ricerca veloce'}
//             </button>

//             {/*<p className="pt-1 font-medium text-gray-500">
//               {userCompaniesCount} aziende
//             </p>*/}
//           </div>
//           <div className="pt-4 px-4">
//             {/* <UsersFilterContainer onSubmit={onSubmit} isSimple={isSimple} /> */}
//           </div>
//         </div>
//       </header>
//       <div className="overflow-auto h-full">
//         {/* Table */}
//         <div className="border-b">
//           <table className="table-auto w-full">
//             {/* Table header */}
//             <thead className="text-xs font-semibold uppercase text-white bg-gray-400 border-t border-b border-gray-200">
//               <tr>
//                 <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
//                   <div className="font-semibold text-left"></div>
//                 </th>
//                 <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
//                   <div className="font-semibold text-left">Ragione Sociale</div>
//                 </th>
//                 <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
//                   <div className="font-semibold text-left">Partita IVA</div>
//                 </th>
//                 <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
//                   <div className="font-semibold text-left">Città</div>
//                 </th>
//                 <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
//                   <div className="font-semibold text-left">Provincia</div>
//                 </th>
//                 <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
//                 <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
//               </tr>
//             </thead>
//             {/* Table body */}
//             <tbody className="text-sm divide-y divide-gray-200">
//               {clients.reverse().map((client, index) => {
//                 return <ClientsTableItem key={index} client={client} />;
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//       <Navigation
//         from={from + 1}
//         to={from + 10}
//         length={clientsCount}
//         precFunction={precFunction}
//         succFunction={succFunction}
//       />
//     </div>
//   );
// };

// export default ClientsTable;
