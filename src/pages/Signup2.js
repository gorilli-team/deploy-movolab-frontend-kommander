import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useHistory } from 'react-router-dom';
import { TextField } from '../components/Form/TextField';
import { SelectField } from '../components/Form/SelectField';
import { http } from '../utils/Utils';
import EmptyPage from './EmptyPage';
import Stepper from '../components/UI/Stepper';
import Button from '../components/UI/buttons/Button';
import { CheckboxField } from '../components/Form/CheckboxField';
import { convertPrice } from '../utils/Prices';
import { hasMandatoryDocuments } from '../utils/Documents';
import Cookies from 'universal-cookie';

const Signup2 = () => {
  const history = useHistory();
  const form = useForm();
  const cookies = new Cookies();
  const packValue = cookies.get('pack');

  const [packs, setPacks] = useState([]);
  const [client, setClient] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);
  // const [defaultPackId, setDefaultPackId] = useState(null);

  useEffect(() => {
    fetchClientOrGoBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (client) {
      if (client?.license) {
        form.setValue('license', client.license);
      }

      if (client?.currentPack) {
        setSelectedPack(client?.currentPack._id);
      }
    }
  }, [client]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchPacks = async () => {
      if (packValue) {
        const decodedString = decodeURIComponent(packValue);
        const response = await http({ url: `/clientPayments/packs/byName/${decodedString}` });
        setPacks(response);
      } else {
        const response = await http({ url: '/clientPayments/packs' });
        setPacks(response.packs);
      }
    };

    fetchPacks();
  }, [packValue]);

  const selectedLicense = form.watch('license.licenseOwner');

  let filteredPacks;
  if (packValue) {
    filteredPacks = packs.filter(
      (pack) => pack.licenseType === (selectedLicense || '') && pack.status === 'active',
    );
  } else {
    filteredPacks = packs.filter(
      (pack) =>
        pack.licenseType === (selectedLicense || '') && pack.status === 'active' && pack.visible,
    );
  }

  const nextBtnDisabled = !(selectedLicense && selectedPack);

  const goBack = (e = null) => {
    if (e) {
      e.preventDefault();
    }

    history.push('/signup/1');
  };

  const fetchClientOrGoBack = async () => {
    const theClient = await http({
      method: 'GET',
      url: `/clients/client`,
    });

    if (!theClient) return;

    setClient(theClient);

    if (hasMandatoryDocuments(theClient, 'client')) {
      toast.error('Prima di continuare, carica i documenti richiesti');
      goBack();
    }
  };

  const findPackContract = (pack) => pack.documents.find((doc) => doc.label === 'contract');

  const onSubmit = async (data) => {
    try {
      const client = await http({
        method: 'PUT',
        url: `/clients/client`,
        form: data,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (client?.currentPack !== selectedPack) {
        const response = await http({
          url: `/clients/client/${client._id}/pack`,
          method: 'PUT',
          form: {
            packId: selectedPack,
          },
        });

        if (!response) {
          return toast.error('Errore durante la registrazione');
        }
      }

      const thisPack = packs?.find((p) => p._id === selectedPack);
      const packFees =
        thisPack?.fee +
        thisPack?.variablePayments?.extraRentalLocationFee +
        thisPack?.variablePayments?.extraVehicleFee +
        thisPack?.variablePayments?.extraMonthlyRentFee +
        thisPack?.variablePayments?.extraComodatoFee +
        thisPack?.variablePayments?.extraMNPFee;

      // Salto la sezione 3 se non c'è da setuppare il pagamento
      if (packFees === 0) {
        // Imposto a sepa subscriptionPaymentMethod, che viene usata come
        //   variabile di controllo al login
        http({
          url: `/clients/client/${client?._id}`,
          method: 'PUT',
          form: {
            subscriptionPaymentMethod: 'sepa',
          },
        });

        return history.push('/dashboard');
      }

      history.push('/signup/3');
    } catch (err) {
      console.error(err);
      toast.error(err.error || 'Errore durante la registrazione');
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
              { content: '2' },
              { content: '3', isCurrent: true },
              { content: '4' },
            ]}
          ></Stepper>
        </div>

        <h2 className="py-6 text-center text-gray-400">
          Quale licenza vuoi usare per questo account?
        </h2>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset
            className="flex flex-wrap md:flex-nowrap flex-col max-w-4xl mx-auto"
            disabled={form.formState.isSubmitting}
          >
            <div className="flex gap-6 justify-center">
              <div className="w-full md:w-1/2">
                <SelectField
                  form={form}
                  name="license.licenseOwner"
                  label="Tipo Licenza"
                  placeholder="Seleziona Tipo Licenza"
                  options={[
                    {
                      label:
                        'Licenza Movolab - non possiedi licenza di noleggio o vuoi usare licenza Movolab',
                      value: 'movolab',
                    },
                    {
                      label:
                        'Licenza personale - possiedi licenza di noleggio e vuoi usarla per effettuare noleggi su Movolab',
                      value: 'client',
                    },
                  ]}
                  validation={{
                    required: { value: true, message: 'Distanza' },
                  }}
                  onSelect={(e) => {
                    console.error(e);
                  }}
                  autofocus
                />
              </div>
              {form.getValues('license.licenseOwner') === 'client' && (
                <div className="w-full md:w-1/2">
                  <TextField
                    labelColor="text-gray-700"
                    form={form}
                    name="license.licenseNumber"
                    type="string"
                    label="Numero Licenza"
                    placeholder="Numero Licenza"
                    validation={{
                      required: {
                        value: form.getValues('license.licenseOwner') === 'movolab',
                        message: 'Numero Licenza obbligatoria',
                      },
                    }}
                  />
                </div>
              )}
            </div>
            <div
              className={`grid grid-cols-1 ${
                filteredPacks.length > 1 ? 'md:grid-cols-2' : 'md:w-1/2 md:mx-auto'
              } gap-3 gap-x-6 mt-4`}
            >
              {selectedLicense && filteredPacks.length === 0 ? (
                <span className="text-center italic">Nessun pack disponibile</span>
              ) : null}

              {filteredPacks.map((pack) => (
                <div
                  className={`flex flex-col overflow-hidden rounded-2xl text-gray-800 shadow-md cursor-pointer ${
                    selectedPack === pack._id
                      ? ''
                      : selectedPack !== null
                      ? 'group opacity-80 hover:opacity-90'
                      : 'group hover:opacity-90'
                  }`}
                  onClick={() => setSelectedPack(pack._id)}
                  key={pack._id}
                >
                  <div
                    className={`flex items-center p-3 px-6 ${
                      selectedLicense === 'movolab'
                        ? 'bg-customblue group-hover:bg-customblue-lighter group-active:bg-customblue-darker'
                        : 'bg-gray-600 group-hover:bg-gray-700 group-active:bg-gray-600'
                    }`}
                    style={{ backgroundColor: pack?.packColor || null }}
                  >
                    <h3 className="flex-1 text-xl text-white font-bold">{pack.name}</h3>
                    <div className="relative text-white">
                      <h4 className="text-2xl font-bold">
                        {convertPrice(pack.paymentPeriod === 'monthly' ? pack.fee : pack.fee / 12)}
                      </h4>
                      <div className="text-xs absolute right-[-0.25rem] bottom-[-0.65rem]">
                        {/*pack.paymentPeriod === 'monthly' ? 'Mese' : 'Anno'*/ 'mese'} + Iva
                      </div>
                    </div>
                  </div>
                  <div
                    className="bg-gray-200 p-3 flex-1 group-hover:bg-gray-100"
                    style={{ backgroundColor: pack?.packColor || null }}
                  >
                    <div className="bg-white p-3 rounded-lg">
                      <div className="mb-4">
                        <strong>
                          {pack.params?.includedRentalLocations}{' '}
                          {pack.params?.includedRentalLocations === 1
                            ? 'Punto Nolo incluso'
                            : 'Punti Nolo inclusi'}
                        </strong>
                        <span className="text-xs">
                          &nbsp;|&nbsp;
                          {convertPrice(pack.variablePayments?.extraRentalLocationFee)} mese +iva
                          per punto nolo aggiuntivo
                        </span>
                      </div>
                      <div className="mb-4">
                        <strong>
                          {pack.params?.includedVehicles}{' '}
                          {pack.params?.includedVehicles === 1
                            ? 'Veicolo incluso'
                            : 'Veicoli inclusi'}
                        </strong>
                        <span className="text-xs">
                          &nbsp;|&nbsp; {convertPrice(pack.variablePayments?.extraVehicleFee)} mese
                          +iva per veicolo aggiuntivo
                        </span>
                      </div>
                      <div>
                        <strong>Movo inclusi</strong>

                        <div className="text-sm">
                          {pack.params?.includedMonthlyRents >= 10000 ? (
                            <>
                              <strong className="font-semibold">Noleggi sempre inclusi</strong>
                            </>
                          ) : (
                            <>
                              <strong className="font-semibold">
                                {pack.params?.includedMonthlyRents} noleggi al mese
                              </strong>
                              &nbsp;|&nbsp;
                              <span className="text-xs leading-1">
                                {convertPrice(pack.variablePayments?.extraMonthlyRentFee)} per
                                noleggio aggiuntivo
                              </span>
                            </>
                          )}
                          {form.getValues('license.licenseOwner') === 'movolab' && (
                            <>
                              <br />
                              <span className="text-xs leading-1">
                                NB: ottieni almeno l’80% sul fatturato Movolab da noleggi
                              </span>
                            </>
                          )}
                        </div>

                        <div className="text-sm mt-2">
                          {pack.params?.includedComodati >= 10000 ? (
                            <>
                              <strong className="font-semibold">Comodati sempre inclusi</strong>
                            </>
                          ) : (
                            <>
                              <strong className="font-semibold">
                                {pack.params?.includedComodati} comodati al mese
                              </strong>
                              &nbsp;|&nbsp;
                              <span className="text-xs leading-1">
                                {convertPrice(pack.variablePayments?.extraComodatoFee)} per comodato
                                aggiuntivo
                              </span>
                            </>
                          )}
                        </div>

                        <div className="text-sm mt-2">
                          {pack.params?.includedMNP >= 10000 ? (
                            <>
                              <strong className="font-semibold">
                                Movimenti non produttivi sempre inclusi
                              </strong>
                            </>
                          ) : (
                            <>
                              <strong className="font-semibold">
                                {pack.params?.includedMNP} mov. non produttivi al mese
                              </strong>
                              &nbsp;|&nbsp;
                              <span className="text-xs leading-1">
                                {convertPrice(pack.variablePayments?.extraMNPFee)} per MNP
                                aggiuntivo
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex bg-white p-3 mt-3 rounded-lg">
                      <ul className="text-sm list-image-[url(/check_list.svg)] pl-5 flex-1 pr-3">
                        <li>Gestione amministrativa</li>
                        <li>Gestione multe</li>
                        <li>Assistenza online</li>
                        <li>Manutenzione app</li>
                      </ul>
                      {findPackContract(pack) ? (
                        <div className="border-l px-4 flex items-center text-sky-700 underline">
                          <a href={findPackContract(pack)?.fileUrl}>Scopri di più &raquo;</a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {selectedPack === pack._id ? (
                    <label
                      className={`block cursor-pointer text-center text-sm text-white font-semibold py-3 ${
                        selectedLicense === 'movolab'
                          ? 'bg-customblue group-hover:bg-customblue-lighter group-active:bg-customblue-darker'
                          : 'bg-gray-600 group-hover:bg-gray-700 group-active:bg-gray-600'
                      }`}
                      style={{ backgroundColor: pack?.packColor || null }}
                    >
                      Selezionato
                    </label>
                  ) : null}
                </div>
              ))}
            </div>
            {filteredPacks.length > 0 ? (
              <div className="mt-5">
                <label className="flex gap-2">
                  <CheckboxField
                    form={form}
                    name="termsAndConditions"
                    value={true}
                    validation={{
                      required: {
                        value: true,
                        message: 'Obbligatorio',
                      },
                    }}
                    className="text-xs"
                  />
                  <span>
                    Dichiaro di aver letto e Accetto i{' '}
                    <a
                      className="underline"
                      href={
                        selectedLicense === 'movolab'
                          ? '/pdf/K_Movolab_LicenzaMovolab_24_001.pdf'
                          : '/pdf/K_Movolab_LicenzaPersonale_24_001.pdf'
                      }
                      target="_blank"
                    >
                      Termini e Condizioni
                    </a>{' '}
                    del Contratto con Movolab s.r.l.<span className="text-red-500">*</span>
                  </span>
                </label>
                <label className="flex gap-2">
                  <CheckboxField
                    form={form}
                    name="privacyPolicy"
                    value={true}
                    validation={{
                      required: {
                        value: true,
                        message: 'Obbligatorio',
                      },
                    }}
                    className="text-xs"
                  />
                  <span>
                    Dichiaro di aver letto e Accetto la{' '}
                    <a className="underline" href="/pdf/Privacy-Movolab-srl.pdf" target="_blank">
                      Privacy Policy
                    </a>{' '}
                    di Movolab s.r.l.
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <label className="flex gap-2">
                  <CheckboxField form={form} name="newsAndOffers" className="text-xs" />
                  <span>
                    Sì, voglio ricevere sconti, prodotti in omaggio e offerte speciali da parte di
                    Movolab s.r.l. e suoi Partner
                  </span>
                </label>
              </div>
            ) : null}

            <p className="mt-2 text-sm text-center">
              <span className="text-red-600 ml-1">*</span> campo obbligatorio
            </p>
            <div className="flex flex-col gap-3 mt-3 md:block md:mx-auto md:space-x-3">
              <Button
                btnStyle="gray"
                className="w-full md:w-auto md:px-10 py-3 !text-base"
                onClick={goBack}
              >
                Indietro
              </Button>
              <Button
                btnStyle="darkGray"
                className="w-full md:w-auto md:px-10 py-3 !text-base"
                disabled={nextBtnDisabled}
              >
                Continua
              </Button>
            </div>
          </fieldset>
        </form>
      </div>
    </EmptyPage>
  );
};

export default Signup2;
