import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { http } from '../../../utils/Utils';
import { UserContext } from '../../../store/UserContext';
import FiscalCode from '../User/FiscalCode';
import BirthPlaceSection from '../User/BirthPlaceSection';
import professionsJson from '../../../assets/professions';

import { TextField } from '../../../components/Form/TextField';
import { SelectField } from '../../../components/Form/SelectField';
import Button from '../../UI/buttons/Button';
import { getProvinceFullName } from '../../../utils/Addresses';
import { olderThan18 } from '../../../utils/Age';

import FormLabel from '../../UI/FormLabel';
import moment from 'moment';

const NewPersonalDetails = ({
  type,
  updateSection,
  updateUserId,
  returnUser,
  importUser,
  updateMode,
  userId,
  mode,
  returnImage,
  backToListFn
}) => {
  const form = useForm();

  const pathname = window.location.pathname.split('/')[1];

  const [user, setUser] = useState(null);
  const [userIdValue, setUserIdValue] = useState(userId);
  // eslint-disable-next-line no-unused-vars
  const [isBornInItaly, setIsBornInItaly] = useState(true);
  const { data: currentClient } = useContext(UserContext);
  const userContext = useContext(UserContext);

  useEffect(() => {
    fetchUser(userIdValue, mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async (id, type) => {
    try {
      if (id === undefined || id === null) return;
      const response = await http({ url: `/users/${id}` });
      updateUserId(response?.user?._id);

      setUser(response);

      form.setValue('name', response.name);
      form.setValue('surname', response.surname);
      form.setValue('email', response.email);
      form.setValue('phone', response.phone);
      form.setValue('gender', response.gender);
      form.setValue('profession', response.profession);
      form.setValue('fiscalCode', response.fiscalCode);
      form.setValue('nationality', response.nationality);
      form.setValue('birthDate', new Date(response?.birthDate).toISOString().split('T')[0]);
      form.setValue('placeOfBirth', response.placeOfBirth);
      form.setValue('placeOfBirthProvince', response.placeOfBirthProvince);
      form.setValue(
        'placeOfBirthProvinceFullName',
        await getProvinceFullName(response?.placeOfBirthProvince),
      );
      form.setValue('placeOfBirthNation', response.placeOfBirthNation);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const checkUserFunction = async (e) => {
    try {
      e.preventDefault();
      const fiscalCode = form.getValues('fiscalCode');
      if (!fiscalCode) {
        toast.error(
          "Codice Fiscale obbligatorio per controllare se l'utente è già presente nel nostro database",
        );
        return;
      }
      const checkUser = await http({ url: `/users/byFiscalCode/${fiscalCode}` });
      if (checkUser?._id !== undefined) {
        form.clearErrors('');
        if (checkUser?.clients?.includes(currentClient.client?._id)) {
          toast('Utente già presente nel tuo database', {
            icon: '✅',
            duration: 5000,
          });
          await fetchUser(checkUser?._id, 'add');
          userId = checkUser?._id;
          setUserIdValue(checkUser?._id);
          updateUserId(checkUser?._id);
          returnImage(checkUser?.imageUrl);
          return;
        } else {
          toast('Utente presente nel nostro database. Puoi importarlo!', {
            icon: '👨',
          });

          await fetchUser(checkUser?._id, 'import');
          userId = checkUser?._id;
          setUserIdValue(checkUser?._id);
          updateUserId(checkUser?._id);
          updateMode('import');
          returnImage(checkUser?.imageUrl);
        }
      } else {
        toast('Utente non presente nel nostro database', {
          icon: '🚫',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmitUser = async (data) => {
    const inputData = {
      ...data,
      userType: type,
    };

    if (!inputData.fiscalCode) {
      toast.error('Codice Fiscale obbligatorio');
      return;
    }

    if (inputData?.birthdate && !olderThan18(inputData?.birthDate)) {
      toast.error('Utente deve essere maggiorenne');
      return;
    }

    let update = {};

    if (pathname === 'corporate') {
      update.userCompanies = [currentClient?.userCompany];
      update.insertedByCompany = currentClient?.userCompany;
    } else {
      update.clients = [currentClient?.client?._id];
      update.insertedByClient = currentClient?.client?._id;
    }

    let response;
    try {
      if (userIdValue) {
        response = await http({
          method: 'PUT',
          url: `/users/${userIdValue}`,
          form: data,
        });
        updateSection('residence');
      } else {
        response = await http({
          method: 'POST',
          url: '/users',
          form: {
            ...inputData,
            ...update,
          },
        });

        let userData = await userContext.getUserInfo();

        window.analytics.track({
          userId: userData?._id,
          event: 'Create User',
          properties: {
            userName: data.name + ' ' + data.surname,
            userEmail: data.email,
          },
        });

        toast.success('Utente aggiunto');
        updateUserId(response?.user?._id);
        updateSection('residence');
        returnImage(response?.user?.imageUrl);
      }
    } catch (err) {
      if (err?.error === 'fiscalCode') {
        toast('Utente presente nel nostro database. Puoi importarlo!', {
          icon: '🚗',
        });
        await fetchUser(err?.userId, 'import');
        userId = err?.userId;
        setUserIdValue(err?.userId);
        updateUserId(err?.userId);
        updateMode('import');
      } else {
        console.error(err);
        toast.error(err?.reason?.error || 'Errore');
      }
    }
  };

  const importUserFunction = async (e) => {
    try {
      e.preventDefault();
      importUser(user._id);
    } catch (err) {
      console.error(err);
    }
  };

  const discardImportUser = async (e) => {
    e.preventDefault();
    setUser(null);
    setUserIdValue(null);
    returnImage(null);

    form.setValue('name', '');
    form.setValue('surname', '');
    form.setValue('email', '');
    form.setValue('phone', '');
    form.setValue('fiscalCode', '');
    form.setValue('nationality', '');
    form.setValue('birthDate', '');
    form.setValue('placeOfBirth', '');
    form.setValue('placeOfBirthProvince', '');
    form.setValue('placeOfBirthNation', '');
    form.setValue('profession', '');
    updateMode('add');
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmitUser)}>
      <div>
        {mode !== 'import' ? (
          <>
            <FiscalCode user={user} form={form} checkUserFunction={checkUserFunction}></FiscalCode>
            <div className="flex flex-wrap md:flex-nowrap md:gap-3">
              <div className="w-full md:w-64">
                <FormLabel>Nome</FormLabel>
                <TextField
                  form={form}
                  name="name"
                  type="string"
                  placeholder="Nome"
                  validation={{
                    required: { value: true, message: 'Nome Obbligatorio' },
                  }}
                />
              </div>
              <div className="w-full md:w-64">
                <FormLabel>Cognome</FormLabel>
                <TextField
                  form={form}
                  name="surname"
                  type="string"
                  placeholder="Cognome"
                  validation={{
                    required: { value: true, message: 'Cognome Obbligatorio' },
                  }}
                />
              </div>
              <div className="w-full md:w-64">
                <FormLabel>Genere</FormLabel>
                <SelectField
                  form={form}
                  name="gender"
                  type="string"
                  placeholder="Genere"
                  options={[
                    { value: 'M', label: 'Maschile' },
                    { value: 'F', label: 'Femminile' },
                    { value: 'O', label: 'Altro' },
                  ]}
                  validation={{
                    required: { value: true, message: 'Genere Obbligatorio' },
                  }}
                />
              </div>
            </div>
            <div className="flex flex-wrap md:flex-nowrap md:gap-3">
              <div className="w-full md:w-64">
                <FormLabel>Professione</FormLabel>
                <SelectField
                  form={form}
                  name="profession"
                  type="string"
                  placeholder="Professione"
                  options={professionsJson}
                />
              </div>
            </div>
            <div className="flex flex-wrap md:flex-nowrap md:gap-3">
              <div className="w-full md:w-64">
                <FormLabel>Email</FormLabel>
                <TextField
                  form={form}
                  name="email"
                  type="email"
                  placeholder="Email"
                  validation={{
                    required: { value: true, message: 'Email obbligatoria' },
                  }}
                />
              </div>
              <div className="w-full md:w-64">
                <FormLabel>Cellulare</FormLabel>
                <TextField
                  form={form}
                  name="phone"
                  type="string"
                  placeholder="Cellulare"
                  validation={{
                    required: { value: true, message: 'Cellulare obbligatorio' },
                  }}
                />
              </div>
              <div className="w-full md:w-64">
                <FormLabel>Data nascita</FormLabel>
                <TextField
                  form={form}
                  name="birthDate"
                  type="date"
                  placeholder="Data nascita"
                  max={new moment().subtract(18, 'years').format('YYYY-MM-DD')}
                  validation={{
                    required: {
                      value: mode !== 'import',
                      message: 'Data di Nascita obbligatoria',
                    },
                  }}
                />
              </div>
            </div>
            <BirthPlaceSection user={user} form={form} />
            <div className="mt-2 flex justify-end">
              {backToListFn ? (
                <Button btnStyle="white" className="!py-1" onClick={(e) => { e.preventDefault(); backToListFn(); }}>
                  Torna alla lista
                </Button>)
                : null}
              <Button btnStyle="white" className="!py-1">
                Avanti
              </Button>
            </div>
          </>
        ) : (
          <div className="mt-5">
            <div>
              <p className="text-md mb-3">
                Un utente con questo Codice Fiscale <strong className="font-semibold">è già presente</strong><br />
                nel nostro database. Vuoi importarlo?{' '}
              </p>
              <>
                <div className="flex flex-wrap md:flex-nowrap md:gap-3">
                  <div className="w-full md:w-64">
                    <FormLabel>Nazionalità</FormLabel>
                    <TextField
                      form={form}
                      name="nationality"
                      type="string"
                      placeholder="Nazionalità"
                      disabled={true}
                    />
                  </div>
                  <div className="w-full md:w-64">
                    <FormLabel>Codice Fiscale</FormLabel>
                    <TextField
                      form={form}
                      name="fiscalCode"
                      type="string"
                      placeholder="Codice Fiscale"
                      disabled={true}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap md:flex-nowrap md:gap-3">
                  <div className="w-full md:w-64">
                    <FormLabel>Nome</FormLabel>
                    <TextField
                      form={form}
                      name="name"
                      type="string"
                      placeholder="Nome"
                      disabled={true}
                    />
                  </div>
                  <div className="w-full md:w-64">
                    <FormLabel>Cognome</FormLabel>
                    <TextField
                      form={form}
                      name="surname"
                      type="string"
                      placeholder="Cognome"
                      disabled={true}
                    />
                  </div>
                  <div className="w-full md:w-64">
                    <FormLabel>Genere</FormLabel>
                    <SelectField
                      form={form}
                      name="gender"
                      type="string"
                      placeholder="Genere"
                      disabled={true}
                      options={[
                        { value: 'M', label: 'Maschile' },
                        { value: 'F', label: 'Femminile' },
                        { value: 'O', label: 'Altro' },
                      ]}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap md:flex-nowrap md:gap-3">
                  <div className="mr-3 top-0 w-64">
                    <FormLabel>Professione</FormLabel>
                    <SelectField
                      form={form}
                      name="profession"
                      type="string"
                      placeholder="Professione"
                      options={professionsJson}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap md:flex-nowrap md:gap-3">
                  <div className="w-full md:w-64">
                    <FormLabel>Email</FormLabel>
                    <TextField
                      form={form}
                      name="email"
                      type="email"
                      placeholder="Email"
                      disabled={true}
                    />
                  </div>
                  <div className="w-full md:w-64">
                    <FormLabel>Cellulare</FormLabel>
                    <TextField
                      form={form}
                      name="phone"
                      type="string"
                      placeholder="Cellulare"
                      disabled={true}
                    />
                  </div>
                  <div className="w-full md:w-64">
                    <FormLabel>Data nascita</FormLabel>
                    <TextField
                      form={form}
                      name="birthDate"
                      type="date"
                      placeholder="Data nascita"
                      disabled={true}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap md:flex-nowrap md:gap-3">
                  <div className="w-full md:w-64">
                    <FormLabel>Nazione di Nascita</FormLabel>
                    <TextField
                      form={form}
                      name="placeOfBirthNation"
                      type="string"
                      placeholder="Nazione di Nascita"
                      disabled={true}
                    />
                  </div>
                  <div className="w-full md:w-64">
                    <FormLabel>Provincia di Nascita</FormLabel>
                    <TextField
                      form={form}
                      name="placeOfBirthProvinceFullName"
                      type="string"
                      placeholder="Provincia di Nascita"
                      disabled={true}
                    />
                  </div>
                  <div className="w-full md:w-64">
                    <FormLabel>Comune di Nascita</FormLabel>
                    <TextField
                      form={form}
                      name="placeOfBirth"
                      type="string"
                      placeholder={'Comune di Nascita'}
                      disabled={true}
                    />
                  </div>
                </div>
              </>

              <div className="flex space-x-2 mt-2 justify-end">
                <Button
                  btnStyle="white"
                  className="!py-1"
                  onClick={(e) => {
                    discardImportUser(e);
                  }}
                >
                  Indietro
                </Button>
                <Button btnStyle="white" className="!py-1">
                  Avanti
                </Button>
                <Button
                  btnStyle="blue"
                  className="!py-1"
                  onClick={(e) => {
                    importUserFunction(e);
                  }}
                >
                  Importa Utente
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default NewPersonalDetails;
