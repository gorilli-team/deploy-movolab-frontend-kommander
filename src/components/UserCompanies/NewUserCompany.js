import React, { useState } from 'react';
import NewCompanyData from './NewCompany/NewCompanyData';
import NewCompanyAddress from './NewCompany/NewCompanyAddress';

const NewUserCompany = ({ updateMode, returnImportedData, returnUserCompany, userCompanyId, closeModal, mode = 'add' }) => {
  const [section, setSection] = useState('data'); // ['data', 'address']
  const [newUserCompanyId, setuserCompanyId] = useState(userCompanyId);

  const updateSection = (section) => {
    setSection(section);
  };

  const updateUserCompanyId = (userCompanyId) => {
    if (userCompanyId === undefined || userCompanyId === null) return;
    setuserCompanyId(userCompanyId);
  };

  return (
    <>
      {section === 'data' && (
        <NewCompanyData
          updateSection={updateSection}
          userCompanyId={newUserCompanyId}
          updateUserCompanyId={updateUserCompanyId}
          returnImportedData={returnImportedData}
          updateMode={updateMode}
          mode={mode}
          backToListFn={() => {
            closeModal();
          }}
        />
      )}
      {section === 'address' && (
        <NewCompanyAddress
          updateSection={updateSection}
          userCompanyId={newUserCompanyId}
          returnUserCompany={returnUserCompany}
          closeModal={closeModal}
          mode={mode}
        />
      )}
    </>
  );
};

export default NewUserCompany;
