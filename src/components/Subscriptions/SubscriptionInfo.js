import React, { useEffect, useState } from 'react';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import { http } from '../../utils/Utils';
import toast from 'react-hot-toast';
import ElementLabel from '../UI/ElementLabel';

const SubscriptionInfo = ({ ...props }) => {
  const [client, setClient] = useState(null);

  useEffect(
    () => {
      fetchClient();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const fetchClient = async () => {
    try {
      const response = await http({
        method: 'GET',
        url: `/clients/client`,
      });

      setClient(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <div className="flex flex-wrap md:flex-nowrap pt-4 px-4 gap-x-4">
      <div className="p-3 flex-1 flex-col space-y-2">
        <div>
          {client?.license?.licenseOwner === 'movolab' ? (
            <ElementLabel bgColor="bg-blue-500">Licenza Movolab</ElementLabel>
          ) : (
            <ElementLabel bgColor="bg-gray-500">Licenza Personale</ElementLabel>
          )}
        </div>
        <div>
          {client?.currentPack && (
            <ElementLabel bgColor="bg-green-500">Pack {client?.currentPack?.name}</ElementLabel>
          )}
        </div>
      </div>
      <div className="md:text-right p-1">
        <div className="mb-4 text-sm">
          <div className="flex space-x-1 md:justify-end mb-2">
            <strong className="inline-block">Data registrazione:</strong>
            <DisplayDateTime date={client?.createdAt} displayType={'flat'} />
          </div>

          {client?.currentPack && (
            <div className="flex space-x-1 md:justify-end">
              <strong className="inline-block">Data attivazione pack:</strong>
              <DisplayDateTime
                date={client?.packHistory[client.packHistory.length - 1].startDate}
                displayType={'flat'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionInfo;
