import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import { useHistory, useParams } from 'react-router-dom';
import Page from '../../../components/Dashboard/Page';
import WhiteButton from '../../../components/UI/buttons/WhiteButton';
import ShowUser from '../../../components/Users/ShowUser';

const User = () => {
  const form = useForm();
  const history = useHistory();
  const params = useParams();
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const response = await http({ url: `/users/${params.id}` });
      setUser(response);

      form.setValue('name', response.name);
      form.setValue('surname', response.surname);
      form.setValue('residency.nation', response.residency.nation);
      form.setValue('residency.address', response.residency.address);
      form.setValue('residency.houseNumber', response.residency.houseNumber);
      form.setValue('residency.city', response.residency.city);
      form.setValue('residency.province', response.residency.province);
      form.setValue('residency.zipCode', response.residency.zipCode);
      form.setValue('residency.telephone', response.residency.telephone);
      form.setValue('email', response.email);
      form.setValue('phone', response.phone);
      form.setValue('fiscalCode', response.fiscalCode);
      form.setValue('gender', response.gender);
      form.setValue('birthDate', response.birthDate);
      form.setValue('cityOfBirth', response.cityOfBirth);
      form.setValue('vatNumber', response.vatNumber);
      form.setValue('destinationCode', response.destinationCode);
      form.setValue('pec', response.pec);
      form.setValue('password', response.password);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <div className="p-4">
        <div className="mb-4">
          <WhiteButton onClick={() => history.goBack()}>Indietro</WhiteButton>
        </div>
        <ShowUser user={user} />
      </div>
    </Page>
  );
};

export default User;
