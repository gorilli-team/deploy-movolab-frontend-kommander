import React, { useContext, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import AWS from 'aws-sdk';
import toast from 'react-hot-toast';
import SettingsPage from '../../components/Settings/SettingsPage';
import { http } from '../../utils/Utils';
import { CLIENT_ROLE_ADMIN } from '../../utils/Utils';
import { TextField } from '../../components/Form/TextField';
import { TextareaField } from '../../components/Form/TextareaField';
import { SelectField } from '../../components/Form/SelectField';
import FormLabel from '../../components/UI/FormLabel';
import ElementLabel from '../../components/UI/ElementLabel';
import { UserContext } from '../../store/UserContext';
import CardsHeader from '../../components/UI/CardsHeader';
import WhiteBox from '../../components/UI/WhiteBox';
import TableHeaderTab from '../../components/UI/TableHeaderTab';
import ColorPicker from '../../components/Form/ColorPicker';
import Documents from '../../components/Documents/Documents';
import { DefTermsAndConditionsCol1, DefTermsAndConditionsCol2 } from '../../utils/FinePrints';
import { getDocLabel } from '../../utils/Documents';
import { convertPrice } from '../../utils/Prices';
import { FaUpload } from 'react-icons/fa6';
import { provinces } from '../../utils/Addresses';
import moment from 'moment';
import { FaInfoCircle } from 'react-icons/fa';

const mapPeriod = (period) => {
  switch (period) {
    case 'monthly':
      return 'Mensile';
    case 'quarterly':
      return 'Trimestrale';
    case 'biannual':
      return 'Semestrale';
    case 'yearly':
      return 'Annuale';
    default:
      return '';
  }
};

const regimeFiscaleOptions = [
  { value: 'RF01', label: 'RF01 - Ordinario' },
  {
    value: 'RF02',
    label: 'RF02 - Contribuenti minimi (art.1, c.96-117, L. 244/07',
  },
  {
    value: 'RF04',
    label: 'RF04 - Agricoultura e attività connesse e pesca (artt.34 e 34-bis, DPR 633/72',
  },
  {
    value: 'RF05',
    label: 'RF05 - Vendita sali e tabacchi (art.74, c.1, DPR 633/72',
  },
  {
    value: 'RF06',
    label: 'RF06 - Commercio fiammiferi (art.74, c.1, DPR 633/72',
  },
  {
    value: 'RF07',
    label: 'RF07 - Editoria (art.74, c.1, DPR 633/72',
  },
  {
    value: 'RF08',
    label: 'RF08 - Gestione servizi telefonia pubblica (art.74, c.1, DPR 633/72',
  },
  {
    value: 'RF09',
    label: 'RF09 - Rivendita documenti di trasporto pubblico e di sosta (art.74, c.1, DPR 633/72',
  },
  {
    value: 'RF10',
    label:
      'RF10 - Intrattenimenti, giochi e altre attività di cui all atariffa allegata al DPR 640/72 (art.74, c.6, DPR 633/72',
  },
  {
    value: 'RF11',
    label: 'RF11 - Agenzie viaggi e turismo (art.74-ter, DPR 633/72',
  },
  {
    value: 'RF12',
    label: 'RF12 - Agriturismo (art.5, c.2 L. 413/91',
  },
  {
    value: 'RF13',
    label: 'RF13 - Vendite a domicilio (art.25-bis, c.6, DPR 600/73',
  },
  {
    value: 'RF14',
    label:
      'RF14 - Rivendita beni usati, oggetti d arte, d antiquariato o da collezione (art.36, DL 41/95',
  },
  {
    value: 'RF15',
    label:
      'RF15 - Agenzie di vendite all asta di oggetti d arte, antiquariato o da collezione (art.40-bis, DL 41/95',
  },
  {
    value: 'RF16',
    label: 'RF16 - IVA per cassa P.A. (art.6, c.5, DPR 633/72',
  },
  {
    value: 'RF17',
    label: 'RF17 - IVA per cassa (art. 32-bis, DL 83/2012',
  },
  {
    value: 'RF18',
    label: 'RF18 - Altro',
  },
  {
    value: 'RF19',
    label: 'RF19 - Regime forfettario (art.1, c.54-89, L. 190/2014 )',
  },
];

const availableCustomisations = [
  {
    key: 'headerColor',
    label: 'Colore header',
    type: 'color',
  },
  {
    key: 'headerTextColor',
    label: 'Colore testo header',
    type: 'color',
  },
  {
    key: 'navbarColor',
    label: 'Colore navbar',
    type: 'color',
  },
  {
    key: 'navbarFgColor',
    label: 'Colore testo navbar',
    type: 'color',
  },
  {
    key: 'settingsNavColor',
    label: 'Colore navbar impostazioni',
    type: 'color',
  },
  {
    key: 'settingsNavFgColor',
    label: 'Colore testo navbar impostazioni',
    type: 'color',
  },
];

const ClientInfo = () => {
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: 'eu-west-1',
    signatureVersion: 'v4',
  });

  const form = useForm();

  const [client, setClient] = useState(null);
  const [avatar, setAvatar] = useState(undefined); //eslint-disable-line
  const [imgToUpload, setImgToUpload] = useState('');
  const [uploaded, setUploaded] = useState(false); //eslint-disable-line
  const [uploadingImg, setUploadingImg] = useState(); //eslint-disable-line
  const [showInfobox, setShowInfobox] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [showUpdate, setShowUpdate] = useState(true); //eslint-disable-line
  const [customerInvoiceNumber, setCustomerInvoiceNumber] = useState(''); //eslint-disable-line
  const [fieldToUpdate, setFieldToUpdate] = useState('company-details'); //eslint-disable-line

  const imageUploadElement = useRef();

  const { data: currentClient } = useContext(UserContext);

  let invoicingOptions = []; //eslint-disable-line
  let collectionOptions = []; //eslint-disable-line

  if (
    currentClient?.client?.license.licenseOwner === 'client' &&
    currentClient?.role === CLIENT_ROLE_ADMIN
  ) {
    invoicingOptions = [{ value: 'customer', label: 'Cliente' }];
    collectionOptions = [
      { value: 'customer', label: 'Cliente' },
      { value: 'cash', label: 'Contanti' },
      { value: 'customerAndCash', label: 'Cliente e Contanti' },
    ];
  } else {
    invoicingOptions = [
      { value: 'movolab', label: 'Movolab' },
      { value: 'customer', label: 'Cliente' },
    ];
    collectionOptions = [
      { value: 'movolab', label: 'Movolab' },
      { value: 'customer', label: 'Cliente' },
      { value: 'cash', label: 'Contanti' },
      { value: 'movolabAndCash', label: 'Movolab e Contanti' },
      { value: 'customerAndCash', label: 'Cliente e Contanti' },
    ];
  }

  useEffect(() => {
    fetchClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClient = async () => {
    try {
      const response = await http({
        method: 'GET',
        url: `/clients/client`,
      });

      form.setValue('ragioneSociale', response.ragioneSociale);
      form.setValue('partitaIva', response.partitaIva);
      form.setValue('sdiUniqueCode', response.sdiUniqueCode);
      form.setValue('regimeFiscale', response.regimeFiscale);
      form.setValue('phone', response.phone);
      form.setValue('email', response.email);
      form.setValue('pec', response.pec);
      form.setValue('invoicingType', response.invoicingType);
      form.setValue('externalInvoicingConfig.number', response.externalInvoicingConfig?.number);
      form.setValue('externalInvoicingConfig.year', response.externalInvoicingConfig?.year);
      form.setValue('externalInvoicingConfig.section', response.externalInvoicingConfig?.section);
      form.setValue('internalInvoicingConfig.number', response.internalInvoicingConfig?.number);
      form.setValue('internalInvoicingConfig.year', response.internalInvoicingConfig?.year);
      form.setValue('internalInvoicingConfig.section', response.internalInvoicingConfig?.section);
      form.setValue('collectionSystem', response.collectionSystem);
      form.setValue('customerCollectionSystem', response.customerCollectionSystem);
      form.setValue('movolabCollectionSystem', response.movolabCollectionSystem);
      form.setValue('subscriptionPaymentMethod', response.subscriptionPaymentMethod);
      form.setValue('iban', response.iban);
      form.setValue('ibanName', response.ibanName);
      form.setValue('ibanAddress', response.ibanAddress);
      form.setValue('ibanCity', response.ibanCity);
      form.setValue('ibanCap', response.ibanCap);
      form.setValue('ibanPec', response.ibanPec);
      form.setValue('address', response.address);
      form.setValue('customTermsAndConditions', response.customTermsAndConditions);
      form.setValue('contractingUser', response.contractingUser);
      form.setValue('partnerCode', response.partnerCode);
      form.setValue('license.licenseOwner', response.license?.licenseOwner);
      form.setValue('license.licenseNumber', response.license?.licenseNumber);

      if (response?.license?.licenseOwner !== 'movolab') {
        form.setValue('termsAndConditionsType', response.termsAndConditionsType ?? 'default');
      } else {
        form.setValue('termsAndConditionsType', 'default');
      }

      //eslint-disable-next-line
      availableCustomisations.map((field) => {
        form.setValue(
          `customisation.${field.key}`,
          response.websiteLayout.find((o) => o.key === field.key)?.value,
        );
      });

      setClient(response);
      generateInvoiceNumber();
      if (response && response.imageUrl) setImageUrl(response.imageUrl);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const generateInvoiceNumber = async () => {
    try {
      const response = await http({
        method: 'POST',
        url: `/invoice/invoiceNumber`,
        form: {
          invoicingType: 'customer',
        },
      });

      setCustomerInvoiceNumber(response.invoiceNumber);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const selectedPack = client?.packHistory?.find((p) => !p?.pack?.endDate)?.pack;

  const onSubmit = async (data) => {
    data.websiteLayout = currentClient?.client?.websiteLayout;
    Object.entries(data.customisation).map(([key, value]) => {
      const layoutKeyIndex = data?.websiteLayout?.findIndex((l) => l.key === key);
      if (layoutKeyIndex !== -1) {
        data.websiteLayout[layoutKeyIndex].value = value;
      } else {
        data.websiteLayout.push({ key, value });
      }
    });

    try {
      if (!client) {
        await http({
          method: 'POST',
          url: `/clients/client`,
          form: data,
        });
        toast.success('Profilo cliente creato');
      } else {
        await http({
          method: 'PUT',
          url: `/clients/client/${client?._id}`,
          form: data,
        });
        toast.success('Profilo cliente aggiornato');
      }
      await fetchClient();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const switchMode = () => {
    setShowUpdate(!showUpdate);
  };

  const imageChangeHandler = async (event) => {
    if (!event.target.files?.length) return;

    setImgToUpload(URL.createObjectURL(event.target.files[0]));
    setAvatar(event.target.files[0]);
    await userImageUploader(event.target.files[0]);
  };

  const userImageUploader = async (avatarFile) => {
    const s3 = new AWS.S3();
    const file = avatarFile;

    if (!file) {
      return;
    }
    const params = {
      Bucket: 'movolab-car-models',
      Key: `USERCOMPANY-${Date.now()}.${file.name}`,
      Body: file,
    };
    setUploadingImg(true);
    const { Location } = await s3.upload(params).promise();
    form.setValue('imageUrl', Location);
    setUploadingImg(false);
    setUploaded(true);

    await http({
      method: 'PUT',
      url: `/clients/client/${client?._id}`,
      form: form.getValues(),
    });
    fetchClient();
    toast.success('Immagine aggiornata con successo');
  };

  const handleImageUploadClick = () => {
    if (imageUploadElement?.current) {
      imageUploadElement.current.click();
    }
  };

  const findPackContract = (pack) => pack?.documents.find((doc) => doc.label === 'contract');

  const mapCollectionSystem = (collectionSystem) => {
    switch (collectionSystem) {
      case 'movolab':
        return 'Movolab';
      case 'customer':
        return 'Cliente';
      case 'cash':
        return 'Contanti';
      case 'movolabAndCash':
        return 'Movolab e Contanti';
      case 'customerAndCash':
        return 'Cliente e Contanti';
      default:
        return '';
    }
  };

  const clearUserCustomisations = async () => {
    await http({
      method: 'PUT',
      url: `/clients/client/${client?._id}`,
      form: { websiteLayout: [] },
    });
    toast.success('Done!');
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN]} hasBox={false}>
      <CardsHeader
        title={showUpdate ? 'Aggiornamento info azienda' : 'Informazioni azienda'}
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => switchMode(),
            hiddenIf: !showUpdate,
          },
          {
            children: 'Modifica',
            onClick: () => switchMode(),
            hiddenIf: showUpdate,
          },
          {
            children: 'Salva modifiche',
            form: 'clientInfoForm',
            hiddenIf: !showUpdate,
          },
        ]}
      />

      <WhiteBox className="mt-0 !overflow-visible">
        <div className="flex flex-wrap pt-4 px-4 gap-x-4">
          <div className="p-3 w-full md:w-1/4">
            <div className="text-3xl font-semibold">{client?.ragioneSociale}</div>
            <div className="text-md">{client?.code}</div>
          </div>
          <div className="flex-1 flex min-h-12 items-center justify-center">
            <div
              className={`relative h-full mb-1 ${showUpdate
                  ? 'cursor-pointer border-2 border-dashed border-slate-300 bg-slate-100 rounded-md hover:bg-slate-200 p-4'
                  : ''
                }`}
              style={{
                backgroundImage: `url(${imgToUpload || imageUrl})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'contain',
                width: '200px',
              }}
              title="Clicca per modificare"
              onClick={() => handleImageUploadClick()}
            >
              {showUpdate ? (
                <>
                  {!(imgToUpload || imageUrl) ? (
                    <div className="mt-3 text-sm text-slate-500 text-center font-semibold">
                      Carica logo aziendale <FaUpload className="mt-3 mx-auto text-lg" />{' '}
                    </div>
                  ) : null}
                  <input
                    ref={imageUploadElement}
                    className="hidden"
                    type="file"
                    id="myImage"
                    name="myImage"
                    accept="image/*"
                    onChange={(e) => imageChangeHandler(e)}
                  />
                </>
              ) : null}
            </div>

            <p
              className="ml-3 max-w-36 text-xs text-slate-500 hover:opacity-70 cursor-pointer"
              onClick={() => setShowInfobox(!showInfobox)}
            >
              {showInfobox ? (
                <>
                  <strong className="font-semibold">Dimensioni consigliate</strong>: 128x32 pixel
                </>
              ) : (
                <FaInfoCircle className="text-lg" title="Info di caricamento" />
              )}
            </p>
          </div>

          <div className="w-full md:w-1/4"></div>
        </div>

        {!showUpdate ? (
          <div className="p-3">
            <div className="flex flex-wrap md:flex-nowrap mt-4 gap-4">
              <div className="flex-initial w-full md:w-1/3 p-4 px-5 text-sm bg-slate-200 rounded-lg">
                <h4 className="text-xl font-bold mb-2">Dati societari</h4>
                <p>
                  <strong>Ragione Sociale</strong>: {client?.ragioneSociale}
                  <br />
                  <strong>Partita IVA</strong>: {client?.partitaIva}
                  <br />
                  <strong>Codice Cliente</strong>: {client?.code}
                  <br />
                  <strong>Codice univoco SDI</strong>:{' '}
                  {client?.sdiUniqueCode ? client.sdiUniqueCode : '-'}
                  <br />
                  <strong>Codice Partner</strong>: {client?.partnerCode}
                  <br />
                </p>
              </div>
              <div className="flex-initial w-full md:w-1/3 p-4 px-5 text-sm bg-slate-200 rounded-lg">
                <h4 className="text-xl font-bold mb-2">Amministrazione</h4>
                <p>
                  <strong>Regime Fiscale</strong>: {client?.regimeFiscale}
                  {client?.invoicingType === 'customer' || client?.invoicingType === 'mixed' ? (
                    <>
                      <strong>Numero Prossima Fattura Diretta</strong>: {customerInvoiceNumber}
                      <br />
                    </>
                  ) : null}
                  <strong>IBAN</strong>: {client?.iban}
                </p>
              </div>
              <div className="flex-initial w-full md:w-1/3 p-4 px-5 text-sm bg-slate-200 rounded-lg">
                <h4 className="text-xl font-bold mb-2">Contatti</h4>
                <p>
                  <strong>Indirizzo</strong>: {client?.address?.city} ({client?.address?.zipCode})
                  <br />
                  <strong>Email Azienda</strong>: {client?.email}
                  <br />
                  <strong>Pec Aziendale</strong>: {client?.pec}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap md:flex-nowrap mt-4 gap-4">
              <div className="flex-initial w-full md:w-1/2 p-4 px-5 text-sm bg-slate-200 rounded-lg">
                <h4 className="text-xl font-bold mb-2">Il tuo contratto</h4>
                <p>
                  <strong className="my-1 inline-block">Tipo Licenza</strong>{' '}
                  {client?.license?.licenseOwner === 'movolab' ? (
                    <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>
                  ) : (
                    <ElementLabel bgColor="bg-gray-500">Personale</ElementLabel>
                  )}
                  <br />
                  {client?.license?.licenseOwner !== 'movolab' && (
                    <>
                      <strong>Numero Licenza</strong>: {client?.license?.licenseNumber}
                      <br />
                    </>
                  )}
                  <strong className="my-1 inline-block">Pack:</strong>{' '}
                  {selectedPack ? (
                    <>
                      {selectedPack?.name} {convertPrice(selectedPack?.fee)}/
                      {mapPeriod(selectedPack?.paymentPeriod)}{' '}
                    </>
                  ) : (
                    <em>Nessun pack attivo</em>
                  )}
                  {client?.collectionSystem === 'customer' ||
                    client?.collectionSystem === 'customerAndCash' ? (
                    <>
                      <strong className="my-1 inline-block">Piattaforma cliente</strong>{' '}
                      {client?.customerCollectionSystem === 'paypal' ? (
                        <ElementLabel bgColor="bg-yellow-600">Paypal</ElementLabel>
                      ) : client?.customerCollectionSystem === 'nexi' ? (
                        <ElementLabel bgColor="bg-gray-500">Nexi</ElementLabel>
                      ) : client?.customerCollectionSystem === 'satispay' ? (
                        <ElementLabel bgColor="bg-gray-500">Satispay</ElementLabel>
                      ) : null}
                    </>
                  ) : null}
                </p>
              </div>
              <div className="flex-initial w-full md:w-1/2 p-4 px-5 text-sm bg-slate-200 rounded-lg">
                <h4 className="text-xl font-bold mb-2">Documenti</h4>
                <div className="flex flex-col">
                  {client?.documents.length > 0 ? (
                    client?.documents.map((doc) => (
                      <div className="mb-2" key={doc._id}>
                        <a href={doc.fileUrl}>
                          <strong>{doc.name}</strong>{' '}
                          <ElementLabel>{getDocLabel(doc, 'client')}</ElementLabel>
                        </a>
                      </div>
                    ))
                  ) : (
                    <em>Nessun documento caricato</em>
                  )}
                </div>
              </div>
              {client?.contractingUser && (
                <div className="flex-initial w-full md:w-1/2 p-4 px-5 text-sm bg-slate-200 rounded-lg">
                  <h4 className="text-xl font-bold mb-2">Contraente</h4>
                  <p>
                    <strong className="my-1 inline-block">Nome Contraente</strong>:{' '}
                    {client?.contractingUser?.firstName}
                    <br />
                    <strong className="my-1 inline-block">Cognome Contraente</strong>:{' '}
                    {client?.contractingUser?.lastName}
                    <br />
                    <strong className="my-1 inline-block">Codice Fiscale Contraente</strong>:{' '}
                    {client?.contractingUser?.fiscalCode}
                    <br />
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <TableHeaderTab
              buttons={[
                {
                  label: 'Dati societari',
                  function: () => setFieldToUpdate('company-details'),
                  selected: fieldToUpdate === 'company-details',
                },
                {
                  label: 'Amministrazione',
                  function: () => setFieldToUpdate('accounting'),
                  selected: fieldToUpdate === 'accounting',
                },
                {
                  label: 'Il tuo contratto',
                  function: () => setFieldToUpdate('contract'),
                  selected: fieldToUpdate === 'contract',
                },
                {
                  label: 'Documenti',
                  function: () => setFieldToUpdate('documents'),
                  selected: fieldToUpdate === 'documents',
                },
                {
                  label: 'Personalizza',
                  function: () => setFieldToUpdate('customisation'),
                  selected: fieldToUpdate === 'customisation',
                },
                {
                  label: 'Termini e Condizioni movo',
                  function: () => setFieldToUpdate('terms-and-conditions'),
                  selected: fieldToUpdate === 'terms-and-conditions',
                },
              ]}
            />

            <div className="p-4 bg-slate-200 border-4 rounded-b-2xl border-white">
              <form onSubmit={form.handleSubmit(onSubmit)} id="clientInfoForm">
                <fieldset disabled={form.formState.isSubmitting}>
                  {fieldToUpdate === 'company-details' && (
                    <>
                      <div className="flex gap-x-3 flex-wrap">
                        <div className="w-full flex flex-wrap gap-x-4">
                          <div className="w-full md:w-96">
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

                          <div className="w-full md:w-48">
                            <FormLabel>Codice Partner</FormLabel>
                            <TextField
                              form={form}
                              name="partnerCode"
                              disabled={true}
                              placeholder="Codice Partner"
                            />
                          </div>

                          <div className="basis-full"></div>

                          <div className="w-full md:w-96">
                            <div className="flex">
                              <div className="w-96">
                                <FormLabel>Regime Fiscale</FormLabel>

                                <SelectField
                                  name="regimeFiscale"
                                  form={form}
                                  options={regimeFiscaleOptions}
                                  placeholder="Regime Fiscale"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="w-full md:w-48">
                            <FormLabel>Partita IVA</FormLabel>
                            <TextField
                              form={form}
                              name="partitaIva"
                              placeholder="Partita Iva"
                              disabled={true}
                              inputClassName="cursor-not-allowed"
                              title="Contattare il supporto per modificare la Partita Iva"
                              validation={{
                                required: { value: true, message: 'partitaIva' },
                              }}
                            />
                          </div>
                          <div className="w-full md:w-48">
                            <FormLabel>Codice Destinatario</FormLabel>
                            <TextField
                              form={form}
                              name="sdiUniqueCode"
                              placeholder="Codice Destinatario"
                            />
                          </div>

                          <div className="basis-full"></div>

                          <div className="w-full md:w-96">
                            <TextField
                              form={form}
                              name="phone"
                              type="tel"
                              label="Numero di telefono"
                              placeholder="Numero di telefono"
                              validation={{
                                required: { value: true, message: 'Inserire il numero di telefono aziendale' },
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
                          </div>

                          <div className="w-full md:w-96">
                            <TextField
                              form={form}
                              name="email"
                              label="Email"
                              placeholder="Email"
                              validation={{
                                required: { value: true, message: 'Inserire la mail aziendale' },
                                pattern: {
                                  value: /^[\w\-\.]*[\w\.]\@[\w\.]*[\w\-\.]+[\w\-]+[\w]\.+[\w]+[\w $]/, //eslint-disable-line
                                  message: 'Email non valida',
                                },
                                maxLength: {
                                  value: 50,
                                  message: 'Campo troppo lungo',
                                },
                              }}
                            />
                          </div>

                          <div className="w-full md:w-96">
                            <TextField
                              form={form}
                              name="pec"
                              label="PEC Aziendale"
                              placeholder="PEC Aziendale"
                              validation={{
                                required: { value: true, message: 'Inserire la PEC aziendale' },
                                pattern: {
                                  value: /^[\w\-\.]*[\w\.]\@[\w\.]*[\w\-\.]+[\w\-]+[\w]\.+[\w]+[\w $]/, //eslint-disable-line
                                  message: 'Email PEC non valida',
                                },
                                maxLength: {
                                  value: 50,
                                  message: 'Campo troppo lungo',
                                },
                              }}
                            />
                          </div>

                          <div className="basis-full"></div>

                          <TextField
                            labelColor="font-semibold mt-2 text-nowrap"
                            form={form}
                            name="address.address"
                            type="text"
                            label="Indirizzo Sede legale"
                            placeholder="Indirizzo Sede legale"
                            className="w-full md:w-96"
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
                            labelColor="font-semibold mt-2 text-nowrap"
                            className="w-full md:w-96"
                            placeholder="Provincia"
                            // onChangeFunction={() => getCompanyCities(form.getValues('province'))}
                            options={provinces}
                            validation={{
                              required: { value: true, message: 'Provincia obbligatoria' },
                            }}
                          />
                          <div className="flex gap-2">
                            <TextField
                              labelColor="font-semibold mt-2 text-nowrap"
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
                              labelColor="font-semibold mt-2 text-nowrap"
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

                        <div className="mt-4 w-full">
                          {/* Licenza */}
                          <hr className="my-4 border-t border-gray-300 w-full" />
                          <div className="w-full mb-2">
                            <h3 className="text-lg font-semibold mb-2">Licenza</h3>
                          </div>
                          <div className="flex flex-wrap gap-x-4">
                            <div className="w-full md:w-64">
                              <FormLabel>Tipo Licenza</FormLabel>
                              <SelectField
                                name="license.licenseOwner"
                                form={form}
                                options={[
                                  { value: 'movolab', label: 'Movolab' },
                                  { value: 'client', label: 'Personale' },
                                ]}
                                placeholder="Tipo Licenza"
                                disabled={true}
                              />
                            </div>
                            {client?.license?.licenseOwner !== 'movolab' && (
                              <div className="w-full md:w-64">
                                <FormLabel>Numero Licenza</FormLabel>
                                <TextField
                                  form={form}
                                  name="license.licenseNumber"
                                  disabled={false}
                                  placeholder="Numero Licenza"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {fieldToUpdate === 'accounting' && (
                    <>
                      {/* <div className="flex flex-wrap gap-x-4">
                        <div className="w-full md:w-96">
                          <FormLabel>Metodo Pagamento Abbonamento</FormLabel>
                          <TextField
                            name="subscriptionPaymentMethod"
                            form={form}
                            placeholder="Metodo Pagamento Abbonamento"
                            disabled={true}
                          />
                        </div>
                        <div className="w-full md:w-96">
                          <FormLabel>IBAN</FormLabel>
                          <TextField name="iban" form={form} placeholder="IBAN" />
                        </div>
                      </div> 
                      <div className="flex flex-wrap gap-x-4">
                        <div className="w-full md:w-96">
                          <FormLabel>Nome sul conto</FormLabel>
                          <TextField name="ibanName" form={form} placeholder="Nome sul conto" />
                        </div>

                        <div className="w-full md:w-96">
                          <FormLabel>Indirizzo Fatturazione</FormLabel>
                          <TextField
                            name="ibanAddress"
                            form={form}
                            placeholder="Indirizzo Fatturazione"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4">
                        <div className="w-full md:w-96">
                          <FormLabel>CAP</FormLabel>
                          <TextField name="ibanCap" form={form} placeholder="CAP" />
                        </div>
                        <div className="w-full md:w-96">
                          <FormLabel>Città</FormLabel>
                          <TextField name="ibanCity" form={form} placeholder="Città" />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4">
                        <div className="w-full md:w-96">
                          <FormLabel>PEC</FormLabel>
                          <TextField name="ibanPec" form={form} placeholder="PEC" />
                        </div>
                      </div>*/}
                      <div className="w-full md:w-96">
                        <div className="mr-3">
                          <div className="text-lg font-semibold">
                            Numerazione Fatturazione Diretta
                          </div>
                        </div>
                        <div className="flex">
                          <div className="mr-3">
                            <FormLabel>Anno</FormLabel>

                            <TextField
                              form={form}
                              className={'w-32'}
                              name="externalInvoicingConfig.year"
                              placeholder={'Anno'}
                            />
                          </div>
                          <div>
                            <FormLabel>Sezione</FormLabel>

                            <TextField
                              form={form}
                              className={'w-32 mr-3'}
                              name="externalInvoicingConfig.section"
                              placeholder={'Sezione'}
                            />
                          </div>
                          <div>
                            <FormLabel>Numero</FormLabel>

                            <TextField
                              form={form}
                              className={'w-32 mr-3'}
                              name="externalInvoicingConfig.number"
                              placeholder={'Numero'}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {fieldToUpdate === 'contract' && (
                    <>
                      <div className="w-full md:w-96">
                        <FormLabel>Piano Selezionato</FormLabel>
                        <div className="bg-white border border-gray-900 rounded p-2.5 text-gray-900">
                          <div>
                            {selectedPack?.name} -{' '}
                            {selectedPack?.licenseType === 'client' ? 'Licenziatario' : 'Movolab'}
                          </div>
                          <div>Periodo di Pagamento: {mapPeriod(selectedPack?.paymentPeriod)}</div>
                          <div>Tariffa Base: {convertPrice(selectedPack?.fee)}</div>
                          <div>
                            {findPackContract(selectedPack) ? (
                              <a
                                href={findPackContract(selectedPack)?.fileUrl}
                                className="underline text-sky-700"
                              >
                                Dettagli del piano
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-full">
                        <FormLabel>Extra</FormLabel>
                        <div className="bg-white border border-gray-900 rounded p-2.5 text-gray-900">
                          <div className="flex">
                            <span className="mr-2 w-60">Punti Nolo inclusi:</span>
                            <span className="mr-2 w-60">
                              {selectedPack?.params?.includedRentalLocations}
                            </span>
                            <span className="mr-2 w-60">Punto Nolo extra:</span>
                            <span className="mr-2 w-60">
                              {convertPrice(selectedPack?.variablePayments?.extraRentalLocationFee)}
                            </span>
                          </div>

                          <div className="flex">
                            <span className="mr-2 w-60">Veicoli inclusi:</span>
                            <span className="mr-2 w-60">
                              {selectedPack?.params?.includedVehicles}
                            </span>
                            <span className="mr-2 w-60">Veicolo extra:</span>
                            <span className="mr-2 w-60">
                              {convertPrice(selectedPack?.variablePayments?.extraVehicleFee)}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="mr-2 w-60">Noleggi Mensili:</span>
                            <span className="mr-2 w-60">
                              {selectedPack?.params?.includedMonthlyRents}
                            </span>
                            <span className="mr-2 w-60">Noleggio extra:</span>
                            <span className="mr-2 w-60">
                              {convertPrice(selectedPack?.variablePayments?.extraMonthlyRentFee)}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="mr-2 w-60">Comodati Mensili:</span>
                            <span className="mr-2 w-60">
                              {selectedPack?.params?.includedComodati}
                            </span>
                            <span className="mr-2 w-60">Costo comodato extra:</span>
                            <span className="mr-2 w-60">
                              {convertPrice(selectedPack?.variablePayments?.extraComodatoFee)}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="mr-2 w-60">MNP Mensili:</span>
                            <span className="mr-2 w-60">{selectedPack?.params?.includedMNP}</span>
                            <span className="mr-2 w-60">MNP extra:</span>
                            <span className="mr-2 w-60">
                              {convertPrice(selectedPack?.variablePayments?.extraMNPFee)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-lg font-semibold mt-5">Dettagli contratto</div>

                      <p>
                        Contratto sottoscritto il{' '}
                        {moment(currentClient?.createdAt).format('DD/MM/YYYY')}
                        <br />
                        <a
                          href={
                            client?.license?.licenseOwner === 'movolab'
                              ? '/pdf/K_Movolab_LicenzaMovolab_24_001.pdf'
                              : '/pdf/K_Movolab_LicenzaPersonale_24_001.pdf'
                          }
                          target="_blank"
                          className="underline text-sky-700"
                        >
                          Dettagli contratto
                        </a>{' '}
                        &bull;{' '}
                        <a
                          href="/pdf/Privacy-Movolab-srl.pdf"
                          target="_blank"
                          className="underline text-sky-700"
                        >
                          Privacy policy
                        </a>
                      </p>

                      <div className="text-lg font-semibold mt-5">Dati Contraente</div>

                      <div className="flex">
                        <div className="mr-3 w-48">
                          <FormLabel>Nome</FormLabel>
                          <TextField
                            form={form}
                            name="contractingUser.firstName"
                            type="string"
                            placeholder="Nome Contraente"
                            disabled={true}
                          />
                        </div>
                        <div className="mr-3 w-48">
                          <FormLabel>Cognome</FormLabel>
                          <TextField
                            form={form}
                            name="contractingUser.lastName"
                            type="string"
                            placeholder="Cognome Contraente"
                            disabled={true}
                          />
                        </div>

                        <div className="mr-3 w-48">
                          <FormLabel>Codice Fiscale</FormLabel>
                          <TextField
                            form={form}
                            name="contractingUser.fiscalCode"
                            type="string"
                            placeholder="Codice Fiscale Contraente"
                            disabled={true}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {fieldToUpdate === 'customisation' && (
                    <div className="flex flex-wrap gap-x-4">
                      {availableCustomisations.map((field, key) => (
                        <div className="w-full md:w-64" key={key}>
                          <FormLabel>{field.label}</FormLabel>
                          <ColorPicker
                            name={`customisation.${field.key}`}
                            form={form}
                            placeholder={field.label}
                          />
                        </div>
                      ))}

                      {localStorage.getItem('dbug_user') ? (
                        <button
                          type="button"
                          onClick={clearUserCustomisations}
                          className="rounded-lg px-4 py-2 text-sm bg-white mt-2"
                        >
                          Pulisci personalizzazioni utente
                        </button>
                      ) : null}
                    </div>
                  )}
                  {fieldToUpdate === 'terms-and-conditions' && (
                    <>
                      {client?.license?.licenseOwner !== 'movolab' ? (
                        <div className="w-full md:w-96">
                          <FormLabel>Tipo di Termini e Condizioni Movo</FormLabel>
                          <SelectField
                            name="termsAndConditionsType"
                            form={form}
                            options={[
                              { value: 'default', label: 'Standard' },
                              { value: 'custom', label: 'Personalizzati' },
                            ]}
                            placeholder="Termini e Condizioni"
                          />
                        </div>
                      ) : null}
                      <div className="mt-4">
                        {form.watch('termsAndConditionsType') === 'custom' && (
                          <TextareaField
                            form={form}
                            name="customTermsAndConditions"
                            type="string"
                            placeholder="Descrizione"
                            rows={8}
                          />
                        )}
                        {form.watch('termsAndConditionsType') === 'default' && (
                          <div className="bg-white border border-gray-900 rounded p-2.5 text-gray-900">
                            <DefTermsAndConditionsCol1 />
                            <DefTermsAndConditionsCol2 />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </fieldset>
              </form>

              {fieldToUpdate === 'documents' && <Documents client={client} noCollapsible />}
            </div>
          </div>
        )}
      </WhiteBox>
    </SettingsPage>
  );
};

export default ClientInfo;
