import React, { useEffect, useState } from 'react';
// import UpdateEventsTableItem from './UpdateEventsTableItem';
import Navigation from '../UI/Navigation';
import toast from 'react-hot-toast';

import { http } from '../../utils/Utils';
import ElementLabel from '../UI/ElementLabel';
import Button from '../UI/buttons/Button';

const UpdateEventsTable = ({ collectionName, id }) => {
  const [from, setFrom] = useState(0);
  const [updateEventsCount, setUpdateEventsCount] = useState(0);
  const [updateEvents, setUpdateEvents] = useState([]);
  const [eventDetails, setEventDetails] = useState(null);

  useEffect(() => {
    fetchUpdateEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUpdateEvents = async (skip = 0, limit = 10) => {
    try {
      const response = await http({
        url: `/updateEvents?collectionName=${collectionName}&documentId=${id}&skip=${skip}&limit=${limit}`,
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
    <div className="bg-white rounded border-gray-200 divide-y divide-gray-200">
      {eventDetails ? (
        <>
          <div className="text-sm px-3 py-2 flex justify-between items-center">
            <div>
              <ElementLabel className="bg-slate-700 text-slate-500">Modificato</ElementLabel> da{' '}
              {eventDetails?.clientProfile?.fullname}
              {eventDetails.createdAt !== undefined &&
                ' il ' + new Date(eventDetails.createdAt).toLocaleString()}
              <small className="text-xs text-gray-400 ml-2">ID: {eventDetails._id}</small>
            </div>
            <div>
              <Button className="!py-1" btnStyle="white" onClick={() => setEventDetails(null)}>
                &laquo; indietro
              </Button>
            </div>
          </div>

          {Object.entries(eventDetails?.document).map(([key, val], index) => (
            <div className="text-xs px-4 py-3 font-mono overflow-auto" key={index}>
              <strong>{key}</strong>: <span>{JSON.stringify(val)}</span>
            </div>
          ))}
        </>
      ) : (
        <>
          {updateEvents.reverse().map((updateEvent, index) => (
            <div className="text-sm px-3 py-2 flex justify-between items-center" key={index}>
              <div>
                <ElementLabel className="bg-slate-700 text-slate-500">Modificato</ElementLabel> da{' '}
                {updateEvent?.clientProfile?.fullname}
                {updateEvent.createdAt !== undefined &&
                  ' il ' + new Date(updateEvent.createdAt).toLocaleString()}
                <small className="text-xs text-gray-400 ml-2">ID: {updateEvent._id}</small>
              </div>
              <div>
                <Button
                  className="!py-1"
                  btnStyle="white"
                  onClick={() => setEventDetails(updateEvent)}
                >
                  Dettagli &raquo;
                </Button>
              </div>
            </div>
          ))}

          <Navigation
            from={from + 1}
            to={from + 10}
            length={updateEventsCount}
            precFunction={precFunction}
            succFunction={succFunction}
          />
        </>
      )}
    </div>
  );
};

export default UpdateEventsTable;
