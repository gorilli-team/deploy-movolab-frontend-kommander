import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import CorporatePage from '../../components/Corporate/CorporatePage';
import { CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR, http } from '../../utils/Utils';
import { TextField } from '../../components/Form/TextField';
import FormLabel from '../../components/UI/FormLabel';
import Button from '../../components/UI/buttons/Button';
import { SelectField } from '../../components/Form/SelectField';
import { UserContext } from '../../store/UserContext';
import WhiteBox from '../../components/UI/WhiteBox';

const CorporateProfile = () => {
  const form = useForm();

  const [userData, setUserData] = useState({});
  const [userCompanies, setUserCompanies] = useState([]);

  const userContext = useContext(UserContext);

  useEffect(() => {
    getClientProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchUserCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getClientProfileData = async () => {
    const profile = await userContext.getUserInfo();
    setUserData(profile);
    form.setValue('email', profile.email);
    form.setValue('fullname', profile.fullname);
    form.setValue('userCompany', profile.userCompany);
  };

  const fetchUserCompanies = async () => {
    try {
      const response = await http({ url: `/userCompanies` });

      setUserCompanies(
        response.userCompanies.map((userCompany) => {
          return {
            value: userCompany._id,
            label: `${userCompany.ragioneSociale}`,
          };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onSubmit = async (data) => {
    try {
      await http({
        method: 'PUT',
        url: `/clientProfile/${userData._id}`,
        form: data,
      });
      toast.success('Profilo aggiornato');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <CorporatePage canAccess={[CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR]}>
      <WhiteBox className="p-6">
        <div className="mb-4">
          <h2 className="font-semibold text-gray-800 text-2xl">Profilo</h2>
        </div>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={form.formState.isSubmitting}>
              <div className="max-w-sm">
                <FormLabel>Email</FormLabel>
                <TextField
                  form={form}
                  name="email"
                  type="text"
                  placeholder="Email"
                  disabled={true}
                  autofocus
                />
              </div>

              <div className="max-w-sm">
                <FormLabel>Nome completo</FormLabel>
                <TextField form={form} name="fullname" type="text" placeholder="Nome completo" />
              </div>
              <div className="max-w-sm mt-4">
                <div className="text-lg font-semibold">Azienda Cliente associata</div>
                <div className="flex mt-2">
                  <div style={{ width: '400px' }}>
                    <SelectField
                      form={form}
                      name={`userCompany`}
                      options={[{ value: '', label: '-- Seleziona --' }, ...userCompanies]}
                      autofocus
                      disabled
                    />
                  </div>
                </div>
              </div>

              <Button className="mt-3" isLoading={form.formState.isSubmitting}>Aggiorna</Button>
            </fieldset>
          </form>
      </WhiteBox>
    </CorporatePage>
  );
};

export default CorporateProfile;
