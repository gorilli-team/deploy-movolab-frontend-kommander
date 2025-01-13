import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField } from '../../../Form/TextField';
import { http } from '../../../../utils/Utils';
import toast from 'react-hot-toast';
import { SelectField } from '../../../Form/SelectField';
import ModalConfirmDialog from '../../../UI/ModalConfirmDialog';
import { getCurrentPartnerCode, UserContext } from '../../../../store/UserContext';

const PurchaseDetails = ({ vehicle, fetchVehicle, updateStepDone, isWizard = false }) => {
  const form = useForm();
  const [vehicleData, setVehicleData] = useState(vehicle);
  const [availablePartners, setAvailablePartners] = useState([
    { value: 'muovok', label: 'Muovok' },
  ]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const { data: currentClient } = useContext(UserContext);

  useEffect(() => {
    const fetchVehicleData = async () => {
      await setVehicleData(); // Assuming setVehicleData is asynchronous
    };

    if (vehicle) {
      fetchVehicleData();
    }
  }, [vehicle]);

  useEffect(() => {
    const fetchPartnerCode = async () => {
      try {
        const partner_code = await getCurrentPartnerCode(currentClient.client);
        if (partner_code?.partners) {
          setAvailablePartners(partner_code.partners.map((p) => ({ value: p._id, label: p.name })));
        }
      } catch (error) {
        console.error('Error fetching partner code:', error);
      }
    };

    if (currentClient) {
      fetchPartnerCode(); // Call the async function
    }
  }, [currentClient]);

  if (!currentClient) return null;
  const isMovolabLicense = currentClient.client?.license?.licenseOwner === 'movolab';

  if (vehicleData && vehicleData._id !== undefined) {
    form.setValue('purchaseDetails.purchaseType', vehicleData.purchaseDetails?.purchaseType);
    form.setValue('purchaseDetails.owner', vehicleData.purchaseDetails?.owner);
    form.setValue('purchaseDetails.listPrice', vehicleData.purchaseDetails?.listPrice);
    form.setValue('purchaseDetails.optionalPrice', vehicleData.purchaseDetails?.optionalPrice);
    form.setValue('purchaseDetails.purchasePrice', vehicleData.purchaseDetails?.purchasePrice);
    form.setValue('contract.code', vehicleData.contract?.code);
    form.setValue('contract.supplierVehicleCode', vehicleData.contract?.supplierVehicleCode);
    form.setValue('contract.monthlyFee', vehicleData.contract?.monthlyFee);
    form.setValue('contract.contractKm', vehicleData.contract?.contractKm);
    form.setValue('salesPartner', vehicleData.salesPartner);
    form.setValue('otherSalesPartner', vehicleData.otherSalesPartner);
    if (vehicleData.contract?.startDate)
      form.setValue(
        'contract.startDate',
        new Date(vehicleData.contract?.startDate).toISOString().split('T')[0],
      );
    if (vehicleData.contract?.endDate)
      form.setValue(
        'contract.endDate',
        new Date(vehicleData.contract?.endDate).toISOString().split('T')[0],
      );
    form.setValue('contract.durationMonths', vehicleData.contract?.durationMonths);

    if (vehicleData.purchaseDetails?.plannedSaleDate)
      form.setValue(
        'purchaseDetails.plannedSaleDate',
        new Date(vehicleData.purchaseDetails?.plannedSaleDate).toISOString().split('T')[0],
      );

    if (vehicleData.purchaseDetails?.estimatedSaleValue)
      form.setValue(
        'purchaseDetails.estimatedSaleValue',
        vehicleData.purchaseDetails?.estimatedSaleValue,
      );
    if (vehicleData.purchaseDetails?.dismissionDate)
      form.setValue(
        'purchaseDetails.dismissionDate',
        new Date(vehicleData.purchaseDetails?.dismissionDate).toISOString().split('T')[0],
      );

    form.setValue('purchaseDetails.salePrice', vehicleData.purchaseDetails?.salePrice);
  }

  const otherPartnerPopup = (showMessage = true) => {
    const data = form.getValues();

    if (!isMovolabLicense) return;

    if (
      showMessage &&
      data.salesPartner === 'other' &&
      (vehicle?.salesPartner !== 'other' || vehicle?.salesPartner === undefined)
    ) {
      setShowMessageModal(true);
      return;
    }
  };

  const onSubmitPurchaseDetails = async () => {
    try {
      const data = form.getValues();

      if (data.purchaseDetails.purchaseType !== 'nlt') {
        data.purchaseDetails.owner = null;
      }

      if (data.salesPartner === 'other') {
        if (!vehicle.documents.find((v) => v.name === 'Attestati di sublocazione')) {
          await http({
            url: `/vehicles/vehicle/documents/add/${vehicle._id}`,
            method: 'POST',
            form: {
              label: 'registration',
              name: 'Attestati di sublocazione',
              description: 'Caricare gli attestati di sublocazione del veicolo',
            },
          });
        }
      }

      if (vehicle && vehicle._id !== undefined) {
        await http({
          method: 'PUT',
          url: `/vehicles/vehicle/${vehicle._id}`,
          form: data,
        });
        if (!isWizard) toast.success('Veicolo aggiornato');
        if (updateStepDone) updateStepDone(2);
      } else {
        toast.error('Inserisci prima i Dati Veicolo');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <form id="saveVehicle" onSubmit={form.handleSubmit(() => onSubmitPurchaseDetails(true))}>
      <fieldset disabled={form.formState.isSubmitting}>
        <div className="flex">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-wrap">
              <div className="mr-3 w-64">
                <SelectField
                  form={form}
                  name="purchaseDetails.purchaseType"
                  placeholder="Tipo Acquisto"
                  label="Tipo Acquisto"
                  validation={{
                    required: { value: true, message: 'Selezionare il tipo acquisto' },
                  }}
                  options={[
                    { value: 'nlt', label: 'Noleggio Lungo Termine' },
                    { value: 'leasing', label: 'Leasing' },
                    { value: 'buy', label: 'Acquisto' },
                  ]}
                />
              </div>
              {form.watch('purchaseDetails.purchaseType') === 'nlt' && (
                <div className="mr-3 w-64">
                  <SelectField
                    form={form}
                    name="purchaseDetails.owner"
                    placeholder="Proprietario"
                    label="Proprietario"
                    validation={{
                      required: { value: true, message: 'Selezionare il proprietario' },
                    }}
                    options={[
                      { value: 'alphabet', label: 'Alphabet' },
                      { value: 'ald', label: 'Ald' },
                      { value: 'arval', label: 'Arval' },
                      { value: 'athlon', label: 'Athlon' },
                      { value: 'ayvens', label: 'Ayvens' },
                      { value: 'drivalia', label: 'Drivalia' },
                      { value: 'kia rent', label: 'Kia Rent' },
                      { value: 'leaseway', label: 'Leaseway' },
                      { value: 'leasys', label: 'Leasys' },
                      { value: 'leaseplan', label: 'Leaseplan' },
                      { value: 'moov', label: 'Moov' },
                      { value: 'santander', label: 'Santander' },
                      { value: 'unipolrental', label: 'Unipolrental' },
                      { value: 'other', label: 'Altro' },
                    ]}
                  />
                </div>
              )}
              {form.watch('purchaseDetails.purchaseType') === 'leasing' && (
                <div className="mr-3 w-64">
                  <TextField
                    form={form}
                    name="purchaseDetails.owner"
                    placeholder="Proprietario"
                    label="Proprietario"
                    validation={{
                      required: { value: true, message: 'Indicare il proprietario' },
                    }}
                  />
                </div>
              )}
              {form.watch('purchaseDetails.purchaseType') === 'nlt' && (
                <div className="mr-3 w-64">
                  <SelectField
                    form={form}
                    name="salesPartner"
                    placeholder="Partner Acquisto"
                    label="Partner Acquisto"
                    onChangeFunction={otherPartnerPopup}
                    validation={{
                      required: {
                        value: isMovolabLicense, // && form.watch('purchaseDetails.purchaseType') === 'nlt',
                        message: 'Selezionare partner di vendita',
                      },
                    }}
                    options={[...availablePartners, { value: 'other', label: 'Altro' }]}
                  />
                </div>
              )}
              {form.watch('salesPartner') === 'other' &&
                form.watch('purchaseDetails.purchaseType') === 'nlt' && (
                  <div className="mr-3 w-64">
                    <TextField
                      form={form}
                      name="otherSalesPartner"
                      placeholder="Altro Partner Acquisto"
                      label="Altro Partner Acquisto"
                      type={'text'}
                      validation={{
                        required: {
                          value: form.watch('purchaseDetails.purchaseType') === 'nlt',
                          message: 'Indicare altro partner di acquisto',
                        },
                      }}
                    />
                  </div>
                )}
            </div>
            {form.watch('purchaseDetails.purchaseType') !== 'nlt' ? (
              <div className="mt-4">
                <div className="flex flex-wrap">
                  <div className="font-bold text-lg">Dettagli Acquisto</div>
                </div>
                <div className="flex flex-wrap">
                  <div className="mr-3 w-64">
                    <TextField
                      form={form}
                      name="purchaseDetails.listPrice"
                      type="number"
                      placeholder="Listino Veicolo"
                      label="Listino Veicolo (€)"
                      min={0}
                    />
                  </div>
                  <div className="mr-3 w-64">
                    <TextField
                      form={form}
                      name="purchaseDetails.optionalPrice"
                      type="number"
                      placeholder="Listino Optional"
                      label="Listino Optional (€)"
                      min={0}
                    />
                  </div>
                  <div className="mr-3 w-64">
                    <TextField
                      form={form}
                      name="purchaseDetails.purchasePrice"
                      type="number"
                      placeholder="Prezzo Acquisto Veicolo"
                      label="Prezzo Acquisto Veicolo (€)"
                      min={0}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap">
                  <div className="mr-3 w-64">
                    <TextField
                      form={form}
                      name="purchaseDetails.plannedSaleDate"
                      type="date"
                      placeholder="Data Prevista Vendita"
                      label="Data Prevista Vendita"
                      min={0}
                    />
                  </div>
                  <div className="mr-3 w-64">
                    <TextField
                      form={form}
                      name="purchaseDetails.estimatedSaleValue"
                      type="number"
                      lang="it-IT"
                      placeholder="Valore Stimato Vendita"
                      label="Valore Stimato Vendita"
                      min={0}
                    />
                  </div>
                  <div className="mr-3 w-64">
                    <TextField
                      form={form}
                      name="purchaseDetails.dismissionDate"
                      type="date"
                      placeholder="Data Dismissione"
                      label="Data Dismissione"
                    />
                  </div>
                  <div className="mr-3 w-64">
                    <TextField
                      form={form}
                      name="purchaseDetails.salePrice"
                      type="number"
                      placeholder="Prezzo Vendita Veicolo"
                      label="Prezzo Vendita Veicolo (€)"
                      min={0}
                    />
                  </div>
                </div>
              </div>
            ) : null}
            <div className="mt-4">
              <div className="flex flex-wrap">
                <div className="font-bold text-lg">Contratto</div>
              </div>
              <div className="flex flex-wrap">
                <div className="mr-3 w-64">
                  <TextField
                    form={form}
                    name="contract.code"
                    type="string"
                    placeholder="Codice Contratto"
                    label="Codice Contratto"
                  />
                </div>
                <div className="mr-3 w-64">
                  <TextField
                    form={form}
                    name="contract.supplierVehicleCode"
                    type="string"
                    placeholder="Codice Veicolo Fornitore"
                    label="Codice Veicolo Fornitore"
                  />
                </div>
                <div className="mr-3 w-64">
                  <TextField
                    form={form}
                    name="contract.monthlyFee"
                    type="number"
                    placeholder="Canone Mese Imponibile"
                    label="Canone Mese Imponibile (€)"
                    min={0}
                  />
                </div>
              </div>
              <div className="flex flex-wrap">
                <div className="mr-3 w-64">
                  <TextField
                    form={form}
                    name="contract.startDate"
                    type="date"
                    placeholder="Data Inizio Contratto"
                    label="Data Inizio Contratto"
                    min={0}
                    validation={{
                      required: {
                        value: form.getValues('purchaseDetails.purchaseType') === 'nlt',
                        message: 'Selezionare la data di inizio contratto',
                      },
                    }}
                  />
                </div>
                <div className="mr-3 w-64">
                  <TextField
                    form={form}
                    name="contract.endDate"
                    type="date"
                    placeholder="Data Fine Contratto"
                    label="Data Fine Contratto"
                    min={0}
                    validation={{
                      required: {
                        value: form.getValues('purchaseDetails.purchaseType') === 'nlt',
                        message: 'Selezionare la data di fine contratto',
                      },
                    }}
                  />
                </div>
                <div className="mr-3 w-64">
                  <TextField
                    form={form}
                    name="contract.durationMonths"
                    type="number"
                    placeholder="Durata del contratto"
                    label="Durata del contratto (mesi)"
                    min={0}
                    max={120}
                    validation={{
                      max: { value: 120, message: 'Massimo 120 mesi' },
                      required: {
                        value: form.getValues('purchaseDetails.purchaseType') === 'nlt',
                        message: 'Selezionare la durata del contratto',
                      },
                    }}
                  />
                </div>
                <div className="mr-3 w-64">
                  <TextField
                    form={form}
                    name="contract.contractKm"
                    type="number"
                    placeholder="Km Contratto"
                    label="KM Contratto"
                    min={0}
                    validation={{
                      required: {
                        value: form.getValues('purchaseDetails.purchaseType') === 'nlt',
                        message: 'Selezionare i km previsti dal contratto',
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </fieldset>
      <ModalConfirmDialog
        innerClassName="w-96 px-6 py-4"
        isVisible={showMessageModal}
        headerChildren="Altro Partner Acquisto"
        title=""
        description={
          'Attenzione! In questo caso potrebbero non essere attivi tutti i servizi (es. gestione rinotifica multe)'
        }
        okText="Accetta"
        handleCancel={() => {
          setShowMessageModal(false);
          form.setValue('salesPartner', 'muovok');
        }}
        handleOk={() => {
          setShowMessageModal(false);
          // onSubmitPurchaseDetails(false);
        }}
      />
    </form>
  );
};

export default PurchaseDetails;
