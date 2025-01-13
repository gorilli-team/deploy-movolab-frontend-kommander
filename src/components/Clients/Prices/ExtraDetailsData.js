import React, { useContext } from 'react';
import FormLabel from '../../UI/FormLabel';
import { TextField } from '../../Form/TextField';
import { SelectField } from '../../Form/SelectField';
import GroupsSelector from '../../UI/GroupsSelector';
import { UserContext } from '../../../store/UserContext';
import { MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';
const ExtraDetailsData = ({ form, groups, isDisabled }) => {
  const { data: currentClient } = useContext(UserContext);

  if (!currentClient) return null;
  if (!currentClient.client && currentClient.role !== MOVOLAB_ROLE_ADMIN) return null;
  let invoicingOptions = [];

  const isMovolabOperator = currentClient.role === MOVOLAB_ROLE_ADMIN;

  if (isMovolabOperator) {
    invoicingOptions = [
      { value: '', label: '-- Seleziona --' },
      { value: 'movolab', label: 'Movolab' },
      { value: 'customer', label: 'Cliente' },
    ];
  } else {
    invoicingOptions = [
      { value: '', label: '-- Seleziona --' },
      { value: 'customer', label: 'Cliente' },
    ];
  }

  return (
    <>
      <div>
        <div className="w-[492px] mt-4">
          <FormLabel>Nome</FormLabel>
          <TextField form={form} name="name" placeholder="Nome" disabled={isDisabled} />
        </div>
        <div className="w-[492px] mt-2">
          <FormLabel>Descrizione</FormLabel>
          <TextField
            form={form}
            name="description"
            type="text"
            placeholder="Descrizione"
            disabled={isDisabled}
          />
        </div>

        <div className="w-[492px] mt-2">
          <GroupsSelector
            groups={groups}
            form={form}
            returnParameter={'groups'}
            disabled={isDisabled}
            checkFormIsDirty={() => {}}
          />
        </div>
        <div className="flex mt-2">
          <div className="w-60 mr-3">
            <FormLabel>Tipo</FormLabel>
            <SelectField
              name="type"
              form={form}
              options={[
                { value: 'accessory', label: 'Accessorio' },
                { value: 'service', label: 'Servizio' },
                { value: 'extraCost', label: 'Costo Extra' },
                { value: 'other', label: 'Altro' },
              ]}
              disabled={isDisabled}
              placeholder="Tipo"
            />
          </div>
          <div className="w-60 mr-3">
            <FormLabel>Applicabilità</FormLabel>
            <SelectField
              name="applicability"
              form={form}
              options={[
                { value: 'manual', label: 'Manuale' },
                { value: 'automatic', label: 'Automatico' },
              ]}
              disabled={isDisabled}
              placeholder="Applicabilità"
            />
          </div>
        </div>
        {form.watch('applicability') === 'manual' && (
          <div className="w-60 mr-3">
            <FormLabel>Disponibile in fase di</FormLabel>
            <SelectField
              name="insertionPhase"
              form={form}
              options={[
                { value: 'pickUp', label: 'Creazione' },
                { value: 'dropOff', label: 'Chiusura' },
                { value: 'both', label: 'Entrambi' },
              ]}
              disabled={isDisabled}
              placeholder="Fase di inserimento"
            />
          </div>
        )}
        {form.watch('applicability') === 'automatic' && (
          <div className="flex flex-wrap rounded-md mt-2">
            <div className="w-60 mr-3">
              <FormLabel>Parametro Regola Automatica</FormLabel>
              <SelectField
                name="automaticRule.parameter"
                form={form}
                options={[
                  { value: 'age', label: 'Età' },
                  { value: 'distance', label: 'Distanza' },
                  { value: 'fuel', label: 'Carburante' },
                  { value: 'day', label: 'Giorni' },
                ]}
                disabled={isDisabled}
                placeholder="Parametro Regola Automatica"
              />
            </div>
            {form.watch('automaticRule.parameter') === 'fuel' && (
              <div className="w-60 mr-3">
                <FormLabel>Tipo Carburante</FormLabel>
                <SelectField
                  name="automaticRule.fuelCategory"
                  form={form}
                  options={[
                    {
                      value: 'benzina',
                      label: 'Benzina',
                    },
                    {
                      value: 'diesel',
                      label: 'Diesel',
                    },
                    {
                      value: 'ibrida',
                      label: 'Ibrida',
                    },
                    {
                      value: 'elettrico',
                      label: 'Elettrica',
                    },
                    {
                      value: 'gpl',
                      lable: 'GPL',
                    },
                    {
                      value: 'metano',
                      lable: 'Metano',
                    },
                  ]}
                  disabled={isDisabled}
                  placeholder="Parametro Regola Automatica"
                />
              </div>
            )}
            <div className="w-60 mr-3">
              <FormLabel>Check Regola Automatica</FormLabel>
              <SelectField
                name="automaticRule.check"
                form={form}
                options={[
                  { value: 'between', label: 'Valore compreso da... a...' },
                  { value: '<', label: 'Valore minore di...' },
                  { value: '>', label: 'Valore maggiore di...' },
                  { value: '<=', label: 'Valore minore o uguale di...' },
                  { value: '>=', label: 'Valore maggiore o uguale di...' },
                  { value: '=', label: 'Valore uguale a...' },
                ]}
                disabled={isDisabled}
                placeholder="Check Regola Automatica"
              />
            </div>
            <div className="w-60 mr-3">
              <FormLabel>Valore Regola Automatica</FormLabel>
              <TextField
                name="automaticRule.value1"
                form={form}
                type="number"
                validation={{
                  min: { value: 0, message: 'Valore minimo: 0' },
                }}
                disabled={isDisabled}
                placeholder="Valore Regola Automatica"
              />
            </div>
            {form.watch('automaticRule.check') === 'between' && (
              <div className="w-60 mr-3">
                <FormLabel>Valore Regola Automatica 2</FormLabel>
                <TextField
                  name="automaticRule.value2"
                  form={form}
                  type="number"
                  validation={{
                    min: { value: 0, message: 'Valore minimo: 0' },
                  }}
                  disabled={isDisabled}
                  placeholder="Valore Regola Automatica 2"
                />
              </div>
            )}
          </div>
        )}
        {form.watch('applicability') === 'manual' && (
          <div className="flex flex-wrap rounded-md mt-2">
            <div className="w-60 mr-3">
              <FormLabel>Parametro Regola Franchigia</FormLabel>
              <SelectField
                name="manualRule.parameter"
                form={form}
                options={[
                  { value: undefined, label: 'Nessuno' },
                  { value: 'kasko', label: 'Kasko' },
                  { value: 'furto', label: 'Furto' },
                  { value: 'rca', label: 'RCA' },
                ]}
                disabled={isDisabled}
                placeholder="Parametro Regola Franchigia"
              />
            </div>
            <div className="w-60 mr-3">
              <FormLabel>Percentuale Riduzione</FormLabel>
              <TextField
                name="manualRule.reduction"
                form={form}
                type="number"
                validation={{
                  min: { value: 0, message: 'Valore minimo: 0' },
                  max: { value: 100, message: 'Valore massimo: 100' },
                }}
                disabled={isDisabled}
                placeholder="Percentuale Riduzione"
              />
            </div>
          </div>
        )}
        <div className="flex flex-wrap mt-2">
          <div className="w-60 mr-3">
            <FormLabel>Costo Unitario (€)</FormLabel>
            <TextField
              form={form}
              name="cost.amount"
              type="text"
              disabled={isDisabled}
              placeholder="Valore prezzo"
            />
          </div>
          <div className="w-60 mr-3">
            <FormLabel>Calcolo Prezzo</FormLabel>
            <SelectField
              name="cost.calculation"
              form={form}
              options={[
                { value: 'fixed', label: 'Fisso' },
                { value: 'daily', label: 'Giornaliero' },
                { value: 'percentage', label: 'Percentuale' },
                { value: 'unit', label: 'Per Unità' },
              ]}
              disabled={isDisabled}
              placeholder="Calcolo Prezzo"
            />
          </div>
        </div>
        <div className="flex flex-wrap mt-2">
          <div className="w-60 mr-3">
            <FormLabel>Fatturazione</FormLabel>
            {isMovolabOperator ? (
              <SelectField
                name="configuration.invoicingType"
                form={form}
                options={invoicingOptions}
                disabled={isDisabled}
                placeholder="Fatturazione"
              />
            ) : (
              <TextField
                form={form}
                name="invoicingTypeCustomer"
                type="text"
                disabled={true}
                placeholder="Fatturazione"
              />
            )}
          </div>
          <div className="w-60 mr-3">
            <FormLabel>Iva</FormLabel>
            <SelectField
              name="configuration.vatPercentage"
              form={form}
              options={[
                { value: 0, label: '0%' },
                { value: 4, label: '4%' },
                { value: 10, label: '10%' },
                { value: 22, label: '22%' },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ExtraDetailsData;
