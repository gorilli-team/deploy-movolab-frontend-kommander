import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import RentalLocationsTable from '../../../components/Clients/RentalLocations/RentalLocationsTable';
import { CLIENT_ROLE_OPERATOR, http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN } from '../../../utils/Utils';
import { UserContext } from '../../../store/UserContext';
import SettingsPage from '../../../components/Settings/SettingsPage';
import { useHistory } from 'react-router-dom';
import TableHeader from '../../../components/UI/TableHeader';
import PlusOutlineCircle from '../../../assets/icons/PlusOutlineCircle';

const RentalLocations = () => {
  const history = useHistory();
  const [rentalLocationsCount, setRentalLocationsCount] = useState(0);
  const [rentalLocations, setRentalLocations] = useState([]);

  const userContext = useContext(UserContext);
  let userData = userContext.data || {};

  useEffect(() => {
    fetchRentalLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRentalLocations = async () => {
    try {
      const response = await http({ url: '/clients/rentalLocation' });
      setRentalLocationsCount(response.count);
      setRentalLocations(response.rentalLocations);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <TableHeader
        tableName={'Punti Nolo'}
        buttons={[
          {
            function: () => {
              history.push(`/settings/puntinolo/crea`);
            },
            label: 'Aggiungi punto nolo',
            svgIco: <PlusOutlineCircle />,
            hidden: userData.role !== CLIENT_ROLE_ADMIN,
          },
        ]}
        length={rentalLocationsCount}
      />

      <RentalLocationsTable
        rentalLocations={rentalLocations}
        fetchRentalLocations={fetchRentalLocations}
      />
    </SettingsPage>
  );
};

export default RentalLocations;
