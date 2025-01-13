import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useHistory } from 'react-router-dom';
import { TextField } from '../components/Form/TextField';
import { http } from '../utils/Utils';
import EmptyPage from './EmptyPage';
import Stepper from '../components/UI/Stepper';
import Button from '../components/UI/buttons/Button';
import Documents from '../components/Documents/Documents';
import { hasMandatoryDocuments } from '../utils/Documents';
import { provinces } from '../utils/Addresses';
import { SelectField } from '../components/Form/SelectField';
import { UserContext } from '../store/UserContext';

const Signup1 = () => {
  const history = useHistory();
  const form = useForm();
  const [client, setClient] = useState(null);
  const [partnerCodes, setPartnerCodes] = useState([]); //eslint-disable-line
  const { data: userData } = useContext(UserContext);

  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    fetchPartnerCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userData?.client) {
      refillForm(userData?.client);
    }
  }, [userData]); //eslint-disable-line

  const refillForm = (client) => {
    form.setValue('contractingUser', client.contractingUser);
    form.setValue('address', client.address);
    form.setValue('ragioneSociale', client.ragioneSociale);
    form.setValue('partitaIva', client.partitaIva);
    form.setValue('sdiUniqueCode', client.sdiUniqueCode);
    form.setValue('regimeFiscale', client.regimeFiscale);
    form.setValue('email', client.email);
    form.setValue('phone', client.phone);
    form.setValue('pec', client.pec);

    fetchClient();
  };

  const fetchPartnerCodes = async () => {
    try {
      const response = await http({ url: '/partnerCode/codes' });
      setPartnerCodes(response.partnerCodes);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onSubmit = async (data) => {
    if (!client) {
      data.documents = [
        {
          label: 'contract',
          name: 'Documenti identità',
          description: 'Documenti Identità del Rappresentante Legale',
        },
        {
          label: 'contract',
          name: 'Visura camerale',
          description: "Visura camerale dell'azienda",
        },
      ];
    }

    try {
      let result = null;

      const theClient = userData?.client || client || null;

      if (!theClient) {
        result = await http({
          method: 'POST',
          url: `/clients/client`,
          form: data,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
      } else {
        result = await http({
          method: 'PUT',
          url: `/clients/client/${theClient?._id}`,
          form: data,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
      }

      if (data.partnerCode) {
        await http({
          method: 'PUT',
          url: `/partnerCode/use/${data.partnerCode}`,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
      }

      if (result) {
        if (client) {
          checkDocsContinue();
        } else {
          fetchClient();
        }
      } else {
        toast.error('Errore durante la registrazione');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.error || 'Errore durante la registrazione');
    }
  };

  const pIvaContinue = form.watch('partitaIvaCheck') ?? '';

  const fetchClient = async () => {
    const response = await http({
      method: 'GET',
      url: `/clients/client`,
    });

    setClient(response);
  };

  // useEffect(() => fetchClient(), []);

  const importPIva = async (pIva) => {
    const toastId = toast.loading('Stiamo verificando la Partita IVA...', {
      duration: 4000,
    });

    try {
      const response = await http({
        url: `/userCompanies/partitaIva/${pIva}`,
      });

      if (response) {
        toast.success('Partita IVA valida', {
          icon: '✅',
        });

        if (response?.data) {
          form.setValue('ragioneSociale', response.data.denominazione);
          form.setValue('address.address', response.data.indirizzo);
          form.setValue('address.city', response.data.comune);
          form.setValue('sdiUniqueCode', response.data.codice_destinatario);
          form.setValue('address.zipCode', response.data.cap);
          form.setValue('partitaIva', response.data.piva);
        }
      } else {
        throw new Error('P.IVA non valida');
      }
    } catch (e) {
      toast.error(e?.message || 'P.IVA non valida', {
        icon: '❌',
        duration: 3000,
      });
    }

    toast.remove(toastId);
  };

  const checkDocsContinue = () => {
    if (hasMandatoryDocuments(client, 'client')) {
      toast.error('Prima di continuare, carica i documenti richiesti');
      return;
    } else {
      history.push('/signup/2');
    }
  };

  return (
    <EmptyPage className="py-12 px-6" headerProps={{ hideNav: true }}>
      <div className="flex flex-col text-black">
        <h1 className="h2 text-center text-gray-600 mb-4">Benvenuto in Movolab!</h1>

        <div className="flex justify-center">
          <Stepper
            steps={[
              { content: '1' },
              { content: '2', isCurrent: true },
              { content: '3' },
              { content: '4' },
            ]}
          ></Stepper>
        </div>

        <h2 className="py-6 text-center">
          <div className="text-gray-400">
            Inserisci i dati della tua azienda
          </div>
          <div className="text-sm mt-1">
            <span className="text-red-600 ml-1">*</span> campo obbligatorio
          </div>
        </h2>

        <form onSubmit={form.handleSubmit(onSubmit)} id="signupForm1">
          <fieldset disabled={form.formState.isSubmitting} className="max-w-4xl mx-auto">
            {!client && !userData?.client ? (
              <div className="bg-white my-3 p-6 rounded-2xl shadow block md:grid md:grid-cols-2 gap-3 gap-x-5">
                <TextField
                  labelColor="text-gray-700"
                  className="flex-1"
                  form={form}
                  name="partitaIvaCheck"
                  type="text"
                  label="Importa da Partita Iva"
                  placeholder="Partita Iva"
                />

                <div>
                  <label className="block text-sm mt-2">&nbsp;</label>
                  <Button
                    btnStyle="inFormStyle"
                    disabled={pIvaContinue.length <= 10}
                    onClick={(e) => {
                      e.preventDefault();
                      importPIva(pIvaContinue);
                    }}
                  >
                    Importa dati
                  </Button>
                </div>
              </div>
            ) : null}
            <div className="bg-white my-3 p-6 rounded-2xl shadow block md:grid md:grid-cols-2 gap-3 gap-x-5">
              <h3 className="col-span-2 text-lg font-semibold">Anagrafica contraente</h3>
              <TextField
                labelColor="text-gray-700"
                form={form}
                name="contractingUser.firstName"
                type="text"
                label="Nome Contraente"
                placeholder="Nome Contraente"
                validation={{
                  required: { value: true, message: 'Nome Contraente obbligatorio' },
                  pattern: {
                    value:
                      /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžæÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                    message: 'Inserire un nome valido',
                  },
                  maxLength: {
                    value: 100,
                    message: 'Campo troppo lungo',
                  },
                }}
                autofocus
              />
              <TextField
                labelColor="text-gray-700"
                form={form}
                name="contractingUser.lastName"
                type="text"
                label="Cognome Contraente"
                placeholder="Cognome Contraente"
                validation={{
                  required: { value: true, message: 'Cognome Contraente obbligatorio' },
                  pattern: {
                    value:
                      /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžæÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                    message: 'Inserire un cognome valido',
                  },
                  maxLength: {
                    value: 100,
                    message: 'Campo troppo lungo',
                  },
                }}
              />
              <TextField
                labelColor="text-gray-700"
                form={form}
                name="contractingUser.fiscalCode"
                type="text"
                label="Codice fiscale Contraente"
                placeholder="Codice fiscale Contraente"
                validation={{
                  required: { value: true, message: 'Codice fiscale Contraente obbligatorio' },
                  pattern: {
                    value: /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i,
                    message: 'Inserire un codice fiscale valido',
                  },
                }}
              />
              <TextField
                labelColor="text-gray-700"
                form={form}
                name="partnerCode"
                type="text"
                label="Codice partner"
                placeholder="Codice partner"
              />
            </div>
            <div className="bg-white mb-3 p-6 rounded-2xl shadow block md:grid md:grid-cols-2 gap-3 gap-x-5">
              <h3 className="col-span-2 text-lg font-semibold">Informazioni azienda</h3>
              <TextField
                labelColor="text-gray-700"
                form={form}
                name="ragioneSociale"
                type="text"
                label="Ragione Sociale"
                placeholder="Ragione Sociale"
                validation={{
                  required: { value: true, message: 'Ragione Sociale obbligatoria' },
                  /* pattern: {
                        value:
                          /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžæÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                        message: 'Campo non valido',
                      }, */
                  maxLength: {
                    value: 100,
                    message: 'Campo troppo lungo',
                  },
                }}
              />
              {(client || userData?.client) ? <TextField
                labelColor="text-gray-700"
                form={form}
                name="partitaIva"
                label="Partita Iva"
                disabled={true}
                title="Non è più possibile cambiare la Partita Iva"
                inputClassName="cursor-not-allowed"
              /> : <TextField
                labelColor="text-gray-700"
                form={form}
                name="partitaIva"
                type="text"
                label="Partita Iva"
                placeholder="Partita Iva"
                validation={{
                  required: { value: true, message: 'Partita Iva obbligatoria' },
                  pattern: {
                    value: /^[0-9]{11}$/i,
                    message: 'Inserire una partita IVA (senza prefisso)',
                  },
                }}
              />}
              <TextField
                labelColor="text-gray-700"
                form={form}
                name="address.address"
                type="text"
                label="Indirizzo Sede legale"
                placeholder="Indirizzo Sede legale"
                className="col-span-2"
                validation={{
                  required: { value: true, message: 'Indirizzo Sede obbligatorio' },
                  pattern: {
                    value:
                      /^[a-zA-Z0-9àáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžæÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,,.'-]+$/u,
                    message: 'Campo non valido',
                  },
                  maxLength: {
                    value: 100,
                    message: 'Campo troppo lungo',
                  },
                }}
              />
              <SelectField
                form={form}
                name="address.province"
                type="string"
                label="Provincia sede legale"
                placeholder="Provincia"
                // onChangeFunction={() => getCompanyCities(form.getValues('province'))}
                options={provinces}
                validation={{
                  required: { value: true, message: 'Provincia obbligatoria' },
                }}
              />
              <div className="flex gap-2">
                <TextField
                  labelColor="text-gray-700"
                  form={form}
                  name="address.city"
                  type="text"
                  label="Città sede legale"
                  placeholder="Città"
                  className="flex-1"
                  validation={{
                    required: { value: true, message: 'Città obbligatoria' },
                    pattern: {
                      value:
                        /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžæÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                      message: 'Campo non valido',
                    },
                    maxLength: {
                      value: 50,
                      message: 'Campo troppo lungo',
                    },
                  }}
                />
                <TextField
                  labelColor="text-gray-700"
                  form={form}
                  name="address.zipCode"
                  type="text"
                  label="CAP"
                  placeholder="CAP Sede"
                  className="w-1/3"
                  validation={{
                    required: { value: true, message: 'CAP Sede obbligatorio' },
                    pattern: {
                      value: /^[0-9]{5}$/,
                      message: 'Campo non valido',
                    },
                    maxLength: {
                      value: 6,
                      message: 'Campo troppo lungo',
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-white mb-3 p-6 rounded-2xl shadow block md:grid md:grid-cols-2 gap-3 gap-x-5">
              <h3 className="col-span-2 text-lg font-semibold">Contatti</h3>
              <TextField
                labelColor="text-gray-700"
                form={form}
                name="email"
                type="email"
                label="Email aziendale"
                placeholder="Email aziendale"
                validation={{
                  required: { value: true, message: 'Email obbligatoria' },
                  pattern: {
                    value: /^[\w\-\.]*[\w\.]\@[\w\.]*[\w\-\.]+[\w\-]+[\w]\.+[\w]+[\w $]/, //eslint-disable-line
                    message: 'Email non valida',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Campo troppo lungo',
                  },
                }}
              />{' '}
              <TextField
                labelColor="text-gray-700"
                form={form}
                name="pec"
                type="email"
                label="PEC"
                placeholder="PEC"
                validation={{
                  required: { value: true, message: 'PEC obbligatoria' },
                  pattern: {
                    value: /^[\w\-\.]*[\w\.]\@[\w\.]*[\w\-\.]+[\w\-]+[\w]\.+[\w]+[\w $]/, //eslint-disable-line
                    message: 'Email PEC non valida',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Campo troppo lungo',
                  },
                }}
              />{' '}
              <TextField
                labelColor="text-gray-700"
                form={form}
                name="phone"
                type="tel"
                label="Numero di telefono"
                placeholder="Telefono referente azienda"
                validation={{
                  required: { value: true, message: 'Numero di telefono obbligatorio' },
                  pattern: {
                    value: /^[0-9]*$/i,
                    message: 'Campo non valido',
                  },
                  maxLength: {
                    value: 12,
                    message: 'Campo troppo lungo',
                  },
                }}
              />
              <TextField
                labelColor="text-gray-700"
                form={form}
                name="sdiUniqueCode"
                type="text"
                label="Codice destinatario"
                placeholder="Codice destinatario SDI"
                validation={{
                  required: { value: true, message: 'Codice destinatario obbligatorio' },
                  pattern: {
                    value: /^[a-z0-9]*$/i,
                    message: 'Campo non valido',
                  },
                  maxLength: {
                    value: 10,
                    message: 'Campo troppo lungo',
                  },
                }}
              />
            </div>
          </fieldset>
        </form>

        <div className="max-w-4xl mx-auto w-full">
          {client ? (
            <Documents
              resource={client}
              resourceType="client"
              onUpdate={fetchClient}
              className="!shadow mx-0 my-0 px-6 py-5"
              noCollapsible
              hideNewDocBtn
              modalOnlyUpload
            />
          ) : null}
          <div className="text-center mt-4">
            <Button
              btnStyle="darkGray"
              className="w-full md:w-auto md:px-10 py-3 !text-base"
              form="signupForm1"
            >
              Continua
            </Button>
          </div>
        </div>
      </div>
    </EmptyPage>
  );
};

export default Signup1;
