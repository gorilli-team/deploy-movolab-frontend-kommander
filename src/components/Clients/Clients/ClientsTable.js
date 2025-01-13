import { http } from '../../../utils/Utils';
import React, { useEffect, useState } from 'react';
import ClientsTableItem from './ClientsTableItem';
import Navigation from '../../UI/Navigation';

const ClientsTable = ({ filterQuery, activeClientsFilter, updateClientsCount }) => {
  const [from, setFrom] = useState(0);
  const [clients, setClients] = useState([]);
  const [clientsCount, setClientsCount] = useState(0);

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterQuery, activeClientsFilter]);

  const fetchClients = async (skip = 0, limit = 10) => {
    try {
      const query = filterQuery ? `search=${filterQuery}&` : '';

      const activeFilter = activeClientsFilter ? '&active=true' : '';

      const response = await http({
        url: `/clients/client/all?${query}skip=${skip}&limit=${limit}${activeFilter}`,
      });

      setClients(response.result);
      setClientsCount(response.count);
      updateClientsCount(response.count);
    } catch (err) {
      console.error(err);
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchClients(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > clientsCount) return;
    fetchClients(from + 10, 10);
    setFrom(from + 10);
  };

  return (
    <div className="bg-white border-t border-gray-200 overflow-hidden relative">
      <div className="overflow-x-auto h-full">
        {/* Table */}
        <div>
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50">
              <tr>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Nome Cliente</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Partita IVA</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Città</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Stato</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Sepa</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Licenza</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Data</div>
                  <div className="font-semibold text-left">Creazione</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Data</div>
                  <div className="font-semibold text-left">Aggiornamento</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {clients.map((client, index) => {
                return <ClientsTableItem key={index} client={client} />;
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={clientsCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default ClientsTable;
