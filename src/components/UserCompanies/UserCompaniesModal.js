import React, { useEffect, useState } from 'react';
import NewUserCompany from './NewUserCompany';
import Modal from '../UI/Modal';

import ImportUserCompany from './ImportUserCompany';

const UserCompaniesModal = ({
  mode,
  userCompanyId,
  importedData,
  closeModal,
  returnCompany,
  returnUserCompany,
}) => {
  useEffect(() => { }, []);

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
      bgClassName="items-start" 
      className="md:mt-28"
      headerChildren={modeShown === 'import' ? 'Importa azienda' : modeShown === 'edit' ? 'Modifica azienda' : 'Inserisci azienda'}>
      {(modeShown === 'add' || modeShown === 'edit') && (
        <NewUserCompany
          mode={modeShown}
          updateMode={updateMode}
          returnUserCompany={returnUserCompany}
          returnImportedData={returnImportedData}
          closeModal={closeModal}
          userCompanyId={userCompanyId}
        />
      )}
      {modeShown === 'import' && (
        <ImportUserCompany
          userCompanyId={userCompanyId}
          importedData={importedDataShown.data}
          returnCompany={returnCompanyFunction}
          returnUserCompany={returnUserCompany}
          closeModal={closeModal}
        />
      )}
    </Modal>
  );
};

export default UserCompaniesModal;
