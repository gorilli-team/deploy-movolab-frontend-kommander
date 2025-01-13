import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { http } from '../../../utils/Utils';

import ColorPicker from '../../Form/ColorPicker';
import FormLabel from '../../UI/FormLabel';
import Button from '../../UI/buttons/Button';

const UpdatePackCustomFields = (props) => {
  const form = useForm();
  const params = useParams();
  const history = useHistory();
  const [pack, setPack] = useState({}); // eslint-disable-line no-unused-vars

  useEffect(() => {
    fetchPack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchPack = async () => {
    try {
      if (props.mode === 'edit') {
        const response = await http({ url: `/clientPayments/packs/${params.id}` });

        setPack(response);
        form.setValue('packColor', response.packColor);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const availableCustomisations = [
    {
      key: 'packColor',
      label: 'Colore pack',
      type: 'color',
    },
  ];

  const onSubmit = async (data) => {
    try {
      await http({
        method: 'PUT',
        url: `/clientPayments/packs/${params.id}`,
        form: data,
      });
      toast.success('Pack aggiornato');
      history.push(`/admin/packs/${params.id}`);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-5 min-h-96">
        <fieldset disabled={form.formState.isSubmitting} className="space-y-0">
          <div className="flex flex-wrap gap-x-4">
            {availableCustomisations.map((field, key) => (
              <div className="w-full md:w-64" key={key}>
                <FormLabel>{field.label}</FormLabel>
                <ColorPicker name={field.key} form={form} placeholder={field.label} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-wrap -mx-3 mt-6 ">
              <div className="w-full px-3">
                <div className="flex space-x-2">
                  <Button btnStyle="">Aggiorna Pack</Button>
                </div>
              </div>
            </div>
          </div>
        </fieldset>
      </form>
    </>
  );
};

export default UpdatePackCustomFields;
