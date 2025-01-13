import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MOVOLAB_ROLE_ADMIN, CLIENT_ROLE_ADMIN, http } from '../../utils/Utils';
import Navigation from '../UI/Navigation';
import { UserContext } from '../../store/UserContext';
import CargosSubmissionsTableItem from './CargosSubmissionsTableItem';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const CargosSubmissionsTable = ({ clientId, filterQuery }) => {
  const userContext = useContext(UserContext);
  let userData = userContext.data || {};
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'desc',
  });

  const [from, setFrom] = useState(0);
  const [cargosSubmissions, setCargosSubmissions] = useState([]);
  const [cargosSubmissionsCount, setCargosSubmissionsCount] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  if (userData.role === CLIENT_ROLE_ADMIN) {
    clientId = userData.client?._id;
  }

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    // Add sorting logic here
    fetchCargosSubmissions(from, 10, key, direction);
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  useEffect(() => {
    fetchCargosSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.role, filterQuery]);

  const fetchCargosSubmissions = async (
    skip = 0,
    limit = 10,
    key = sortConfig.key,
    direction = sortConfig.direction,
  ) => {
    try {
      setIsDataLoaded(false);
      const response = await http({
        url: `/cargos/cargosSubmissions?sortKey=${key}&sortDirection=${direction}&skip=${skip}&limit=${limit}`,
      });

      setCargosSubmissions(response.cargosSubmissions);
      setCargosSubmissionsCount(response.count);
      setIsDataLoaded(true);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    setCargosSubmissions(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > cargosSubmissionsCount) return;
    setCargosSubmissions(from + 10, 10);
    setFrom(from + 10);
  };

  if (!isDataLoaded) {
    return <></>;
  }

  if (!cargosSubmissions || cargosSubmissions.length === 0) {
    return (
      <div className="p-5 bg-gray-100 rounded-md font-semibold">
        <div className="">Nessun Dato da Inviare a Cargos</div>
      </div>
    );
  }

  return (
    <div className="bg-white border-t border-gray-200 overflow-hidden relative">
      <div className="overflow-x-auto h-full">
        {/* Table */}
        <div>
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50">
              <tr>
                {' '}
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div
                    className="font-semibold text-left cursor-pointer flex items-center space-x-1"
                    onClick={() => handleSort('email')}
                  >
                    <span>Movo</span>
                    {getSortIcon('email')}
                  </div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left cursor-pointer flex items-center space-x-1">
                    <span>Stato</span>
                  </div>
                </th>
                {userData?.role === MOVOLAB_ROLE_ADMIN && (
                  <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left cursor-pointer flex items-center space-x-1">
                      <span>Cliente</span>
                    </div>
                  </th>
                )}
                {userData?.role === MOVOLAB_ROLE_ADMIN && (
                  <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left cursor-pointer flex items-center space-x-1">
                      <span>Tipo Licenza</span>
                    </div>
                  </th>
                )}
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div
                    className="font-semibold text-left cursor-pointer flex items-center space-x-1 w-64"
                    onClick={() => handleSort('createdAt')}
                  >
                    <span>Data Creazione</span>
                    {getSortIcon('createdAt')}
                  </div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div
                    className="font-semibold text-left cursor-pointer flex items-center space-x-1 w-64"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <span>Data Invio</span>
                    {getSortIcon('updatedAt')}
                  </div>
                </th>
                <th className="w-48"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {cargosSubmissions.map((cargosSubmission, index) => {
                return (
                  <CargosSubmissionsTableItem
                    key={index}
                    cargosSubmission={cargosSubmission}
                    role={userData?.role}
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
        length={cargosSubmissionsCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default CargosSubmissionsTable;
