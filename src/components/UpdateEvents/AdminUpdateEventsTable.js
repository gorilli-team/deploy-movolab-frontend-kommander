import React, { useEffect, useState } from 'react';
import UpdateEventsTableItem from './UpdateEventsTableItem';
import Navigation from '../UI/Navigation';
import toast from 'react-hot-toast';

import { http } from '../../utils/Utils';

const UpdateEventsTable = ({ collectionName, id }) => {
  const [from, setFrom] = useState(0);
  const [updateEventsCount, setUpdateEventsCount] = useState(0);
  const [updateEvents, setUpdateEvents] = useState([]);

  useEffect(() => {
    fetchUpdateEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUpdateEvents = async (skip = 0, limit = 10) => {
    try {
      const response = await http({
        url: `/updateEvents/admin?collectionName=${collectionName}&documentId=${id}&skip=${skip}&limit=${limit}`,
      });
      setUpdateEvents(response.updateEvents);
      setUpdateEventsCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchUpdateEvents(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > updateEventsCount) return;
    fetchUpdateEvents(from + 10, 10);
    setFrom(from + 10);
  };

  return (
    <div className="bg-white rounded border-gray-200 overflow-hidden">
      <div className="overflow-auto h-full border-b">
        {/* Table */}
        <div>
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-white bg-gray-400 border-b">
              <tr>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">ID Aggiornamento</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Aggiornato da</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Info</div>
                </th>

                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Data Aggiornamento</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {updateEvents.reverse().map((updateEvent, index) => {
                return <UpdateEventsTableItem key={index} updateEvent={updateEvent} />;
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={updateEventsCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default UpdateEventsTable;
