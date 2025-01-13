import React, { useContext, useEffect, useState } from 'react';
import { CLIENT_ROLE_ADMIN, MOVOLAB_ROLE_ADMIN, http } from '../../../utils/Utils';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { SelectField } from '../../Form/SelectField';
import { TextField } from '../../Form/TextField';
import { UserContext } from '../../../store/UserContext';
import Button from '../../UI/buttons/Button';

const UpdatePriceListAdministration = () => {
  const [priceList, setPriceList] = useState({ deposits: [] }); // eslint-disable-line
  const { data: currentClient } = useContext(UserContext);
  const form = useForm();
  const params = useParams();
  useEffect(() => {
    fetchPriceList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    form.setValue('revenueShare.percentage', priceList?.revenueShare?.percentage);
    form.setValue('revenueShare.priority', priceList?.revenueShare?.priority);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceList]);

  const fetchPriceList = async () => {
    try {
      const response = await http({ url: `/pricing/priceLists/${params.id}?mode=flat` });
      setPriceList(response);

      form.setValue('fares.invoicingType', response.configuration?.fares.invoicingType);
      form.setValue('fares.vatPercentage', response.configuration?.fares.vatPercentage);
      form.setValue('deposits.invoicingType', response.configuration?.deposits.invoicingType);
      form.setValue('deposits.vatPercentage', response.configuration?.deposits.vatPercentage);
      form.setValue('kmExtra.invoicingType', response.configuration?.kmExtra?.invoicingType);
      form.setValue('kmExtra.vatPercentage', response.configuration?.kmExtra?.vatPercentage);
      form.setValue('damages.invoicingType', response.configuration?.damages?.invoicingType);
      form.setValue('damages.vatPercentage', response.configuration?.damages?.vatPercentage);
      form.setValue('fuelExtra.invoicingType', response.configuration?.fuelExtra?.invoicingType);
      form.setValue('fuelExtra.vatPercentage', response.configuration?.fuelExtra?.vatPercentage);
      form.setValue(
        'maintenanceFranchise.invoicingType',
        response.configuration?.maintenanceFranchise?.invoicingType,
      );
      form.setValue(
        'maintenanceFranchise.vatPercentage',
        response.configuration?.maintenanceFranchise?.vatPercentage,
      );
      form.setValue(
        'rcaFranchise.invoicingType',
        response.configuration?.rcaFranchise?.invoicingType,
      );
      form.setValue(
        'rcaFranchise.vatPercentage',
        response.configuration?.rcaFranchise?.vatPercentage,
      );
      form.setValue(
        'ifFranchise.invoicingType',
        response.configuration?.ifFranchise?.invoicingType,
      );
      form.setValue(
        'ifFranchise.vatPercentage',
        response.configuration?.ifFranchise?.vatPercentage,
      );
      form.setValue(
        'paiFranchise.invoicingType',
        response.configuration?.paiFranchise?.invoicingType,
      );
      form.setValue(
        'paiFranchise.vatPercentage',
        response.configuration?.paiFranchise?.vatPercentage,
      );
      form.setValue(
        'kaskoFranchise.invoicingType',
        response.configuration?.kaskoFranchise?.invoicingType,
      );
      form.setValue(
        'kaskoFranchise.vatPercentage',
        response.configuration?.kaskoFranchise?.vatPercentage,
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const vatOptions = [
    { value: 0, label: '0%' },
    { value: 4, label: '4%' },
    { value: 10, label: '10%' },
    { value: 22, label: '22%' },
  ];

  if (!currentClient) return null;
  if (!currentClient.client && currentClient.role !== MOVOLAB_ROLE_ADMIN) return null;

  let options = [];

  if (
    currentClient.client?.license?.licenseOwner === 'client' &&
    currentClient.role === CLIENT_ROLE_ADMIN
  ) {
    options = [
      { value: '', label: '-- Seleziona --' },
      { value: 'customer', label: 'Cliente' },
    ];
  } else if (currentClient.role === MOVOLAB_ROLE_ADMIN) {
    options = [
      { value: '', label: '-- Seleziona --' },
      { value: 'movolab', label: 'Movolab' },
      { value: 'customer', label: 'Cliente' },
    ];
  }

  const onSubmit = async (data) => {
    try {
      const configurationKeys = [
        'fares',
        'deposits',
        'kmExtra',
        'fuelExtra',
        'damages',
        'maintenanceFranchise',
        'rcaFranchise',
        'ifFranchise',
        'paiFranchise',
        'kaskoFranchise',
      ];

      const configuration = configurationKeys.reduce((acc, key) => {
        acc[key] = {
          invoicingType: data[key]?.invoicingType,
          vatPercentage: data[key]?.vatPercentage,
        };
        return acc;
      }, {});

      const dataToSend = {
        configuration,
        revenueShare: {
          percentage: data.revenueShare.percentage,
          priority: data.revenueShare.priority,
        },
      };

      await http({
        method: 'PUT',
        url: `/pricing/priceLists/${params.id}`,
        form: dataToSend,
      });

      toast.success('Listino aggiornato');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} id="priceListForm">
      <fieldset disabled={form.formState.isSubmitting} className="flex flex-col gap-y-2">
        {priceList?.licenseType === 'movolab' && (
          <div className="hidden md:flex gap-2 font-semibold px-4">
            <div className="w-60"></div>
            <div className="w-40 px-3">Priorità</div>
            <div className="w-40 px-3">Percentuale</div>
          </div>
        )}
        {priceList?.licenseType === 'movolab' && (
          <div className="inline-flex flex-wrap items-center gap-2">
            <div className="w-full md:w-auto md:flex bg-yellow-300 rounded-md p-2">
              <div className="w-full md:w-60 text-md font-semibold capitalize pl-3 mt-2">
                Percentuale Corrispettivi
              </div>
              <div className="xs:w-full md:w-40 pl-3 mt-2">
                <SelectField
                  className="m-0 w-full"
                  name={`revenueShare.priority`}
                  form={form}
                  options={[
                    { value: 'priceList', label: 'Listino' },
                    { value: 'fares', label: 'Tariffe' },
                  ]}
                />
              </div>
              <div className="xs:w-full md:w-40 pl-3 mt-2">
                <TextField
                  className="m-0 w-full"
                  name={`revenueShare.percentage`}
                  form={form}
                  min={0}
                  max={100}
                  type="number"
                />
              </div>
            </div>
          </div>
        )}

        <div className="hidden md:flex gap-2 font-semibold px-4">
          <div className="w-60"></div>
          <div className="w-40 px-3">Fatturazione</div>
          <div className="w-40 px-3">IVA</div>
        </div>
        {[
          { key: 'fares', label: 'tariffe' },
          { key: 'deposits', label: 'depositi' },
          { key: 'kmExtra', label: 'km Extra' },
          { key: 'fuelExtra', label: 'carburante Extra' },
          { key: 'damages', label: 'danni' },
          { key: 'maintenanceFranchise', label: 'franchigia Manutenzione' },
          { key: 'rcaFranchise', label: 'franchigia RCA' },
          { key: 'ifFranchise', label: 'franchigia IF' },
          { key: 'paiFranchise', label: 'franchigia PAI' },
          { key: 'kaskoFranchise', label: 'franchigia Kasko' },
        ].map(({ key, label }) => (
          <div key={key} className="inline-flex flex-wrap items-center gap-2">
            <div className="w-full md:w-auto md:flex bg-slate-100 rounded-md p-2">
              <div className="w-full md:w-60 text-md font-semibold capitalize pl-3 mt-2">
                {label}
              </div>
              <div className="xs:w-full md:w-40 pl-3 mt-2">
                <SelectField
                  className="m-0 w-full"
                  name={`${key}.invoicingType`}
                  form={form}
                  options={options}
                />
              </div>
              <div className="xs:w-full md:w-40 pl-3 mt-2">
                <SelectField
                  className="m-0 w-full"
                  name={`${key}.vatPercentage`}
                  form={form}
                  options={vatOptions}
                />
              </div>
            </div>
          </div>
        ))}

        {currentClient.role === MOVOLAB_ROLE_ADMIN && (
          <div>
            <Button>Salva</Button>
          </div>
        )}
      </fieldset>
    </form>
  );
};

export default UpdatePriceListAdministration;
