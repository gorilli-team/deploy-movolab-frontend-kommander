import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { http } from '../../../../utils/Utils';
import { UserContext } from '../../../../store/UserContext';
import Button from '../../../UI/buttons/Button';
import FormLabel from '../../../UI/FormLabel';
import { SelectField } from '../../../Form/SelectField';
import { TextField } from '../../../Form/TextField';
import { useHistory } from 'react-router-dom';
import { fetchCountries } from '../../../../utils/Addresses';

const NewClientData = ({
  updateSection,
  clientId,
  updateClientId,
  mode,
  updateMode,
  returnImportedData,
}) => {
  const form = useForm();
  const history = useHistory();
  const { data: currentClient } = useContext(UserContext);
  const [countries, setCountries] = useState([]);
  //eslint-disable-next-line
  const [clientIdValue, setClientIdValue] = useState(clientId);

  useEffect(() => {
    getCountries();
    fetchClient(clientIdValue, mode);
    //eslint-disable-next-line
  }, []);

  const fetchClient = async (id, type) => {
    try {
      if (id === undefined || id === null) return;
      const response = await http({ url: `/clients/client/${id}` });

      updateClientId(response?.user?._id);

      form.setValue('ragioneSociale', response.ragioneSociale);
      form.setValue('companyType', response.companyType);
      form.setValue('fiscalCountry', response.fiscalCountry);
      form.setValue('partitaIva', response.partitaIva);
      form.setValue('email', response.email);
      form.setValue('phone', response.phone);
      form.setValue('pec', response.pec);
      form.setValue('fiscalCode', response.fiscalCode);
      form.setValue('sdiUniqueCode', response.sdiUniqueCode);
      if (response.fundingDate)
        form.setValue('fundingDate', new Date(response.fundingDate).toISOString().split('T')[0]);
      form.setValue('businessActive', response.businessActive);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const getCountries = async () => {
    try {
      setCountries(await fetchCountries());
    } catch (err) {
      console.error(err);
    }
  };

  //eslint-disable-next-line
  const checkPIVA = async (e) => {
    e.preventDefault();

    if (!form.getValues('partitaIvaCheck'))
      return toast.error('Inserisci una Partita IVA', {
        icon: '❌',
        duration: 3000,
      });
    const toastId = toast.loading('Stiamo verificando Partita IVA...', {
      duration: 4000,
    });
    try {
      const response = await http({
        url: `/clients/client/partitaIva/${form.getValues('partitaIvaCheck')}`,
      });
      if (response) {
        toast.remove(toastId);
        toast.success('Partita IVA valida', {
          icon: '✅',
          duration: 3000,
        });
        returnImportedData(response);
        updateMode('import');
      }
    } catch (err) {
      console.error(err);
      toast.remove(toastId);
      toast.error(err?.message || 'Errore', {
        icon: '❌',
        duration: 3000,
      });
    }
  };

  const onSubmitCompany = async (data) => {
    try {
      try {
        if (data.phone) {
          const checkPhone = data.phone.match(
            // eslint-disable-next-line
            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
          );

          if (!checkPhone)
            return toast.error('Inserisci un numero di telefono valido', {
              icon: '❌',
              duration: 3000,
            });
        }

        if (clientIdValue === undefined || clientIdValue === null) {
          const response = await http({
            method: 'POST',
            url: '/clients/client',
            form: { ...data },
          });
          if (response) {
            if (response?.client?._id) {
              history.push(`/admin/clienti/anagrafica/${response?.client._id}`);
            }
          }
        } else {
          await http({
            method: 'PUT',
            url: `/clients/client/${clientIdValue}`,
            form: { ...data, client: currentClient.client._id },
          });
        }
      } catch (err) {
        console.error(err);
        toast.error(err?.error || 'Errore');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Errore');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmitCompany)}>
      <div className="mt-2">
        {/* <div className="flex flex-wrap sm:flex-nowrap">
          <div className="mr-3 w-64">
            <FormLabel>Importa Partita IVA Italiana</FormLabel>
            <TextField
              form={form}
              name="partitaIvaCheck"
              type="string"
              placeholder="Partita IVA"
              // validation={{
              //   required: { value: true, message: 'Partita IVA' },
              // }}
            />
          </div>
          <div className="mr-3 w-40">
            <FormLabel>&nbsp;</FormLabel>
            <Button
              btnStyle="inFormStyle"
              onClick={(e) => {
                checkPIVA(e);
              }}
            >
              Importa
            </Button>
          </div>
        </div> */}

        {/* <div className="flex grid-cols-3 my-5">
          <hr className="my-3 w-full border-gray-800 border-1 mr-3" />
          <div> oppure </div>
          <hr className="my-3 w-full border-gray-800 border-1 ml-3 mr-3" />
        </div> */}

        <div className="h-96">
          <div className="flex flex-wrap sm:flex-nowrap">
            <div className="mr-3 w-96">
              <FormLabel>Ragione Sociale</FormLabel>
              <TextField
                form={form}
                name="ragioneSociale"
                type="string"
                placeholder="Ragione Sociale"
                validation={{
                  required: { value: true, message: 'Inserisci Ragione Sociale' },
                }}
              />
            </div>
            <div className="mr-3 w-96">
              <FormLabel>Tipo Società</FormLabel>
              <SelectField
                form={form}
                name="companyType"
                type="string"
                placeholder="Tipo Società"
                options={[
                  { value: 'srl', label: 'SRL (Società a responsabilità limitata)' },
                  {
                    value: 'srls',
                    label: 'SRLS (Società a responsabilita limitata semplificata)',
                  },
                  { value: 'spa', label: 'SPA (Società per azioni)' },
                  { value: 'sapa', label: 'SAPA (Società con accomandita per azioni)' },
                  { value: 'ss', label: 'SS (Società semplice)' },
                  { value: 'snc', label: 'SNC (Società a nome collettivo)' },
                  { value: 'sas', label: 'SAS (Società ad accomandita semplice)' },
                  { value: 'piva', label: 'Partita IVA' },
                ]}
              />
            </div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap">
            <div className="mr-3 w-96">
              <FormLabel>Nazione Partita IVA</FormLabel>
              <SelectField
                form={form}
                name="fiscalCountry"
                type="string"
                placeholder="Nazione Partita IVA"
                options={countries}
                // validation={{
                //   required: { value: true, message: 'Nazione Partita IVA richiesta' },
                // }}
              />
            </div>
            <div className="mr-3 w-96">
              <FormLabel>Partita IVA</FormLabel>
              <TextField
                form={form}
                name="partitaIva"
                type="string"
                placeholder="Partita IVA"
                validation={{
                  required: { value: true, message: 'Inserisci Partita IVA' },
                }}
              />
            </div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap">
            <div className="mr-3 w-96">
              <FormLabel>Codice Fiscale</FormLabel>
              <TextField form={form} name="fiscalCode" type="string" placeholder="Codice Fiscale" />
            </div>
            <div className="mr-3 w-96">
              <FormLabel>Codice Univoco SDI</FormLabel>
              <TextField
                form={form}
                name="sdiUniqueCode"
                type="string"
                placeholder="Codice Univoco SDI"
              />
            </div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap">
            <div className="mr-3 w-96">
              <FormLabel>Data Fondazione Azienda</FormLabel>
              <TextField
                form={form}
                name="fundingDate"
                type="date"
                placeholder="Data Fondazione"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="mr-3 w-96">
              <FormLabel>Stato Attività</FormLabel>
              <SelectField
                form={form}
                name="businessActive"
                type="string"
                placeholder="Stato Attività"
                options={[
                  { value: true, label: 'Attiva' },
                  { value: false, label: 'Chiusa' },
                ]}
              />
            </div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap">
            <div className="mr-3 w-64">
              <FormLabel>Email</FormLabel>
              <TextField
                form={form}
                name="email"
                type="email"
                placeholder="Email"
                validation={{
                  required: { value: true, message: 'Inserisci Email' },
                }}
              />
            </div>
            <div className="mr-3 w-64">
              <FormLabel>PEC</FormLabel>
              <TextField form={form} name="pec" type="email" placeholder="PEC" />
            </div>
            <div className="mr-3 w-48">
              <FormLabel>Telefono</FormLabel>
              <TextField form={form} name="phone" type="tel" placeholder="Telefono" />
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <Button btnStyle="inFormStyle" className="py-1">
            Avanti
          </Button>
        </div>
      </div>
    </form>
  );
};

export default NewClientData;
