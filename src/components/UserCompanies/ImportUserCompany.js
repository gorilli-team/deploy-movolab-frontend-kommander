import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { http } from '../../utils/Utils';
import { UserContext } from '../../store/UserContext';

import { TextField } from '../Form/TextField';
import Button from '../UI/buttons/Button';
import { useHistory } from 'react-router-dom';

import FormLabel from '../UI/FormLabel';

const ImportUserCompany = ({
  userCompanyId,
  importedData,
  returnCompany,
  returnUserCompany,
  closeModal,
}) => {
  const form = useForm();
  const history = useHistory();

  if (returnUserCompany !== undefined) {
  }

  const { data: currentClient } = useContext(UserContext);

  if (importedData) {
    form.setValue('ragioneSociale', importedData.denominazione);
    form.setValue('partitaIva', `IT${importedData.piva}`);
    form.setValue('fiscalCode', importedData.cf);
    form.setValue('fiscalCountry', importedData.cap ? 'Italia' : '');
    form.setValue('verifiedPartitaIva', true);
    form.setValue('address', (importedData.toponimo || '') + ' ' + (importedData.via || ''));
    form.setValue('houseNumber', importedData.civico);
    form.setValue('province', importedData.provincia);
    form.setValue('city', importedData.comune);
    form.setValue('zipCode', importedData.cap);
    form.setValue('fundingDate', new Date(importedData.data_iscrizione));
    form.setValue('sdiCode', importedData.codice_destinatario);
  }

  const importCompany = async (data) => {
    try {
      data = {
        ...data,
        address: {
          lat: importedData?.gps?.coordinates?.[1] || '',
          lng: importedData?.gps?.coordinates?.[0] || '',
          nation: importedData?.cap ? 'Italia' : '',
          address: (importedData?.toponimo || '') + ' ' + (importedData?.via || ''),
          houseNumber: importedData?.civico,
          city: importedData?.comune,
          province: importedData?.provincia,
          zipCode: importedData?.cap,
        },
        fiscalCode: importedData?.cf,
        sdiUniqueCode: importedData?.codice_destinatario,
        fundingDate: new Date(importedData?.data_iscrizione),
        businessActive: importedData?.stato_attivita === 'ATTIVA' ? true : false,
      };

      if (userCompanyId !== null && userCompanyId !== undefined) {
        try {
          const response = await http({
            method: 'PUT',
            url: `/userCompanies/${userCompanyId}`,
            form: { ...data, client: currentClient.client._id },
          });
          toast.success('Azienda aggiornata');
          if (returnUserCompany !== undefined) {
            returnUserCompany(response.userCompany);
            closeModal();
          }
          returnCompany(response);
        } catch (err) {
          console.error(err);
          toast.error(err.message || 'Errore');
        }
      } else {
        try {
          const response = await http({
            method: 'POST',
            url: '/userCompanies',
            form: { ...data, client: currentClient.client._id },
          });
          toast.success('Azienda aggiunta', {
            icon: '🏢',
            duration: 5000,
          });
          if (returnUserCompany !== undefined) {
            returnUserCompany(response.userCompany);
            closeModal();
          } else {
            history.push(`/dashboard/utenti/azienda/${response?.userCompany?._id}`);
          }
        } catch (err) {
          console.error(err);
          toast.error(err.message || 'Errore');
        }
      }
    } catch (err) {
      console.error(err); 
      toast.error(err?.reason?.error || 'Errore');
      returnCompany(data);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(importCompany)}>
        <div className="flex-wrap sm:flex-nowrap gap-x-3">
          <div className="w-full md:w-64">
            <FormLabel>Ragione Sociale</FormLabel>
            <TextField
              form={form}
              name="ragioneSociale"
              type="string"
              placeholder="Ragione Sociale"
              validation={{
                required: { value: true, message: 'Ragione Sociale' },
              }}
            />
          </div>
          <div className="w-full md:w-64">
            <FormLabel>Partita IVA</FormLabel>
            <TextField
              form={form}
              name="partitaIva"
              type="string"
              placeholder="Partita IVA"
              validation={{
                required: { value: true, message: 'Partita IVA' },
              }}
            />
          </div>
        </div>
        <div>
          <div className="flex-wrap sm:flex-nowrap gap-x-3">
            <div className="w-full md:w-64">
              <FormLabel>Nazione</FormLabel>
              <TextField form={form} name="fiscalCountry" type="string" placeholder="Nazione" />
            </div>
            <div className="w-full md:w-64">
              <FormLabel>Codice Fiscale</FormLabel>
              <TextField form={form} name="fiscalCode" type="string" placeholder="Code Fiscale" />
            </div>
            <div className="w-full md:w-64">
              <FormLabel>Codice Univoco SDI</FormLabel>
              <TextField
                form={form}
                name="sdiCode"
                type="string"
                placeholder="Codice Univoco SDI"
              />
            </div>
          </div>
          <div className="flex-wrap sm:flex-nowrap gap-x-3">
            <div className="w-full md:w-96">
              <FormLabel>Indirizzo</FormLabel>
              <TextField form={form} name="address" type="string" placeholder="Indirizzo" />
            </div>
            <div className="w-full md:w-32">
              <FormLabel>N. Civico</FormLabel>
              <TextField form={form} name="houseNumber" type="string" placeholder="N. Civico" />
            </div>
          </div>
          <div className="flex-wrap sm:flex-nowrap gap-x-3">
            <div className="w-full md:w-64">
              <FormLabel>Provincia</FormLabel>
              <TextField form={form} name="province" type="string" placeholder="Provincia" />
            </div>
            <div className="w-full md:w-64">
              <FormLabel>Comune</FormLabel>
              <TextField form={form} name="city" type="string" placeholder={'Comune'} />
            </div>
          </div>
          <div className="flex-wrap sm:flex-nowrap gap-x-3">
            <div className="w-full md:w-64">
              <FormLabel>CAP:</FormLabel>
              <TextField form={form} name="zipCode" type="string" placeholder={'CAP'} />
            </div>
          </div>
        </div>
        <div className="mt-2 gap-2 flex justify-end">
          <Button
            btnStyle="white"
            className="!py-1 text-red-500"
            onClick={(e) => {
              e.preventDefault();
              closeModal();
            }}
          >
            Indietro
          </Button>
          {returnUserCompany !== undefined ? (
            <Button btnStyle="white" className="!py-1">
              Aggiungi
            </Button>
          ) : (
            <Button btnStyle="white" className="!py-1">
              Importa Dati Azienda
            </Button>
          )}
        </div>
    </form>
  );
};

export default ImportUserCompany;
