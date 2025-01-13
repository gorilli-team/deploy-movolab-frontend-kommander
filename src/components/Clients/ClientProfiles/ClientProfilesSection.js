import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PlusOutlineCircle from '../../../assets/icons/PlusOutlineCircle';
import TableHeader from '../../UI/TableHeader';
import ClientProfilesTable from '../../Clients/ClientProfiles/ClientProfilesTable';
import ClientProfileCreation from './ClientProfileCreation';

//eslint-disable-next-line
const ClientProfilesSection = ({ clientId }) => {
  const params = useParams();
  const [clientProfilesCount, setClientProfilesCount] = useState(0);
  const [showAddClientProfile, setShowAddClientProfile] = useState(false);

  const setCount = (count) => {
    setClientProfilesCount(count);
  };
  return (
    <div className="">
      <TableHeader
        tableName={'Profili utente'}
        buttons={[
          {
            function: () => {
              setShowAddClientProfile(!showAddClientProfile);
            },
            label: showAddClientProfile ? 'Torna alla lista' : 'Aggiungi profilo',
            svgIco: showAddClientProfile ? undefined : <PlusOutlineCircle />,
          },
        ]}
        length={clientProfilesCount}
      />
      {showAddClientProfile ? (
        <ClientProfileCreation
          clientId={clientId}
          setCount={setCount}
          showAddClientProfile={showAddClientProfile}
          setShowAddClientProfile={setShowAddClientProfile}
        />
      ) : (
        <ClientProfilesTable clientId={params.id} setCount={setCount} />
      )}
    </div>
  );
};

export default ClientProfilesSection;
