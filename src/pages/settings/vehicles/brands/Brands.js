import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useHistory } from 'react-router-dom';
import { CLIENT_ROLE_ADMIN, http } from '../../../../utils/Utils';
import SettingsPage from '../../../../components/Settings/SettingsPage';
import { UserContext } from '../../../../store/UserContext';

import BrandsTable from '../../../../components/Vehicles/Brands/BrandsTable';
import TableHeader from '../../../../components/UI/TableHeader';
import PlusOutlineCircle from '../../../../assets/icons/PlusOutlineCircle';

const Brands = () => {
  const history = useHistory();
  const [brandsCount, setBrandsCount] = useState(0);

  const userContext = useContext(UserContext);
  let userData = userContext.data || {};

  const clientId = userData?.client?._id;

  useEffect(() => {
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await http({ url: '/vehicles/brand' });
      setBrandsCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <SettingsPage canAccess={CLIENT_ROLE_ADMIN}>
      <TableHeader
        tableName={'Marche'}
        buttons={[
          {
            function: () => {
              history.push('/settings/veicoli/marche/crea');
            },
            label: 'Aggiungi marca',
            svgIco: <PlusOutlineCircle />,
          },
        ]}
        length={brandsCount}
      />

      <BrandsTable role={CLIENT_ROLE_ADMIN} clientId={clientId} />
    </SettingsPage>
  );
};

export default Brands;
