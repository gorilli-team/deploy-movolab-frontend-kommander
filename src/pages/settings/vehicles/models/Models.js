import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SettingsPage from '../../../../components/Settings/SettingsPage';
import { CLIENT_ROLE_ADMIN, http } from '../../../../utils/Utils';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../../../store/UserContext';
import ModelsTable from '../../../../components/Vehicles/Models/ModelsTable';
import TableHeader from '../../../../components/UI/TableHeader';
import PlusOutlineCircle from '../../../../assets/icons/PlusOutlineCircle';

const Models = () => {
  const history = useHistory();

  const [modelsCount, setModelsCount] = useState(0);

  const userContext = useContext(UserContext);
  let userData = userContext.data || {};
  const clientId = userData?.client?._id;

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchModels = async () => {
    try {
      const response = await http({ url: '/vehicles/model' });
      setModelsCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <SettingsPage canAccess={CLIENT_ROLE_ADMIN}>
      <TableHeader
        tableName={'Modelli'}
        buttons={[
          {
            function: () => {
              history.push('/settings/veicoli/modelli/crea');
            },
            label: 'Aggiungi modello',
            svgIco: <PlusOutlineCircle />,
          },
        ]}
        length={modelsCount}
      />

      <ModelsTable role={CLIENT_ROLE_ADMIN} clientId={clientId} />
    </SettingsPage>
  );
};

export default Models;
