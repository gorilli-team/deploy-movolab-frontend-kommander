import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField } from '../../../Form/TextField';
import { http } from '../../../../utils/Utils';
import toast from 'react-hot-toast';
import { SelectField } from '../../../Form/SelectField';
import { UserContext } from '../../../../store/UserContext';
// import { useParams } from 'react-router-dom';
// import FormLabel from '../../../UI/FormLabel';

const Contract = ({ vehicle, updateStepDone, isWizard = false }) => {
  const form = useForm();
  // const params = useParams();
  const [franchises, setFranchises] = useState([]);
  const { data: currentClient } = useContext(UserContext);

  useEffect(() => {
    fetchFranchises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refillForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle]);

  if (!currentClient) return null;
  const isMovolabLicense = currentClient.client?.license?.licenseOwner === 'movolab';

  const tiresNumber = [
    { value: 0, label: '0' },
    { value: 2, label: '2' },
    { value: 4, label: '4' },
    { value: 6, label: '6' },
    { value: 8, label: '8' },
    { value: 10, label: '10' },
    { value: 12, label: '12' },
    { value: 14, label: '14' },
    { value: 16, label: '16' },
    { value: 18, label: '18' },
    { value: 20, label: '20' },
  ];

  const fetchFranchises = async (skip = 0, limit = 10) => {
    try {
      const response = await http({ url: `/vehicles/franchise?skip=${skip}&limit=${limit}` });

      setFranchises(
        response.franchises.map((franchise) => {
          return {
            value: franchise._id,
            label: `${franchise.type} -  ${franchise.value ? +franchise.value + '€' : '0€'} -  ${
              franchise.percent ? +franchise.percent + '%' : '0%'
            }`,
          };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const refillForm = () => {
    if (vehicle) {
      form.setValue('contract.code', vehicle.contract?.code);
      form.setValue('contract.supplierVehicleCode', vehicle.contract?.supplierVehicleCode);
      form.setValue('contract.monthlyFee', vehicle.contract?.monthlyFee);
      if (vehicle.contract?.startDate)
        form.setValue(
          'contract.startDate',
          new Date(vehicle.contract?.startDate).toISOString().split('T')[0],
        );
      if (vehicle.contract?.endDate)
        form.setValue(
          'contract.endDate',
          new Date(vehicle.contract?.endDate).toISOString().split('T')[0],
        );
      form.setValue('contract.durationMonths', vehicle.contract?.durationMonths);
      form.setValue('contract.contractKm', vehicle.contract?.contractKm);

      form.setValue('contract.tiresType', vehicle.contract?.tiresType);
      form.setValue('contract.tiresNumber', vehicle.contract?.tiresNumber);
      form.setValue('contract.roadsideAssistance', vehicle.contract?.roadsideAssistance);
      form.setValue(
        'contract.roadsideAssistanceDetail',
        vehicle.contract?.roadsideAssistanceDetail,
      );
      form.setValue('contract.replacementVehicle', vehicle.contract?.replacementVehicle);
      form.setValue(
        'contract.replacementVehicleDetail',
        vehicle.contract?.replacementVehicleDetail,
      );

      form.setValue('franchises.maintenanceFranchise', vehicle.franchises?.maintenanceFranchise);
      form.setValue('franchises.maintenance', vehicle.franchises?.maintenance);
      form.setValue('franchises.rcaFranchise', vehicle.franchises?.rcaFranchise);
      form.setValue('franchises.maxRca', vehicle.franchises?.maxRca);
      if (vehicle.franchises?.rcaStartDate)
        form.setValue(
          'franchises.rcaStartDate',
          new Date(vehicle.franchises?.rcaStartDate).toISOString().split('T')[0],
        );
      if (vehicle.franchises?.rcaEndDate)
        form.setValue(
          'franchises.rcaEndDate',
          new Date(vehicle.franchises?.rcaEndDate).toISOString().split('T')[0],
        );

      if (!isWizard) {
        form.setValue('franchises.rcaInsurance', vehicle.franchises?.rcaInsurance);
        form.setValue('franchises.ifInsurance', vehicle.franchises?.ifInsurance);
        form.setValue('franchises.kaskoInsurance', vehicle.franchises?.kaskoInsurance);
        form.setValue('franchises.paiInsurance', vehicle.franchises?.paiInsurance);
      } else {
        if (isMovolabLicense) {
          form.setValue('franchises.rcaInsurance', true);
          form.setValue('franchises.ifInsurance', true);
          form.setValue('franchises.kaskoInsurance', true);
        }
      }

      form.setValue('franchises.ifFranchise', vehicle.franchises?.ifFranchise);
      form.setValue('franchises.paiFranchise', vehicle.franchises?.paiFranchise);
      form.setValue('franchises.kaskoFranchise', vehicle.franchises?.kaskoFranchise);

      form.setValue('ownershipTax.ownershipTax', vehicle.ownershipTax?.ownershipTax);
      form.setValue('ownershipTax.ownershipTaxAmount', vehicle.ownershipTax?.ownershipTaxAmount);
      if (vehicle.ownershipTax?.ownershipTaxStartDate)
        form.setValue(
          'ownershipTax.ownershipTaxStartDate',
          new Date(vehicle.ownershipTax?.ownershipTaxStartDate).toISOString().split('T')[0],
        );
      if (vehicle.ownershipTax?.ownershipTaxStartDate)
        form.setValue(
          'ownershipTax.ownershipTaxEndDate',
          new Date(vehicle.ownershipTax?.ownershipTaxEndDate).toISOString().split('T')[0],
        );
    }
  };

  const onSubmitPurchaseDetails = async () => {
    try {
      const data = form.getValues();

      if (vehicle && vehicle._id !== undefined) {
        await http({
          method: 'PUT',
          url: `/vehicles/vehicle/${vehicle._id}`,
          form: data,
        });
        if (!isWizard) toast.success('Veicolo aggiornato');
        if (updateStepDone) updateStepDone(3);
      } else {
        toast.error('Inserisci prima i Dati Veicolo');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <form id="saveVehicle" onSubmit={form.handleSubmit(onSubmitPurchaseDetails)}>
      <fieldset disabled={form.formState.isSubmitting}>
        <div className="flex">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-wrap">
              <div className="mr-3 w-40">
                <SelectField
                  form={form}
                  name="franchises.maintenance"
                  label="Manutenzione"
                  options={[
                    { value: false, label: 'NO' },
                    { value: true, label: 'SI' },
                  ]}
                />
              </div>
              <div className="mr-3 w-64">
                <SelectField
                  form={form}
                  name="franchises.maintenanceFranchise"
                  placeholder={'Seleziona...'}
                  label="Franchigia Manutenzione"
                  options={franchises}
                />
              </div>
            </div>
            <div className="flex flex-wrap">
              <div className="mr-3 w-40">
                <SelectField
                  form={form}
                  name="contract.tiresNumber"
                  type="text"
                  label="Pneumatici"
                  placeholder="Seleziona..."
                  options={tiresNumber}
                />
              </div>
              <div className="mr-3 w-64">
                <SelectField
                  form={form}
                  name="contract.tiresType"
                  label="Tipo pneumatici"
                  type="text"
                  placeholder="Seleziona..."
                  options={[
                    { value: 'summer', label: 'ESTATE' },
                    { value: 'winter', label: 'INVERNALI' },
                    { value: 'allseason', label: 'ALL SEASON' },
                    { value: 'ondemand', label: 'SU RICHIESTA' },
                    { value: 'none', label: 'NON PREVISTI' },
                  ]}
                />
              </div>{' '}
            </div>
            <div className="flex flex-wrap">
              <div className="mr-3 w-40">
                <SelectField
                  form={form}
                  name="franchises.ifInsurance"
                  options={[
                    { value: false, label: 'NO' },
                    { value: true, label: 'SI' },
                  ]}
                  placeholder={'Seleziona...'}
                  label="Assicurazione I/F"
                  validation={{
                    required: {
                      value: isMovolabLicense,
                      message: 'Obbligatoria per licenza Movolab',
                    },
                    // value: { value: isMovolabLicense, message: 'Obbligatoria per licenza Movolab' },
                  }}
                />
              </div>
              <div className="mr-3 w-64">
                <SelectField
                  form={form}
                  name="franchises.ifFranchise"
                  placeholder={'Seleziona...'}
                  options={franchises}
                  label="Franchigia I/F"
                  validation={{
                    required: {
                      value: form.watch('franchises.ifInsurance'),
                      message: 'Selezionare la franchigia',
                    },
                  }}
                />
              </div>
            </div>
            <div className="flex flex-wrap">
              <div className="mr-3 w-40">
                <SelectField
                  form={form}
                  name="franchises.kaskoInsurance"
                  label="Assicurazione Kasko"
                  placeholder={'Seleziona...'}
                  options={[
                    { value: false, label: 'NO' },
                    { value: true, label: 'SI' },
                  ]}
                  validation={{
                    required: {
                      value: isMovolabLicense,
                      message: 'Obbligatoria per licenza Movolab',
                    },
                    // value: { value: isMovolabLicense, message: 'Obbligatoria per licenza Movolab' },
                  }}
                />
              </div>
              <div className="mr-3 w-64">
                <SelectField
                  form={form}
                  name="franchises.kaskoFranchise"
                  label="Franchigia Kasko"
                  placeholder={'Seleziona...'}
                  options={franchises}
                  validation={{
                    required: {
                      value: form.watch('franchises.kaskoInsurance'),
                      message: 'Selezionare la franchigia',
                    },
                  }}
                />
              </div>
            </div>
            <div className="flex flex-wrap">
              <div className="mr-3 w-40">
                <SelectField
                  form={form}
                  name="franchises.rcaInsurance"
                  label="Assicurazione RCA"
                  placeholder={'Seleziona...'}
                  options={[
                    { value: false, label: 'NO' },
                    { value: true, label: 'SI' },
                  ]}
                  validation={{
                    required: {
                      value: isMovolabLicense,
                      message: 'Obbligatoria per licenza Movolab',
                    },
                    // value: { value: isMovolabLicense, message: 'Obbligatoria per licenza Movolab' },
                  }}
                />
              </div>
              <div className="mr-3 w-64">
                <SelectField
                  form={form}
                  name="franchises.rcaFranchise"
                  label="Franchigia RCA"
                  placeholder={'Seleziona...'}
                  options={franchises}
                  validation={{
                    required: {
                      value: form.watch('franchises.rcaInsurance'),
                      message: 'Selezionare la franchigia',
                    },
                  }}
                />
              </div>
              <div className="mr-3 w-48">
                <TextField
                  form={form}
                  name="franchises.maxRca"
                  type="number"
                  placeholder="Massimale RCA"
                  label="Massimale RCA"
                  min={0}
                  validation={{
                    required: {
                      // value: !isMovolabLicense && form.getValues('franchises.rcaInsurance'),
                      message: 'Selezionare il massimale',
                    },
                  }}
                />
              </div>
              <div className="mr-3 w-48">
                <TextField
                  form={form}
                  name="franchises.rcaStartDate"
                  type="date"
                  placeholder="Data Inizio Polizza RCA"
                  label="Data Inizio Polizza RCA"
                  min={0}
                  validation={{
                    required: {
                      // value: !isMovolabLicense && form.getValues('franchises.rcaInsurance'),
                      message: 'Selezionare la data di inizio',
                    },
                  }}
                />
              </div>
              <div className="mr-3 w-48">
                <TextField
                  form={form}
                  name="franchises.rcaEndDate"
                  type="date"
                  placeholder="Data Fine Polizza RCA"
                  label="Data Fine Polizza RCA"
                  min={0}
                  validation={{
                    required: {
                      // value: !isMovolabLicense && form.getValues('franchises.rcaInsurance'),
                      message: 'Selezionare la data di fine',
                    },
                  }}
                />
              </div>
            </div>
            <div className="flex flex-wrap">
              {' '}
              <div className="mr-3 w-40">
                <SelectField
                  form={form}
                  name="franchises.paiInsurance"
                  label="Assicurazione PAI"
                  placeholder={'Seleziona...'}
                  options={[
                    { value: false, label: 'NO' },
                    { value: true, label: 'SI' },
                  ]}
                />
              </div>
              <div className="mr-3 w-64">
                <SelectField
                  form={form}
                  name="franchises.paiFranchise"
                  label="Franchigia PAI"
                  placeholder={'Seleziona...'}
                  options={franchises}
                />
              </div>
            </div>
            <div className="flex flex-wrap">
              <div className="mr-3 w-40">
                <SelectField
                  form={form}
                  name="contract.roadsideAssistance"
                  label="Assistenza Stradale"
                  options={[
                    { value: false, label: 'NO' },
                    { value: true, label: 'SI' },
                  ]}
                />
              </div>
              <div className="mr-3 w-64">
                <TextField
                  form={form}
                  name="contract.roadsideAssistanceDetail"
                  type="text"
                  placeholder="Dettaglio Assistenza Stradale"
                  label="Dettaglio Assistenza Stradale"
                  min={0}
                />
              </div>
            </div>
            <div className="flex flex-wrap">
              <div className="mr-3 w-40">
                <SelectField
                  form={form}
                  name="contract.replacementVehicle"
                  label="Veicolo Sostitutivo"
                  options={[
                    { value: false, label: 'NO' },
                    { value: true, label: 'SI' },
                  ]}
                />
              </div>
              <div className="mr-3 w-64">
                <TextField
                  form={form}
                  name="contract.replacementVehicleDetail"
                  type="text"
                  placeholder="Dettaglio Veicolo Sostitutivo"
                  label="Dettaglio Veicolo Sostitutivo"
                  min={0}
                />
              </div>
            </div>
            <div className="flex flex-wrap">
              <div className="mr-3 w-40">
                <SelectField
                  form={form}
                  name="ownershipTax.ownershipTax"
                  label="Tassa Possesso"
                  options={[
                    { value: false, label: 'NO' },
                    { value: true, label: 'SI' },
                  ]}
                />
              </div>
              <div className="mr-3 w-64">
                <TextField
                  form={form}
                  name="ownershipTax.ownershipTaxAmount"
                  type="number"
                  placeholder="Valore Tassa Possesso"
                  label="Valore Tassa Possesso"
                  min={0}
                />
              </div>
              <div className="mr-3 w-48">
                <TextField
                  form={form}
                  name="ownershipTax.ownershipTaxStartDate"
                  type="date"
                  placeholder="Data Inizio Tassa Possesso"
                  label="Data Inizio Tassa Possesso"
                  min={0}
                />
              </div>
              <div className="mr-3 w-48">
                <TextField
                  form={form}
                  name="ownershipTax.ownershipTaxEndDate"
                  type="date"
                  placeholder="Data Fine Tassa Possesso"
                  label="Data Fine Tassa Possesso"
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>
      </fieldset>
      {/*<div className="w-60 mt-2 px-2">
        <GrayButton
          onClick={(e) => {
            e.preventDefault();
            onSubmitPurchaseDetails();
          }}
        >
          {' '}
          {params.id ? 'Aggiorna Veicolo' : 'Inserisci Veicolo'}
        </GrayButton>
        </div>*/}
    </form>
  );
};

export default Contract;
