import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserContext } from '../../../store/UserContext';
import toast from 'react-hot-toast';
import { CLIENT_ROLE_ADMIN, http } from '../../../utils/Utils';
import { useHistory, useParams } from 'react-router-dom';
import useGroups from '../../../hooks/useGroups';

import SettingsPage from '../../../components/Settings/SettingsPage';
import ExtraDetailsData from '../../../components/Clients/Prices/ExtraDetailsData';
import CardsHeader from '../../../components/UI/CardsHeader';
import WhiteBox from '../../../components/UI/WhiteBox';

const Extra = () => {
  const form = useForm();
  const history = useHistory();
  const params = useParams();
  const groups = useGroups();
  const mode = params.id ? 'edit' : 'create';

  const [isAdmin, setIsAdmin] = useState(false); // eslint-disable-line
  const [canModifyExtra, setCanModifyExtra] = useState(true);
  const { data: currentClient } = useContext(UserContext);
  useEffect(() => {
    setIsAdmin(currentClient?.role === CLIENT_ROLE_ADMIN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClient]);

  useEffect(() => {
    fetchExtra();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, groups]);

  const fetchExtra = async () => {
    try {
      form.setValue('configuration.invoicingType', 'customer');
      form.setValue('invoicingTypeCustomer', 'Cliente');

      if (mode === 'edit') {
        if (groups && groups.length > 0) {
          const response = await http({ url: `/pricing/extras/${params.id}` });

          setCanModifyExtra(
            response.licenseType !== 'movolab' && currentClient?.role === CLIENT_ROLE_ADMIN,
          );

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
          form.setValue(
            'configuration.invoicingType',
            currentClient?.client?.license?.licenseOwner === 'client'
              ? 'customer'
              : response.configuration?.invoicingType,
          );
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          licenseType: 'client',
          client: currentClient.client._id,
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
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN]} hasBox={false}>
      <CardsHeader
        title={mode === 'edit' ? 'Dettagli extra' : 'Nuovo extra'}
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => {
              history.goBack();
            },
          },
          {
            children: mode === 'edit' ? 'Aggiorna extra' : 'Crea extra',
            form: 'extraForm',
          },
        ]}
      />

      <WhiteBox className="mt-0 p-4">
        <form onSubmit={form.handleSubmit(onSubmit)} id="extraForm">
          <fieldset disabled={form.formState.isSubmitting}>
            <ExtraDetailsData form={form} groups={groups} isDisabled={!canModifyExtra} />
          </fieldset>
        </form>
      </WhiteBox>
    </SettingsPage>
  );
};

export default Extra;
