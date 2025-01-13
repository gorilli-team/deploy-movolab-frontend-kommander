import React from 'react';
import { http } from '../../../utils/Utils';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import FormLabel from '../../UI/FormLabel';
import { TextField } from '../../Form/TextField';
import { SelectField } from '../../Form/SelectField';
import FiscalCode from './FiscalCode';
import BirthPlaceSection from './BirthPlaceSection';

import { olderThan18 } from '../../../utils/Age';
import professionsJson from '../../../assets/professions';

const PersonalDetails = ({ user, onSubmitUpdate }) => {
  const params = useParams();
  const form = useForm();

  const protectFields = (data) => {
    user.placeOfBirth = data.placeOfBirth;
    user.placeOfBirthProvince = data.placeOfBirthProvince;
    user.placeOfBirthNation = data.placeOfBirthNation;
    user.name = data.name;
    user.surname = data.surname;
    user.userType = data.userType;
    user.gender = data.gender;
    user.profession = data.profession;
    user.nationality = data.nationality;
  };

  if (!user) {
  } else {
    form.setValue('name', user?.name);
    form.setValue('surname', user?.surname);
    form.setValue('gender', user?.gender);
    form.setValue('profession', user?.profession);
    form.setValue(
      'birthDate',
      user?.birthDate ? new Date(user?.birthDate).toISOString().split('T')[0] : '',
    );
    form.setValue('fiscalCode', user?.fiscalCode);
    form.setValue('placeOfBirthNation', user?.placeOfBirthNation);
    form.setValue('nationality', user?.nationality);
    form.setValue('placeOfBirthProvince', user?.placeOfBirthProvince);
    form.setValue('placeOfBirth', user?.placeOfBirth);
    form.setValue('phone', user?.phone);
    form.setValue('email', user?.email);
    form.setValue('userType', user?.userType);
  }

  const onSubmit = async (data) => {
    try {
      if (!olderThan18(data.birthDate)) {
        toast.error('Utente deve essere maggiorenne');
        return;
      }

      await http({
        method: 'PUT',
        url: `/users/${params.id}`,
        form: data,
      });
      protectFields(data);
      onSubmitUpdate();
      toast.success('Utente aggiornato');
    } catch (err) {
      console.error(err);
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-wrap justify-between items-end"
        id="saveUserForm"
      >
        <div className="col-span-3">
          <FiscalCode user={user} form={form} />
          <div className="flex">
            <div className="mr-3 top-0 w-64">
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
            <div className="mr-3 top-0 w-64">
              <FormLabel>Cognome</FormLabel>
              <TextField
                form={form}
                name="surname"
                type="string"
                placeholder="Cognome"
                validation={{
                  required: { value: true, message: 'Cognome Obbiligatorio' },
                }}
              />
            </div>
            <div className="mr-3 w-64">
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
                  required: { value: true, message: 'Genere Obbiligatorio' },
                }}
              />
            </div>
          </div>
          <div className="flex">
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
          <div className="flex">
            <div className="mr-3 w-64">
              <div>
                <FormLabel>Email</FormLabel>
                <TextField
                  form={form}
                  name="email"
                  type="email"
                  placeholder="Email"
                  validation={{
                    required: { value: true, message: 'Email mancante' },
                  }}
                />
              </div>
            </div>
            <div className="mr-3 w-64">
              <div>
                <FormLabel>Cellulare</FormLabel>
                <TextField form={form} name="phone" type="string" placeholder="Cellulare" />
              </div>
            </div>
            <div className="mr-3 w-64">
              <FormLabel>Data nascita</FormLabel>
              <TextField
                form={form}
                name="birthDate"
                type="date"
                placeholder="Data nascita"
                validation={{
                  required: { value: true, message: 'Data nascita mancante' },
                }}
              />
            </div>
          </div>
          <BirthPlaceSection user={user} form={form} />
        </div>
      </form>
    </div>
  );
};

export default PersonalDetails;
