import React, { useContext, useEffect, useState } from 'react';
import SettingsPage from '../../../components/Settings/SettingsPage';
import DamagesTable from '../../../components/Clients/Prices/DamagesTable';
import TableHeader from '../../../components/UI/TableHeader';
import { useHistory } from 'react-router-dom';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR, http } from '../../../utils/Utils';
import toast from 'react-hot-toast';
import { UserContext } from '../../../store/UserContext';
import PlusOutlineCircle from '../../../assets/icons/PlusOutlineCircle';

const Damages = () => {
  const history = useHistory();
  const [damagesCount, setDamagesCount] = useState(0);
  const [damages, setDamages] = useState([]);

  const { data: currentClient } = useContext(UserContext);
  const licenseOwner = currentClient?.client?.license?.licenseOwner;

  const buttons = currentClient?.role === CLIENT_ROLE_ADMIN ? [
    {
      function: () => {
        history.push(`/settings/listini/danni/crea`);
      },
      label: 'Aggiungi listino danno',
      svgIco: <PlusOutlineCircle />,
    },
  ] : [];

  if (licenseOwner === 'client' && currentClient?.role === CLIENT_ROLE_ADMIN) {
    buttons.push({
      function: () => {
        setDefaultPricingDamages();
      },
      label: 'Setta Listino Danni di Default 🤖',
    });
  }

  useEffect(() => {
    fetchDamages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDamages = async (skip = 0, limit = 10) => {
    try {
      const response = await http({ url: `/pricing/damages?skip=${skip}&limit=${limit}` });
      setDamagesCount(response.count);
      setDamages(response.damages);
    } catch (err) {
      console.error(err);
    }
  };

  const setDefaultPricingDamages = async () => {
    try {
      await http({ url: `/pricing/damages/default`, method: 'POST' });
      fetchDamages();
      toast.success('Listino Danni di Default Settato');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <TableHeader tableName={'Listini Danni'} buttons={buttons} length={damagesCount} />

      <DamagesTable newDamages={damages} />
    </SettingsPage>
  );
};

export default Damages;
