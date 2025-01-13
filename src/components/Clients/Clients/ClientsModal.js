import React, { useEffect, useState } from 'react';
import NewClient from '../../Clients/Clients/NewClient';
import Modal from '../../UI/Modal';

import ImportUserCompany from '../../UserCompanies/ImportUserCompany';

const ClientsModal = ({
  mode,
  clientId,
  importedData,
  closeModal,
  returnCompany,
  returnUserCompany,
}) => {
  useEffect(() => {}, []);

  const [modeShown, setModeShown] = useState(mode);
  const [importedDataShown, setImportedDataShown] = useState(importedData);

  const updateMode = (mode) => {
    setModeShown(mode);
  };

  const returnCompanyFunction = (data) => {
    returnCompany(data);
    closeModal();
  };

  const returnImportedData = (data) => {
    setImportedDataShown(data);
  };

  return (
    <Modal
      isVisible={true}
      onClose={closeModal}
      innerClassName="px-6 py-4 relative"
      headerChildren={mode === 'import' ? 'Importa cliente' : 'Inserisci cliente'}
    >
      {modeShown === 'add' && (
        <NewClient
          updateMode={updateMode}
          returnUserCompany={returnUserCompany}
          returnImportedData={returnImportedData}
          closeModal={closeModal}
        />
      )}
      {modeShown === 'import' && (
        <ImportUserCompany
          clientId={clientId}
          importedData={importedDataShown.data}
          returnCompany={returnCompanyFunction}
          returnUserCompany={returnUserCompany}
          closeModal={closeModal}
        />
      )}
    </Modal>
  );
};

export default ClientsModal;
