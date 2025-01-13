import React from 'react';
import { http } from '../../../utils/Utils';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import FormLabel from '../../UI/FormLabel';
import { TextField } from '../../Form/TextField';
import { SelectField } from '../../Form/SelectField';
import toast from 'react-hot-toast';
import moment from 'moment';

const DrivingLicense = ({ user, onSubmitUpdate }) => {
  const form = useForm();
  const params = useParams();

  const onSubmit = async (data) => {
    try {
      await http({
        method: 'PUT',
        url: `/users/${params.id}`,
        form: data,
      });
      toast.success('Utente aggiornato');
      user.drivingLicense = data.drivingLicense;
      onSubmitUpdate();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  if (!user) {
  } else {
    form.setValue('drivingLicense.number', user?.drivingLicense?.number);
    form.setValue('drivingLicense.category', user?.drivingLicense?.category);
    form.setValue('drivingLicense.releasedBy', user?.drivingLicense?.releasedBy);
    user?.drivingLicense?.releaseDate &&
      form.setValue(
        'drivingLicense.releaseDate',
        new Date(user?.drivingLicense?.releaseDate).toISOString().split('T')[0],
      );
    user?.drivingLicense?.expirationDate &&
      form.setValue(
        'drivingLicense.expirationDate',
        new Date(user?.drivingLicense?.expirationDate).toISOString().split('T')[0],
      );
  }

  return (
    <div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-wrap justify-between items-end"
        id="saveUserForm"
      >
        <div className="col-span-2">
          <div className="flex">
            <div className="w-64">
              <FormLabel>Numero:</FormLabel>
              {/*number*/}
              <TextField
                className="w-full"
                form={form}
                name="drivingLicense.number"
                type="string"
                placeholder="Numero"
                autofocus
              />
            </div>
            <div className="w-30 ml-2">
              <FormLabel>Categoria:</FormLabel>
              <SelectField
                className="w-full"
                form={form}
                name="drivingLicense.category"
                type="string"
                placeholder="Categoria"
                options={[
                  { value: 'B', label: 'B' },
                  { value: 'C', label: 'C' },
                  { value: 'D', label: 'D' },
                  { value: 'E', label: 'E' },
                ]}
              />
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-80">
              <FormLabel>Rilasciata da:</FormLabel>
              {/*releasedby*/}
              <TextField
                className="w-full"
                form={form}
                name="drivingLicense.releasedBy"
                type="string"
                placeholder="Rilasciata da"
              />
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-48">
              <FormLabel>Data rilascio:</FormLabel>
              <TextField
                className="w-full"
                form={form}
                name="drivingLicense.releaseDate"
                type="date"
                max={new moment().subtract(1, 'days').format('YYYY-MM-DD')}
              />
            </div>
            <div className="w-48 ml-2">
              <FormLabel>Data scadenza:</FormLabel>
              {/*expirationdate*/}
              <TextField
                className="w-full"
                form={form}
                name="drivingLicense.expirationDate"
                type="date"
                min={
                  form.getValues('drivingLicense.releaseDate') ||
                  new Date(new Date()).toISOString().split('T')[0]
                }
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DrivingLicense;
