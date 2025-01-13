import React, { useContext } from 'react';
import toast from 'react-hot-toast';
import Page from '../../../components/Dashboard/Page';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import { UserContext } from '../../../store/UserContext';
import NewUserCompany from '../../../components/UserCompanies/NewUserCompany';

const CreateUserCompany = () => {
  const { data: currentClient } = useContext(UserContext);

  const onSubmit = async (data) => {
    try {
      await http({
        method: 'POST',
        url: '/dashboard/client/user/create',
        form: { ...data, client: currentClient.client._id },
      });
      toast.success('Utente aggiunto');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <div className="p-4">
        <NewUserCompany onSubmit={onSubmit} />
      </div>
    </Page>
  );
};

export default CreateUserCompany;
