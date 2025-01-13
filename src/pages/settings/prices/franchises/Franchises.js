import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useHistory } from 'react-router-dom';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR, http } from '../../../../utils/Utils';
import SettingsPage from '../../../../components/Settings/SettingsPage';
import TableHeader from '../../../../components/UI/TableHeader';
import FranchisesTable from '../../../../components/Vehicles/Franchises/FranchisesTable';
import { UserContext } from '../../../../../src/store/UserContext';
import PlusOutlineCircle from '../../../../assets/icons/PlusOutlineCircle';

const Franchises = () => {
  const history = useHistory();
  const [franchisesCount, setFranchisesCount] = useState(0);

  const { data: currentClient } = useContext(UserContext);
  const license = currentClient?.client?.license?.licenseOwner;

  useEffect(() => {
    fetchFranchises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFranchises = async () => {
    try {
      const response = await http({ url: '/vehicles/franchise' });
      setFranchisesCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      {license === 'movolab' || currentClient?.role === CLIENT_ROLE_OPERATOR ? (
        <TableHeader tableName={'Franchigie'} buttons={[]} length={franchisesCount} />
      ) : (
        <TableHeader
          tableName={'Franchigie'}
          buttons={[
            {
              function: () => {
                history.push(`/settings/veicoli/franchigie/crea`);
              },
              label: 'Aggiungi franchigia',
              svgIco: <PlusOutlineCircle />,
            },
          ]}
          length={franchisesCount}
        />
      )}

      <FranchisesTable />
    </SettingsPage>
  );
};

export default Franchises;
