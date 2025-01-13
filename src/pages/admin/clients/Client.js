import React, { useContext, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AWS from 'aws-sdk';
import { MOVOLAB_ROLE_ADMIN, CLIENT_ROLE_ADMIN, http } from '../../../utils/Utils';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { UserContext } from '../../../store/UserContext';
import Button from '../../../components/UI/buttons/Button';
import RenderMap from '../../../components/UI/RenderMap';
import WhiteBox from '../../../components/UI/WhiteBox';
import DisplayDateTime from '../../../components/UI/dates/DisplayDateTime';

import TableHeaderTab from '../../../components/UI/TableHeaderTab';
import UpdateEventsTable from '../../../components/UpdateEvents/AdminUpdateEventsTable';

import ClientsModal from '../../../components/Clients/Clients/ClientsModal';
import { provinces } from '../../../utils/Addresses';
import FormLabel from '../../../components/UI/FormLabel';
import { RiVerifiedBadgeFill } from 'react-icons/ri';

import { TextField } from '../../../components/Form/TextField';
import { SelectField } from '../../../components/Form/SelectField';
import { fetchCountries, getCityByProvince, getZipCodeByCity } from '../../../utils/Addresses';

import ClientPayments from '../../../components/ClientPayments/ClientPayments';
import ClientPacks from '../../../components/Clients/Packs/ClientPacks';
import AdminPage from '../../../components/Admin/AdminPage';
import CardsHeader from '../../../components/UI/CardsHeader';
import Documents from '../../../components/Documents/Documents';
import ClientUsage from '../../../components/Subscriptions/ClientUsage';
import ClientProfilesSection from '../../../components/Clients/ClientProfiles/ClientProfilesSection';
import Loader from '../../../components/UI/Loader';

const Client = () => {
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: 'eu-west-1',
    signatureVersion: 'v4',
  });

  const form = useForm();
  const params = useParams();
  const history = useHistory();
  const search = useLocation().search;

  const [client, setClient] = useState(null);
  const [countries, setCountries] = useState([]);
  const [companyComuni, setCompanyComuni] = useState([]);
  const [companyZipCodes, setCompanyZipCodes] = useState([]);
  const [fieldToUpdate, setFieldToUpdate] = useState('details');
  const [avatar, setAvatar] = useState(undefined); //eslint-disable-line no-unused-vars
  const [imgToUpload, setImgToUpload] = useState('');
  const [uploaded, setUploaded] = useState(false); //eslint-disable-line no-unused-vars
  const [importedData, setImportedData] = useState({});
  const [uploadingImg, setUploadingImg] = useState(); //eslint-disable-line no-unused-vars
  const [showClientsModal, setShowClientsModal] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [companyObject, setCompanyObject] = useState({}); //eslint-disable-line no-unused-vars
  const [location, setLocation] = useState({ lat: 45.464664, lng: 9.18854 });
  const [markers, setMarkers] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [italianCompany, setItalianCompany] = useState(true); //eslint-disable-line no-unused-vars
  const [planMonths, setPlanMonths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: currentClient } = useContext(UserContext);

  useEffect(() => {
    setFieldToUpdate(new URLSearchParams(search).get('tab') || 'details');
  }, [search]);

  //eslint-disable-next-line
  let invoicingOptions = [];

  if (currentClient) {
    if (
      currentClient.role === MOVOLAB_ROLE_ADMIN ||
      (currentClient.client.license.licenseOwner === 'client' &&
        currentClient.role === CLIENT_ROLE_ADMIN)
    ) {
      invoicingOptions = [{ value: 'customer', label: 'Cliente' }];
    } else {
      invoicingOptions = [
        { value: 'movolab', label: 'Movolab' },
        { value: 'customer', label: 'Cliente' },
      ];
    }
  }

  const imageUploadElement = useRef();

  const fetchClient = async () => {
    setIsLoading(true);
    try {
      const response = await http({ url: `/clients/client/${params.id}` });
      setClient(response);

      form.setValue('ragioneSociale', response.ragioneSociale);
      form.setValue('fiscalCountry', response.fiscalCountry);
      if (response.fiscalCountry !== 'Italia') setItalianCompany(false);
      form.setValue('partitaIva', response.partitaIva);
      form.setValue('pec', response.pec);
      form.setValue('email', response.email);
      form.setValue('phone', response.phone);
      form.setValue('businessActive', response.businessActive);
      form.setValue('sdiUniqueCode', response.sdiUniqueCode);
      form.setValue('fiscalCode', response.fiscalCode);
      form.setValue('address.address', response.address?.address);
      form.setValue('address.houseNumber', response.address?.houseNumber);
      form.setValue('address.city', response.address?.city);
      form.setValue('address.province', response.address?.province);
      form.setValue('address.zipCode', response.address?.zipCode);
      form.setValue('address.location', response.address?.location);
      form.setValue('imageUrl', response.imageUrl);
      form.setValue('companyType', response.companyType);
      if (response.fundingDate)
        form.setValue('fundingDate', new Date(response.fundingDate).toISOString().split('T')[0]);
      if (response.imageUrl) setImageUrl(response.imageUrl);
      setShowMap(true);

      form.setValue('regimeFiscale', response.regimeFiscale);
      form.setValue('license.licenseOwner', response.license?.licenseOwner);
      form.setValue('license.licenseNumber', response.license?.licenseNumber);
      form.setValue('invoicingType', response.invoicingType);
      form.setValue('internalInvoicingConfig.number', response.internalInvoicingConfig?.number);
      form.setValue('internalInvoicingConfig.year', response.internalInvoicingConfig?.year);
      form.setValue('internalInvoicingConfig.section', response.internalInvoicingConfig?.section);
      form.setValue('externalInvoicingConfig.number', response.externalInvoicingConfig?.number);
      form.setValue('externalInvoicingConfig.year', response.externalInvoicingConfig?.year);
      form.setValue('externalInvoicingConfig.section', response.externalInvoicingConfig?.section);
      form.setValue('collectionSystem', response.collectionSystem);
      form.setValue('customerCollectionSystem', response.customerCollectionSystem);
      form.setValue('movolabCollectionSystem', response.movolabCollectionSystem);
      form.setValue('subscriptionPaymentMethod', response.subscriptionPaymentMethod);
      form.setValue('contractingUser.firstName', response.contractingUser?.firstName);
      form.setValue('contractingUser.lastName', response.contractingUser?.lastName);
      form.setValue('contractingUser.fiscalCode', response.contractingUser?.fiscalCode);
      form.setValue('partnerCode', response.partnerCode);
      setCompanyObject(response);

      if (response.address?.lat && response.address?.lng) {
        const location = {
          lat: response.address?.lat,
          lng: response.address?.lng,
          name: response.ragioneSociale,
          address: response.address?.address,
        };

        setLocation(location);
        setMarkers([location]);
        setShowMap(true);
      }
      const packStartDate = new Date(response?.packHistory?.[0]?.startDate);
      packStartDate.setDate(1); // set the day to the first day of the month
      const now = new Date();
      const months = [];

      while (packStartDate <= now) {
        months.push(new Date(packStartDate.getFullYear(), packStartDate.getMonth(), 1));
        packStartDate.setMonth(packStartDate.getMonth() + 1);
      }

      months.reverse();
      setPlanMonths(months);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    } finally {
      setIsLoading(false);
    }
  };

  const imageChangeHandler = async (event) => {
    if (!event.target.files?.length) return;

    setImgToUpload(URL.createObjectURL(event.target.files[0]));
    setAvatar(event.target.files[0]);
    await userImageUploader(event.target.files[0]);
  };

  const userImageUploader = async (avatarFile) => {
    try {
      const s3 = new AWS.S3();
      const file = avatarFile;

      if (!file) {
        return;
      }
      const params = {
        Bucket: 'movolab-car-models',
        Key: `CLIENT-${Date.now()}.${file.name}`,
        Body: file,
      };
      setUploadingImg(true);
      const { Location } = await s3.upload(params).promise();
      form.setValue('imageUrl', Location);
      setUploadingImg(false);
      setUploaded(true);

      await http({
        method: 'PUT',
        url: `/clients/client/${client._id}`,
        form: form.getValues(),
      });
      toast.success('Immagine aggiornata con successo');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const handleImageUploadClick = () => {
    imageUploadElement.current.click();
  };

  const returnCompany = (company) => {
    window.location.reload();
  };

  const switchTo = (tab) => {
    setFieldToUpdate(tab);
  };

  //eslint-disable-next-line
  const checkPIVA = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Stiamo verificando Partita IVA...', {
      duration: 4000,
    });
    try {
      const response = await http({
        url: `/clients/partitaIva/${form.getValues('partitaIva')}`,
      });
      if (response) {
        toast.remove(toastId);
        toast.success('Partita IVA valida', {
          icon: '✅',
          duration: 3000,
        });
        setImportedData(response);
        setShowClientsModal(true);
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
      if (data.phone) {
        const checkPhone = data.phone.match(
          /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im, //eslint-disable-line no-useless-escape
        );

        if (!checkPhone)
          return toast.error('Inserisci un numero di telefono valido', {
            icon: '❌',
            duration: 3000,
          });
      }

      if (companyObject.businessActive !== undefined && companyObject.businessActive !== null) {
        data = {
          ...data,
          address: companyObject?.address,
          destinationCode: companyObject?.destinationCode,
          fundingDate: new Date(companyObject?.fundingDate),
          businessActive: companyObject?.businessActive,
        };
      }

      await http({
        url: `/clients/client/${params.id}`,
        method: 'PUT',
        form: data,
      });
      toast.success('Dati aggiornati con successo');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const enableClient = async (state) => {
    try {
      if (state === true) {
        if (!window.confirm('Sei sicuro di voler attivare il cliente?')) return;
        await http({
          method: 'PUT',
          url: `/clients/client/${params.id}/enable`,
        });
        toast.success('Cliente attivato');
        fetchClient();
      } else {
        if (!window.confirm('Sei sicuro di voler disattivare il cliente?')) return;
        await http({
          method: 'PUT',
          url: `/clients/client/${params.id}/disable`,
        });
        toast.success('Cliente disattivato');
        fetchClient();
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const getCompanyCities = async (province) => {
    try {
      if (province === '') return;
      setCompanyComuni(await getCityByProvince(province));
    } catch (err) {
      console.error(err);
    }
  };

  const getCompanyZipCodes = async (city, province) => {
    try {
      if (city === '' || province === '') {
      } else {
        setCompanyZipCodes(await getZipCodeByCity(city, province));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setShowClientsModal(false);
  };

  useEffect(() => {
    fetchClient();
    fetchCountries().then((countries) => setCountries(countries));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN} hasBox={false}>
      <CardsHeader
        title={'Modifica Cliente Movolab'}
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
          },
          {
            children: 'Aggiorna',
            form: 'clientForm',
          },
        ]}
      />
      <WhiteBox hideOverflow={false} className="mt-0">
        <div className="px-4 pt-4">
          <h1 className="text-2xl font-semibold m-2 flex justify-between">
            <div>
              <strong className="font-medium">{client?.ragioneSociale}</strong>
              {client?.verifiedPartitaIva && (
                <RiVerifiedBadgeFill className="text-green-600 mt-1 ml-2" />
              )}
              <div className="text-sm text-gray-500">{client?.code}</div>
            </div>
            <div>
              <div>
                {client && client.enabled ? (
                  <div className="flex justify-end">
                    <div className="text-green-600 font-semibold text-lg p-2 text-right">
                      Cliente Attivato
                    </div>
                    <div>
                      <Button btnStyle={'levelRed'} onClick={() => enableClient(false)}>
                        Disattiva
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <div className="text-red-600 font-semibold text-lg p-2 text-right">
                      Cliente Disattivato
                    </div>
                    <div>
                      <Button btnStyle={'levelGreen'} onClick={() => enableClient(true)}>
                        Attiva
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {client?.createdAt && (
                <div className="flex justify-end text-sm text-gray-500 mt-2">
                  Data creazione cliente:{' '}
                  <div className="text-right font-semibold text-gray-600 overflow-hidden text-ellipsis">
                    <DisplayDateTime date={client?.createdAt} displayType={'flat'} />
                  </div>
                </div>
              )}
            </div>
          </h1>
          <div className="flex m-2">
            <div>
              <div className="col-span-1">
                <div
                  className="shadow-sm relative cursor-pointer"
                  style={{
                    backgroundImage: `url(${imgToUpload || imageUrl})`,
                    backgroundColor: '#cbd5e1',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'contain',
                    borderRadius: '5em',
                    border: '1px solid #e5e7eb',
                    width: '100px',
                    height: '100px',
                    margin: 'auto',
                    marginBottom: '0.2em',
                  }}
                  onClick={() => handleImageUploadClick()}
                >
                  <input
                    ref={imageUploadElement}
                    className="hidden"
                    type="file"
                    id="myImage"
                    name="myImage"
                    accept="image/*"
                    onChange={(e) => imageChangeHandler(e)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <TableHeaderTab
          buttons={[
            {
              label: 'Dati cliente',
              function: () => setFieldToUpdate('details'),
              selected: fieldToUpdate === 'details',
            },

            {
              label: 'Impostazioni',
              function: () => setFieldToUpdate('settings'),
              selected: fieldToUpdate === 'settings',
            },
            {
              label: 'Documenti',
              function: () => setFieldToUpdate('documenti'),
              selected: fieldToUpdate === 'documenti',
            },
            {
              label: 'Profili utente',
              function: () => setFieldToUpdate('profili'),
              selected: fieldToUpdate === 'profili',
            },
            {
              label: 'Pagamenti',
              function: () => setFieldToUpdate('pagamenti'),
              selected: fieldToUpdate === 'pagamenti',
            },
            {
              label: 'Pack',
              function: () => setFieldToUpdate('pack'),
              selected: fieldToUpdate === 'pack',
            },
            {
              label: 'Aggiornamenti',
              function: () => setFieldToUpdate('updates'),
              selected: fieldToUpdate === 'updates',
            },
            {
              label: 'Utilizzo Movolab',
              function: () => setFieldToUpdate('utilizzo'),
              selected: fieldToUpdate === 'utilizzo',
            },
          ]}
        />

        <div className="p-4 bg-slate-200 border-4 rounded-b-2xl border-white">
          {fieldToUpdate === 'details' && (
            <form onSubmit={form.handleSubmit(onSubmitCompany)} id="clientForm">
              <div className="flex h-max">
                <div className="w-3/5">
                  <div className="flex flex-wrap">
                    <div className="mr-3 w-96">
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
                    <div className="mr-3 w-64">
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
                  <div className="flex flex-wrap">
                    <div className="mr-3 w-64">
                      <FormLabel>Nazione Partita IVA</FormLabel>
                      <SelectField
                        form={form}
                        name="fiscalCountry"
                        type="string"
                        placeholder="Nazione Partita IVA"
                        options={countries}
                        validation={{
                          required: { value: true, message: 'Nazione Partita IVA richiesta' },
                        }}
                        onChangeFunction={(e) => {
                          e.preventDefault();
                          setItalianCompany(e.target.value === 'Italia');
                        }}
                      />
                    </div>
                    <div className="mr-3 w-48">
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

                  <div className="flex">
                    <div className="mr-3 w-64">
                      <FormLabel>Codice Univoco SDI</FormLabel>
                      <TextField
                        form={form}
                        name="sdiUniqueCode"
                        type="string"
                        placeholder="Codice Univoco SDI"
                      />
                    </div>
                    <div className="mr-3 w-64">
                      <FormLabel>Codice Partner</FormLabel>
                      <TextField
                        form={form}
                        name="partnerCode"
                        type="string"
                        disabled={currentClient?.role !== MOVOLAB_ROLE_ADMIN}
                        placeholder="Codice Partner"
                      />
                    </div>
                  </div>
                  <div className="flex">
                    <div className="mr-3 w-96">
                      <FormLabel>Data Fondazione Azienda</FormLabel>
                      <TextField
                        form={form}
                        name="fundingDate"
                        type="date"
                        placeholder="Data Fondazione"
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
                  <div className="flex">
                    <div className="mr-3 w-64">
                      <FormLabel>Email</FormLabel>
                      <TextField form={form} name="email" type="email" placeholder="Email" />
                    </div>
                    <div className="mr-3 w-64">
                      <FormLabel>PEC</FormLabel>
                      <TextField form={form} name="pec" type="email" placeholder="PEC" />
                    </div>
                    {/* <div className="mr-3 w-64">
                      <FormLabel>Telefono</FormLabel>
                      <TextField form={form} name="phone" type="tel" placeholder="Telefono" />
                    </div> */}
                  </div>
                  <div>
                    <div className="flex">
                      <div className="mr-3 mt-4 w-[235.33px]">
                        <div className="text-lg font-semibold">Indirizzo Sede Legale</div>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="mr-3 w-96">
                        <FormLabel>Indirizzo</FormLabel>
                        <TextField
                          form={form}
                          name="address.address"
                          type="string"
                          placeholder="Indirizzo"
                        />
                      </div>
                      {/* <div className="pr-3 w-32">
                        <FormLabel>N. Civico</FormLabel>
                        <TextField
                          form={form}
                          name="address.houseNumber"
                          type="string"
                          placeholder="N. Civico"
                        />
                      </div> */}
                    </div>
                    <div className="flex">
                      <div className="pr-3 w-64">
                        <FormLabel>Provincia</FormLabel>
                        <SelectField
                          form={form}
                          name="address.province"
                          type="string"
                          placeholder={client?.address?.province || 'Provincia'}
                          onChangeFunction={() =>
                            getCompanyCities(form.getValues('address.province'))
                          }
                          onClickFunction={() =>
                            getCompanyCities(form.getValues('address.province'))
                          }
                          options={provinces}
                        />
                      </div>
                      <div className="pr-3 w-64">
                        <FormLabel>Comune</FormLabel>
                        <SelectField
                          form={form}
                          name="address.city"
                          type="string"
                          placeholder={client?.address?.city || 'Comune'}
                          onChangeFunction={() =>
                            getCompanyZipCodes(
                              form.getValues('address.city'),
                              form.getValues('address.province'),
                            )
                          }
                          options={companyComuni}
                        />
                      </div>
                    </div>
                    <div className="flex">
                      <div className="mr-3 w-[235.33px]">
                        <FormLabel>CAP:</FormLabel>
                        <SelectField
                          form={form}
                          name="address.zipCode"
                          type="string"
                          placeholder={client?.address?.zipCode || 'CAP'}
                          options={companyZipCodes}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex">
                      <div className="mr-3 mt-4 w-[235.33px]">
                        <div className="text-lg font-semibold">Contraente</div>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="mr-3 w-48">
                        <FormLabel>Nome</FormLabel>
                        <TextField
                          form={form}
                          name="contractingUser.firstName"
                          type="string"
                          placeholder="Nome Contraente"
                        />
                      </div>
                      <div className="mr-3 w-48">
                        <FormLabel>Cognome</FormLabel>
                        <TextField
                          form={form}
                          name="contractingUser.lastName"
                          type="string"
                          placeholder="Cognome Contraente"
                        />
                      </div>

                      <div className="mr-3 w-48">
                        <FormLabel>Codice Fiscale</FormLabel>
                        <TextField
                          form={form}
                          name="contractingUser.fiscalCode"
                          type="string"
                          placeholder="Codice Fiscale Contraente"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-2/5 flex flex-col">
                  <div className="h-full">
                    {showMap && <RenderMap location={location} markers={markers} zoom={15} />}
                  </div>
                </div>
              </div>
            </form>
          )}
          {fieldToUpdate === 'settings' && (
            <form onSubmit={form.handleSubmit(onSubmitCompany)} id="clientForm">
              <div className="flex h-max">
                <fieldset disabled={form.formState.isSubmitting}>
                  <div>
                    <div className="max-w-sm">
                      <FormLabel>Regime Fiscale</FormLabel>

                      <SelectField
                        name="regimeFiscale"
                        form={form}
                        options={[
                          { value: 'RF01', label: 'RF01 - Ordinario' },
                          {
                            value: 'RF02',
                            label: 'RF02 - Contribuenti minimi (art.1, c.96-117, L. 244/07',
                          },
                          {
                            value: 'RF04',
                            label:
                              'RF04 - Agricoultura e attività connesse e pesca (artt.34 e 34-bis, DPR 633/72',
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
                            label:
                              'RF08 - Gestione servizi telefonia pubblica (art.74, c.1, DPR 633/72',
                          },
                          {
                            value: 'RF09',
                            label:
                              'RF09 - Rivendita documenti di trasporto pubblico e di sosta (art.74, c.1, DPR 633/72',
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
                        ]}
                        placeholder="Regime Fiscale"
                      />
                    </div>
                    <div className="md:flex">
                      <div className="w-[500px] pr-3">
                        {form.watch('invoicingType') === 'customer' ||
                        form.getValues('invoicingType') === 'mixed' ? (
                          <div
                            className={`${form.watch('invoicingType') === 'mixed' ? 'mt-4' : ''}`}
                          >
                            <FormLabel>Numerazione Fatture Esterne</FormLabel>
                            <div className="flex mt-2">
                              <div className="mt-3">Anno</div>
                              <TextField
                                form={form}
                                className={'w-20 ml-2'}
                                name="externalInvoicingConfig.year"
                                placeholder={'Anno'}
                              />
                              <div className="mt-3 ml-5">Numero</div>
                              <TextField
                                form={form}
                                className={'w-20 ml-2'}
                                name="externalInvoicingConfig.number"
                                placeholder={'Numero'}
                              />
                              <div className="mt-3 ml-5">Sezione</div>
                              <TextField
                                form={form}
                                className={'w-20 ml-2'}
                                name="externalInvoicingConfig.section"
                                placeholder={'Sezione'}
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex mt-5">
                      <div className="w-[400px] pr-3 mr-5">
                        <FormLabel>Tipo di licenza</FormLabel>
                        <SelectField
                          name="license.licenseOwner"
                          form={form}
                          options={[
                            { value: 'movolab', label: 'Licenza Movolab' },
                            { value: 'client', label: 'Licenza cliente' },
                          ]}
                          placeholder="Tipo di licenza"
                        />
                      </div>
                      {form.watch('license.licenseOwner') === 'client' && (
                        <div className="w-[400px] pr-3 mr-5">
                          <FormLabel>Numero licenza</FormLabel>
                          <TextField
                            form={form}
                            name="license.licenseNumber"
                            type="string"
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
                  </div>
                </fieldset>
              </div>
            </form>
          )}
          <div className="w-full">
            {fieldToUpdate === 'documenti' && <Documents client={client} noCollapsible />}
            {fieldToUpdate === 'profili' && (
              <ClientProfilesSection clientId={params.id} noCollapsible />
            )}
            {fieldToUpdate === 'pagamenti' && <ClientPayments client={client} />}
            {fieldToUpdate === 'pack' && (
              <ClientPacks
                client={client}
                isVisible={fieldToUpdate === 'pack'}
                switchTo={switchTo}
              />
            )}

            {fieldToUpdate === 'updates' && (
              <UpdateEventsTable collectionName={'clients'} id={params.id} />
            )}
            {fieldToUpdate === 'utilizzo' && (
              <>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader />
                  </div>
                ) : planMonths.length > 0 ? (
                  <>
                    {planMonths.map((month, index) => (
                      <ClientUsage key={index} month={month} clientId={client?._id} />
                    ))}
                  </>
                ) : (
                  <div className="text-center mt-4">Nessun dato disponibile</div>
                )}
              </>
            )}
          </div>
        </div>
      </WhiteBox>
      {showClientsModal ? (
        <ClientsModal
          mode={'import'}
          clientId={client?._id}
          importedData={importedData}
          closeModal={closeModal}
          returnCompany={returnCompany}
        />
      ) : null}
    </AdminPage>
  );
};

export default Client;
