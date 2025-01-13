import React, { useState } from 'react';
import NewClientData from './NewClient/NewClientData';

const NewClient = ({ updateMode, returnImportedData, returnUserCompany, closeModal }) => {
  const [userCompanyId, setuserCompanyId] = useState(null);

  const updateUserCompanyId = (userCompanyId) => {
    if (userCompanyId === undefined || userCompanyId === null) return;
    setuserCompanyId(userCompanyId);
  };

  return (
    <>
      <NewClientData
        userCompanyId={userCompanyId}
        updateUserCompanyId={updateUserCompanyId}
        returnImportedData={returnImportedData}
        updateMode={updateMode}
      />
    </>
  );
};

export default NewClient;
