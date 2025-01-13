import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';
import AdminPage from '../../../../components/Admin/AdminPage';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../../utils/Utils';
import GrayButton from '../../../../components/UI/buttons/GrayButton';
import useGroups from '../../../../hooks/useGroups';

import WhiteButton from '../../../../components/UI/buttons/WhiteButton';
import ExtraDetailsData from '../../../../components/Clients/Prices/ExtraDetailsData';

const AdminExtra = () => {
  const form = useForm();
  const history = useHistory();
  const params = useParams();
  const groups = useGroups();

  const mode = params.id ? 'edit' : 'create';

  useEffect(() => {
    fetchExtra();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, groups]);

  const fetchExtra = async () => {
    try {
      if (mode === 'edit') {
        if (groups && groups.length > 0) {
          const response = await http({ url: `/pricing/extras/${params.id}` });

          form.setValue('name', response.name);
          form.setValue('description', response.description);
          form.setValue('type', response.type);
          form.setValue('applicability', response.applicability);
          form.setValue('cost.amount', response.cost.amount);
          form.setValue('cost.calculation', response.cost.calculation);
          form.setValue('automaticRule.parameter', response.automaticRule?.parameter);
          form.setValue('automaticRule.check', response.automaticRule?.check);
          form.setValue('automaticRule.value1', response.automaticRule?.value1);
          form.setValue('automaticRule.value2', response.automaticRule?.value2);
          form.setValue('automaticRule.fuelCategory', response.automaticRule?.fuelCategory);
          form.setValue('manualRule.parameter', response.manualRule?.parameter);
          form.setValue('manualRule.reduction', response.manualRule?.reduction);
          form.setValue('configuration.invoicingType', response.configuration?.invoicingType);
          form.setValue('configuration.vatPercentage', response.configuration?.vatPercentage);
          form.setValue('insertionPhase', response.insertionPhase);

          const groupsToDisplay = response.groups.map((group) => {
            const groupData = groups.find((g) => g.value === group);
            return {
              value: groupData?.value,
              label: `${groupData?.label}`,
            };
          });
          form.setValue('groups', groupsToDisplay);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (data.cost.amount && typeof data.cost.amount === 'string') {
        data.cost.amount = Number(data.cost.amount?.replace(',', '.'));

        if (isNaN(data.cost.amount)) {
          toast.error('Inserisci un costo unitario valido', {
            duration: 5000,
            icon: '❌',
          });
          return;
        }
      }
      data.groups = data.groups.map((group) => group?.value);
      if (mode === 'create') {
        data = {
          ...data,
          licenseType: 'movolab',
        };

        await http({
          method: 'POST',
          url: '/pricing/extras',
          form: data,
        });

        toast.success('Extra creato');
        history.goBack();
      } else if (mode === 'edit') {
        await http({
          method: 'PUT',
          url: `/pricing/extras/${params.id}`,
          form: data,
        });
        toast.success('Extra aggiornato');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <div className="p-4">
        <div className="w-32 mb-4">
          <WhiteButton onClick={() => history.goBack()}>Indietro</WhiteButton>
        </div>

        <div className="mb-4">
          <div className="text-xl font-bold">
            {!params.id || params.id === 'crea' ? 'Creazione Extra' : 'Aggiornamento Extra'}
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={form.formState.isSubmitting}>
              <ExtraDetailsData form={form} groups={groups} />
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-wrap -mx-3 mt-6 ">
                  <div className="w-full px-3">
                    {mode === 'edit' ? (
                      <div className="flex space-x-2">
                        <GrayButton>Aggiorna Extra</GrayButton>
                      </div>
                    ) : (
                      <GrayButton>Crea Extra</GrayButton>
                    )}
                  </div>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </AdminPage>
  );
};

export default AdminExtra;
