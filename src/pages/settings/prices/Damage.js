import React, { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';
import { UserContext } from '../../../store/UserContext';
import useGroups from '../../../hooks/useGroups';
import SettingsPage from '../../../components/Settings/SettingsPage';
import { TextField } from '../../../components/Form/TextField';
import { SelectField } from '../../../components/Form/SelectField';
import { vehicleParts } from '../../../utils/Damages';
import FormLabel from '../../../components/UI/FormLabel';
import { CLIENT_ROLE_ADMIN, http } from '../../../utils/Utils';
import WhiteBox from '../../../components/UI/WhiteBox';
import CardsHeader from '../../../components/UI/CardsHeader';

const Damage = () => {
  const form = useForm();
  const history = useHistory();
  const params = useParams();
  const groups = useGroups();
  const mode = params.id ? 'edit' : 'create';

  const { data: currentClient } = useContext(UserContext);
  const license = currentClient?.client?.license?.licenseOwner;

  const damageTypes = [
    { label: 'Graffio', value: 'scratch' },
    { label: 'Ammaccatura', value: 'dent' },
    { label: 'Crepa', value: 'crack' },
    { label: 'Rottura', value: 'break' },
    { label: 'Foro', value: 'hole' },
    { label: 'Lacerazione', value: 'tear' },
    { label: 'Altro', value: 'other' },
  ];

  const fetchDamage = async () => {
    try {
      if (mode === 'edit') {
        const response = await http({ url: `/pricing/damages/${params.id}` });
        form.setValue('group', response.group);
        form.setValue('vehiclePart', response.vehiclePart);
        form.setValue('damageType', response.damageType);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchDamage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data) => {
    try {
      data.workflowType = license;
      data.client = currentClient.client._id;

      if (mode === 'create') {
        await http({
          method: 'POST',
          url: '/pricing/damages',
          form: data,
        });

        toast.success('Prezzo danni creato');
        history.goBack();
      } else if (mode === 'edit') {
        await http({
          method: 'PUT',
          url: `/pricing/damages/${params.id}`,
          form: data,
        });

        toast.success('Prezzo danni aggiornato');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN]} hasBox={false}>
      <CardsHeader
        title={mode === 'edit' ? 'Dettagli danno' : 'Nuova danno'}
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => {
              history.goBack();
            },
          },
          // {
          //   btnStyle: 'lightSlateTransparent',
          //   children: mode === 'Rimuovi danno',
          //   onClick: (e) => removeDamagesForm(e),
          //   form: 'damagesForm',
          //   hiddenIf: license === 'movolab' || mode !== 'edit',
          // },
          {
            children: mode === 'edit' ? 'Aggiorna costi danno' : 'Crea costi danno',
            form: 'damagesForm',
            // hiddenIf: !(license !== 'movolab'),
          },
        ]}
      />

      <WhiteBox className="mt-0 p-4">
        <form onSubmit={form.handleSubmit(onSubmit)} id="damagesForm">
          <fieldset disabled={form.formState.isSubmitting}>
            <div className="max-w-sm">
              <FormLabel>Gruppo</FormLabel>
              <SelectField
                form={form}
                name="group"
                placeholder="Gruppo"
                options={groups}
                validation={{
                  required: { value: true, message: 'Gruppo Obbligatorio' },
                }}
              />
              <FormLabel>Parte del Veicolo</FormLabel>
              <SelectField
                form={form}
                name="vehiclePart"
                options={vehicleParts}
                type="string"
                placeholder="Parte del Veicolo"
                validation={{
                  required: { value: true, message: 'Parte del Veicolo Obbligatoria' },
                }}
              />

              {damageTypes.map((damageType) => (
                <>
                  <FormLabel>{damageType.label}</FormLabel>
                  <div className="flex space-x-2 w-[600px]">
                    <div className="text-md mt-2">Lieve</div>
                    <div className="w-32">
                      <TextField
                        form={form}
                        name={`damageType.${damageType.value}.low`}
                        placeholder="Basso"
                        type="number"
                      />
                    </div>
                    <div className="text-md mt-2">Medio</div>

                    <div className="w-32">
                      <TextField
                        form={form}
                        name={`damageType.${damageType.value}.medium`}
                        placeholder="Medio"
                        type="number"
                      />
                    </div>
                    <div className="text-md mt-2">Grave</div>

                    <div className="w-32">
                      <TextField
                        form={form}
                        name={`damageType.${damageType.value}.high`}
                        placeholder="Alto"
                        type="number"
                      />
                    </div>
                  </div>
                </>
              ))}
            </div>
          </fieldset>
        </form>
      </WhiteBox>
    </SettingsPage>
  );
};

export default Damage;
