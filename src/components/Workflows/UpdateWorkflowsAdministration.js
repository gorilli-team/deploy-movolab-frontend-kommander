import React, { useContext, useEffect, useState } from 'react';
import { http, MOVOLAB_ROLE_ADMIN, CLIENT_ROLE_ADMIN } from '../../utils/Utils';
import { UserContext } from '../../store/UserContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { SelectField } from '../Form/SelectField';
import { TextField } from '../Form/TextField';
import FormLabel from '../UI/FormLabel';
import Button from '../UI/buttons/Button';

const UpdateWorkflowsAdministration = ({ workflowId = null, editOk = false, submitFn = null }) => {
  const form = useForm();
  const params = useParams();
  const [canModify, setCanModify] = useState(editOk);

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;
  const isClientAdmin = currentClient?.role === CLIENT_ROLE_ADMIN;

  const maxDays = 60;

  useEffect(() => {
    fetchWorkflow();
  }, [canModify]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchWorkflow = async () => {
    try {
      const response = await http({ url: `/workflow/${workflowId || params.id}?mode=flat` });
      const data = response.administration;

      form.setValue('faresDiscountMaxPercentage', data.faresDiscountMaxPercentage);
      form.setValue('faresDiscountMaxEuro', data.faresDiscountMaxEuro);
      form.setValue(
        'faresDiscountType',
        data.faresDiscountMaxEuro
          ? 'euro'
          : data.faresDiscountMaxPercentage
            ? 'percentage'
            : 'none',
      );
      form.setValue('extraDiscount', data.extraDiscount ? 'true' : 'false');
      form.setValue('reservationPrepaidPercentage', data.paymentAdvance);
      form.setValue('prepaidReservation', data.prepaidReservation);
      form.setValue('prepaidRent', data.prepaidRent);
      form.setValue('deposit', data.deposit ? 'true' : 'false');
      form.setValue('depositInvoice', data.depositInvoice ? 'true' : 'false');
      form.setValue('maxDays', data.maxDays);
      form.setValue('prepaidExtra', data.prepaidExtra ? 'true' : 'false');
      form.setValue('faresDiscount', data.faresDiscount ? 'true' : 'false');
      form.setValue('paymentAdvance', data.paymentAdvance);
      form.setValue('noShowFee', data.noShowFee);
      form.setValue('prepaid', data.prepaid ? 'true' : 'false');

      if (isAdmin) {
        setCanModify(true);
      } else if (isClientAdmin) {
        setCanModify(response?.client?._id === currentClient?.client?._id);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const handlePrepaidChange = (value) => {
    form.setValue('prepaidRent', 0);
    form.setValue('prepaidReservation', 0);
  };

  const handleDepositChange = (value) => {
    form.setValue('depositInvoice', false);
  };

  const handlePrepaidRentChange = (e) => {
    e.preventDefault();
    const prepaid = form.watch('prepaid');
    const prepaidRent = form.watch('prepaidRent');
    const prepaidReservationValue = 100 - prepaidRent;
    form.setValue('prepaidReservation', prepaid ? prepaidReservationValue : 0);
  };

  const handlePrepaidReservationChange = (e) => {
    e.preventDefault();
    const prepaid = form.watch('prepaid');
    const prepaidReservation = form.watch('prepaidReservation');
    const prepaidRentValue = 100 - prepaidReservation;
    form.setValue('prepaidRent', prepaid ? prepaidRentValue : 0);
  };

  const onSubmit = async (data) => {
    try {
      if (!canModify) {
        toast.error('Non hai i permessi per modificare la sezione amministrazione');
        return;
      }

      const update = {
        administration: {
          prepaid: data.prepaid,
          prepaidReservation: data.prepaidReservation,
          prepaidRent: data.prepaidRent,
          deposit: data.deposit,
          depositInvoice: data.depositInvoice,
          maxDays: data.maxDays,
          prepaidExtra: data.prepaidExtra,
          faresDiscount: data.faresDiscount,
          faresDiscountMaxPercentage:
            data.faresDiscount === 'true' && data.faresDiscountType === 'percentage'
              ? data.faresDiscountMaxPercentage
              : 0,
          faresDiscountMaxEuro:
            data.faresDiscount === 'true' && data.faresDiscountType === 'euro'
              ? data.faresDiscountMaxEuro
              : 0,
          extraDiscount: data.extraDiscount,
          paymentAdvance: data.paymentAdvance,
          noShowFee: data.noShowFee,
        },
      };

      await http({
        method: 'PUT',
        url: `/workflow/${workflowId || params.id}`,
        form: update,
      });
      if (submitFn) submitFn();
      else toast.success('Sezione Amministrazione aggiornata con successo');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="text-lg font-semibold">Amministrazione</div>

      <div>
        <form onSubmit={form.handleSubmit(onSubmit)} id="workflowForm">
          <fieldset disabled={form.formState.isSubmitting}>
            <div className="flex flex-wrap -mx-3">
              <div className="w-60 px-3">
                <FormLabel>Prepagato</FormLabel>
                <SelectField
                  name="prepaid"
                  form={form}
                  options={[
                    { value: true, label: 'SI' },
                    { value: false, label: 'NO' },
                  ]}
                  placeholder="Prepagato"
                  onChangeFunction={(value) => handlePrepaidChange(value)}
                  disabled={!canModify}
                />
              </div>
              <>
                <div className="w-60 px-3">
                  <FormLabel>Pagamento alla Prenotazione</FormLabel>
                  <SelectField
                    name="prepaidReservation"
                    form={form}
                    options={[
                      { value: 0, label: '0%' },
                      { value: 100, label: '100%' },
                    ]}
                    onChangeFunction={(e) => handlePrepaidReservationChange(e)}
                    disabled={!canModify || form.watch('prepaid') !== 'true'}
                  />
                </div>
                <div className="w-60 px-3">
                  <FormLabel>Pagamento in Apertura Movo</FormLabel>
                  <SelectField
                    name="prepaidRent"
                    form={form}
                    options={[
                      { value: 0, label: '0%' },
                      { value: 100, label: '100%' },
                    ]}
                    onChangeFunction={(e) => handlePrepaidRentChange(e)}
                    disabled={!canModify || form.watch('prepaid') !== 'true'}
                  />
                </div>
                <div className="w-60 px-3">
                  <FormLabel>Prepaga Extra</FormLabel>

                  <SelectField
                    name="administration.prepaidExtra"
                    form={form}
                    options={[
                      { value: true, label: 'SI' },
                      { value: false, label: 'NO' },
                    ]}
                    placeholder="Prepaga Extra"
                    disabled={!canModify}
                  />
                </div>
              </>
            </div>
            <div class="flex flex-wrap mt-4">
              <div class="font-semibold text-lg">Deposito</div>
            </div>
            <div className="flex flex-wrap -mx-3">
              <div className="w-60 px-3">
                <FormLabel>Deposito</FormLabel>
                <SelectField
                  name="deposit"
                  form={form}
                  options={[
                    { value: true, label: 'SI' },
                    { value: false, label: 'NO' },
                  ]}
                  placeholder="Deposito"
                  onChangeFunction={(value) => handleDepositChange(value)}
                  disabled={!canModify}
                />
              </div>
              <div className="w-60 px-3">
                <FormLabel>Fatturazione Deposito</FormLabel>
                <SelectField
                  name="depositInvoice"
                  form={form}
                  options={[
                    { value: true, label: 'SI' },
                    { value: false, label: 'NO' },
                  ]}
                  placeholder="Fatturazione Deposito"
                  disabled={!canModify || form.watch('deposit') !== 'true'}
                />
              </div>
            </div>
            <div class="flex flex-wrap mt-4">
              <div class="font-semibold text-lg">Giorni movo</div>
            </div>
            <div className="flex flex-wrap -mx-3">
              <div className="w-60 px-3">
                <FormLabel>Giorni Max</FormLabel>
                <SelectField
                  name="maxDays"
                  form={form}
                  options={
                    maxDays &&
                    [...Array(maxDays).keys()].map((i) => ({
                      value: i + 1,
                      label: i + 1,
                    }))
                  }
                  placeholder="Giorni Max"
                  disabled={!canModify}
                />
              </div>
            </div>
            <div class="flex flex-wrap mt-4">
              <div class="font-semibold text-lg">Sconti</div>
            </div>
            <div className="flex flex-wrap -mx-3">
              <div className="w-60 px-3">
                <FormLabel>Sconto Tariffe</FormLabel>
                <SelectField
                  name="faresDiscount"
                  form={form}
                  options={[
                    { value: 'true', label: 'SI' },
                    { value: 'false', label: 'NO' },
                  ]}
                  placeholder="Sconto Tariffe"
                  disabled={!canModify}
                />
              </div>
              {form.watch('faresDiscount') && form.watch('faresDiscount') === 'true' && (
                <div className="w-60 px-3">
                  <FormLabel>Tipo Sconto</FormLabel>
                  <SelectField
                    name="faresDiscountType"
                    form={form}
                    options={[
                      { value: 'percentage', label: 'Percentuale' },
                      { value: 'euro', label: 'Euro' },
                      { value: 'none', label: 'Nessuno' },
                    ]}
                    placeholder="Sconto Tariffe"
                    disabled={!canModify}
                  />
                </div>
              )}
              {form.watch('faresDiscount') &&
                form.watch('faresDiscount') === 'true' &&
                form.watch('faresDiscountType') === 'percentage' && (
                  <div className="w-60 px-3">
                    <FormLabel>Sconto Max %</FormLabel>
                    <TextField
                      form={form}
                      name="faresDiscountMaxPercentage"
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Sconto Max %"
                      disabled={!canModify}
                    />
                  </div>
                )}
              {form.watch('faresDiscount') &&
                form.watch('faresDiscount') === 'true' &&
                form.watch('faresDiscountType') === 'euro' && (
                  <div className="w-60 px-3">
                    <FormLabel>Sconto Max Euro</FormLabel>
                    <TextField
                      form={form}
                      name="faresDiscountMaxEuro"
                      type="number"
                      min={0}
                      placeholder="Sconto Max Euro"
                      disabled={!canModify}
                    />
                  </div>
                )}
              <div className="w-60 px-3">
                <FormLabel>Sconto Extra</FormLabel>
                <SelectField
                  name="extraDiscount"
                  form={form}
                  options={[
                    { value: 'true', label: 'SI' },
                    { value: 'false', label: 'NO' },
                  ]}
                  placeholder="Sconto Extra"
                  disabled={!canModify}
                />
              </div>
            </div>

            {isAdmin && canModify && (
              <div className="mt-5">
                <Button>Aggiorna</Button>
              </div>
            )}
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default UpdateWorkflowsAdministration;
