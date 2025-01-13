import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MOVOLAB_ROLE_ADMIN, CLIENT_ROLE_ADMIN, http } from '../../../utils/Utils';
import Navigation from '../../UI/Navigation';
import { UserContext } from '../../../store/UserContext';
import ClientProfilesTableItem from './ClientProfilesTableItem';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const ClientProfilesTable = ({ clientId, role, setCount, filterQuery, rentalLocationId }) => {
  const userContext = useContext(UserContext);
  let userData = userContext.data || {};
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'desc',
  });

  const [from, setFrom] = useState(0);
  const [clientProfiles, setClientProfiles] = useState();
  const [clientProfilesCount, setClientProfilesCount] = useState(0);
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
    fetchClientProfiles(from, 10, key, direction);
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  useEffect(() => {
    fetchClientProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.role, filterQuery]);

  const fetchClientProfiles = async (
    skip = 0,
    limit = 10,
    key = sortConfig.key,
    direction = sortConfig.direction,
  ) => {
    try {
      setIsDataLoaded(false);

      const query = filterQuery ? `search=${filterQuery}&` : '';

      if (userData?.role === MOVOLAB_ROLE_ADMIN && !clientId) {
        const response = await http({
          url: `/clientProfile?${query}&sortKey=${key}&sortDirection=${direction}&skip=${skip}&limit=${limit}`,
        });

        setClientProfiles(response.clientProfiles);
        setClientProfilesCount(response.count);
        if (setCount) setCount(response.count);
        setIsDataLoaded(true);
      } else if (userData?.role === MOVOLAB_ROLE_ADMIN && clientId) {
        const response = await http({
          url: `/clientProfile?clientId=${clientId}&${query}skip=${skip}&limit=${limit}`,
        });
        setClientProfiles(response.clientProfiles);
        setClientProfilesCount(response.count);
        if (setCount) setCount(response.count);
        setIsDataLoaded(true);
      } else if (userData?.role === CLIENT_ROLE_ADMIN && clientId) {
        const response = await http({
          url: `/clientProfile?clientId=${clientId}&&${query}skip=${skip}&limit=${limit}${query}`,
        });
        setClientProfiles(response.clientProfiles);
        setClientProfilesCount(response.count);
        if (setCount) setCount(response.count);
        setIsDataLoaded(true);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchClientProfiles(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > clientProfilesCount) return;
    fetchClientProfiles(from + 10, 10);
    setFrom(from + 10);
  };

  if (!isDataLoaded) {
    return <></>;
  }

  if (!clientProfiles || clientProfiles.length === 0) {
    return (
      <div className="p-5 bg-gray-50">
        <div className="mt-5">Nessun profilo cliente trovato</div>
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
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
                {role !== 'client' && (
                  <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left cursor-pointer flex items-center space-x-1">
                      <span>Cliente</span>
                    </div>
                  </th>
                )}
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div
                    className="font-semibold text-left cursor-pointer flex items-center space-x-1"
                    onClick={() => handleSort('role')}
                  >
                    <span>Ruolo</span>
                    {getSortIcon('role')}
                  </div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div
                    className="font-semibold text-left cursor-pointer flex items-center space-x-1"
                    onClick={() => handleSort('email')}
                  >
                    <span>Email</span>
                    {getSortIcon('email')}
                  </div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left cursor-pointer flex items-center space-x-1">
                    <span>Stato</span>
                  </div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div
                    className="font-semibold text-left cursor-pointer flex items-center space-x-1"
                    onClick={() => handleSort('createdAt')}
                  >
                    <span>Data Creazione</span>
                    {getSortIcon('createdAt')}
                  </div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div
                    className="font-semibold text-left cursor-pointer flex items-center space-x-1"
                    onClick={() => handleSort('lastActivity')}
                  >
                    <span>Ultima Attività</span>
                    {getSortIcon('lastActivity')}
                  </div>
                </th>
                <th className=""></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {clientProfiles.map((clientProfile, index) => {
                return (
                  <ClientProfilesTableItem
                    key={index}
                    clientProfile={clientProfile}
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
        length={clientProfilesCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default ClientProfilesTable;
