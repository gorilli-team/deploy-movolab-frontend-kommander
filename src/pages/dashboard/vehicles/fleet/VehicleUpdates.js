import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Page from '../../../../components/Dashboard/Page';
import WhiteButton from '../../../../components/UI/buttons/WhiteButton';
import UpdateEventsTable from '../../../../components/UpdateEvents/UpdateEventsTable';
import { http } from '../../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../../utils/Utils';

const VehicleUpdates = () => {
  const params = useParams();
  const history = useHistory();
  const [vehicle, setVehicle] = useState({});

  const fetchVehicle = async () => {
    try {
      const response = await http({ url: `/vehicles/vehicle/${params.id}` });

      setVehicle(response);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVehicle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <div className="p-4 left-0">
        <div className="flex">
          <div className="px-2">
            <WhiteButton onClick={() => history.goBack()}>Indietro</WhiteButton>
          </div>
        </div>
        <div className="p-2">
          <div className="text-xl">
            <span className="font-semibold">Aggiornamenti:</span>{' '}
            {vehicle?.plate ? vehicle.plate.toUpperCase() : ''}
          </div>
          <div className="mt-4">
            <UpdateEventsTable collectionName={'vehicles'} id={params.id} />
          </div>
        </div>
      </div>
    </Page>
  );
};

export default VehicleUpdates;
