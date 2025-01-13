import React, { useEffect, useState } from 'react';
import { http } from '../../utils/Utils';
import toast from 'react-hot-toast';
import Navigation from '../UI/Navigation';
import ClientsTableItem from '../Clients/Clients/ClientsTableItem';

const PackUsageTable = ({ packId }) => {
  const [from, setFrom] = useState(0);

  const [clients, setClients] = useState([]);
  const [packClientsCount, setPackClientsCount] = useState(0);

  useEffect(() => {
    fetchPacksClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packId]);

  const fetchPacksClients = async (skip = 0, limit = 10) => {
    try {
      const response = await http({
        url: `/clientPayments/packs/clients/${packId}?skip=${skip}&limit=${limit}`,
      });

      setClients(response.clients);
      setPackClientsCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchPacksClients(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > packClientsCount) return;
    fetchPacksClients(from + 10, 10);
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
              {clients.reverse().map((client, index) => {
                return <ClientsTableItem key={index} client={client} />;
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={packClientsCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default PackUsageTable;
