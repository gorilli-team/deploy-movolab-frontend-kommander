import React, { useEffect, useState } from 'react';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../utils/Utils';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import Button from '../../../components/UI/buttons/Button';

import AdminPage from '../../../components/Admin/AdminPage';
import UpdatePackCustomFields from '../../../components/Packs/Update/UpdatePackCustomFields';
import UpdatePackGeneral from '../../../components/Packs/Update/UpdatePackGeneral';
import TableHeaderTab from '../../../components/UI/TableHeaderTab';
import TableHeader from '../../../components/UI/TableHeader';
import Documents from '../../../components/Documents/Documents';

const EditPack = () => {
  const params = useParams();
  const history = useHistory();
  const [pack, setPack] = useState({});

  const search = useLocation().search;
  const section = new URLSearchParams(search).get('section');
  // const groupToVisualize = new URLSearchParams(search).get('group');
  const fetchPack = async () => {
    const response = await http({ url: `/clientPayments/packs/${params.id}` });
    setPack(response);
  };

  useEffect(() => {
    fetchPack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const mode = params.id ? 'edit' : 'create';

  const [fieldToUpdate, setFieldToUpdate] = useState(section || 'generale');

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <TableHeader tableName="Aggiorna pack" className="justify-between">
        <Button btnStyle="white" onClick={() => history.goBack()}>
          &laquo; Indietro
        </Button>
      </TableHeader>

      <TableHeaderTab
        buttons={[
          {
            label: 'Generale',
            function: () => setFieldToUpdate('generale'),
            selected: fieldToUpdate === 'generale',
          },
          {
            label: 'Documenti',
            function: () => setFieldToUpdate('documenti'),
            selected: fieldToUpdate === 'documenti',
          },
          {
            label: 'Personalizza',
            function: () => setFieldToUpdate('customisation'),
            selected: fieldToUpdate === 'customisation',
          },
        ]}
      />

      {fieldToUpdate === 'generale' && <UpdatePackGeneral mode={mode} />}
      {fieldToUpdate === 'documenti' && (
        <Documents resource={pack} resourceType="pack" noCollapsible />
      )}
      {fieldToUpdate === 'customisation' && <UpdatePackCustomFields mode={mode} />}
    </AdminPage>
  );
};

export default EditPack;
