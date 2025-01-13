import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminPage from '../../../../components/Admin/AdminPage';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../../utils/Utils';
import { useHistory } from 'react-router-dom';

import ModelsTable from '../../../../components/Vehicles/Models/ModelsTable';
import TableHeader from '../../../../components/UI/TableHeader';
import PlusOutlineCircle from '../../../../assets/icons/PlusOutlineCircle';

const Models = () => {
  const history = useHistory();

  const [modelsCount, setModelsCount] = useState(0);

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
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <TableHeader
        tableName={'Modelli'}
        buttons={[
          {
            function: () => {
              history.push('/admin/veicoli/modelli/crea');
            },
            label: 'Aggiungi modello',
            svgIco: <PlusOutlineCircle />,
          },
        ]}
        length={modelsCount}
      />

      <ModelsTable role={MOVOLAB_ROLE_ADMIN} />
    </AdminPage>
  );
};

export default Models;
