import React, { useState } from 'react';
import toast from 'react-hot-toast';
import UserCompaniesTableItem from './UserCompaniesTableItem';
// import UsersFilterContainer from './UsersFilterContainer';
import Navigation from '../UI/Navigation';

import { exportToCsv, http } from '../../utils/Utils';

export const fetchUserCompanies = async (skip = 0, limit = 10) => {
  try {
    return await http({ url: `/userCompanies?skip=${skip}&limit=${limit}` });
  } catch (err) {
    console.error(err);
    toast.error(err?.reason?.error || 'Errore');
  }
};

const UserCompaniesTable = ({
  userCompanies,
  userCompaniesCount,
  fetchCompanies,
  pagination = 10,
  disableDetails = false,
}) => {
  // const [isSimple, setIsSimple] = useState(true);
  const [from, setFrom] = useState(0);

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchUserCompanies(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > userCompaniesCount) return;
    fetchUserCompanies(from + 10, 10);
    setFrom(from + 10);
  };

  //eslint-disable-next-line
  const dataExportHandler = () => {
    return exportToCsv('users', userCompanies);
  };

  return (
    <div>
      <div className="overflow-auto h-full">
        {/* Table */}
        <div className="border-b">
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-white bg-gray-400 border-t border-b border-gray-200">
              <tr>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left"></div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Ragione Sociale</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Partita IVA</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Città</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Provincia</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {userCompanies.reverse().map((userCompany, index) => {
                return (
                  <UserCompaniesTableItem
                    key={index}
                    userCompany={userCompany}
                    disableDetails={disableDetails}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={userCompaniesCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default UserCompaniesTable;
