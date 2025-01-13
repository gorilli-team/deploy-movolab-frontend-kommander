import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AWS from 'aws-sdk';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import { useHistory, useParams } from 'react-router-dom';
import Button from '../../../components/UI/buttons/Button';
import RenderMap from '../../../components/UI/RenderMap';
import WhiteBox from '../../../components/UI/WhiteBox';
import TableHeaderTab from '../../../components/UI/TableHeaderTab';
import CardsHeader from '../../../components/UI/CardsHeader';
import UpdateEventsTable from '../../../components/UpdateEvents/UpdateEventsTable';
import { provinces } from '../../../utils/Addresses';

import UserCompaniesModal from '../../../components/UserCompanies/UserCompaniesModal';

import FormLabel from '../../../components/UI/FormLabel';
import { RiVerifiedBadgeFill } from 'react-icons/ri';

import { TextField } from '../../../components/Form/TextField';
import { SelectField } from '../../../components/Form/SelectField';
import {
  fetchCountries,
  getCityByProvince,
  getZipCodeByCity,
} from '../../../utils/Addresses';

import Documents from '../../../components/UserCompanies/Documents';

import Page from '../../../components/Dashboard/Page';

const UserCompany = () => {
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: 'eu-west-1',
    signatureVersion: 'v4',
  });

  const form = useForm();
  const params = useParams();
  const history = useHistory();

  const [userCompany, setUserCompany] = useState(null);
  // const [provinces, setProvinces] = useState([]);
  const [countries, setCountries] = useState([]);
  const [companyComuni, setCompanyComuni] = useState([]);
  const [companyZipCodes, setCompanyZipCodes] = useState([]);
  const [fieldToUpdate, setFieldToUpdate] = useState('company-details');
  const [avatar, setAvatar] = useState(undefined); //eslint-disable-line no-unused-vars
  const [imgToUpload, setImgToUpload] = useState('');
  const [uploaded, setUploaded] = useState(false); //eslint-disable-line no-unused-vars
  const [importedData, setImportedData] = useState({});
  const [uploadingImg, setUploadingImg] = useState(); //eslint-disable-line no-unused-vars
  const [showUserCompaniesModal, setShowUserCompaniesModal] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [companyObject, setCompanyObject] = useState({}); //eslint-disable-line no-unused-vars
  const [location, setLocation] = useState({ lat: 45.464664, lng: 9.18854 });
  const [markers, setMarkers] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [italianCompany, setItalianCompany] = useState(true);

  const imageUploadElement = useRef();

  const fetchUserCompany = async () => {
    try {
      const response = await http({ url: `/userCompanies/${params.id}` });

      setUserCompany(response);
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
      form.setValue('imageUrl', response.imageUrl);
      form.setValue('companyType', response.companyType);
      if (response.fundingDate)
        form.setValue('fundingDate', new Date(response.fundingDate).toISOString().split('T')[0]);
      if (response.imageUrl) setImageUrl(response.imageUrl);

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
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
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
      url: `/userCompanies/${userCompany._id}`,
      form: form.getValues(),
    });
    toast.success('Immagine aggiornata con successo');
  };

  const handleImageUploadClick = () => {
    imageUploadElement.current.click();
  };

  const returnCompany = (company) => {
    window.location.reload();
  };

  const checkPIVA = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Stiamo verificando Partita IVA...', {
      duration: 4000,
    });
    try {
      const response = await http({
        url: `/userCompanies/partitaIva/${form.getValues('partitaIva')}`,
      });
      if (response) {
        toast.remove(toastId);
        toast.success('Partita IVA valida', {
          icon: '✅',
          duration: 3000,
        });
        setImportedData(response);
        setShowUserCompaniesModal(true);
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
        url: `/userCompanies/${params.id}`,
        method: 'PUT',
        form: data,
      });
      toast.success('Dati aggiornati con successo');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const getCompanyCities = async (province) => {
    try {
      if (province === '') return;
      setCompanyComuni(getCityByProvince(province));
    } catch (err) {
      console.error(err);
    }
  };

  const getCompanyZipCodes = async (city, province) => {
    try {
      if (city === '' || province === '') return;
      setCompanyZipCodes(getZipCodeByCity(city, province));
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setShowUserCompaniesModal(false);
  };

  useEffect(() => {
    fetchUserCompany();
    fetchCountries().then((countries) => setCountries(countries));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName={'px-2 pb-4'}>
      <CardsHeader title="Modifica azienda" />
      <WhiteBox className="mt-0">
        <div className="px-4 pt-4">
          <h1 className="text-2xl font-semibold m-2 flex">
            <strong className="font-medium">{userCompany?.ragioneSociale}</strong>
            {userCompany?.verifiedPartitaIva && (
              <RiVerifiedBadgeFill className="text-green-600 mt-1 ml-2" />
            )}
          </h1>
          <div className="flex m-2">
            <div>
              <div className="col-span-1">
                <div
                  className="shadow-sm relative cursor-pointer"
                  style={{
                    backgroundImage: `url(${imgToUpload || imageUrl})`,
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
              label: 'Dati aziendali',
              function: () => setFieldToUpdate('company-details'),
              selected: fieldToUpdate === 'company-details',
            },
            {
              label: 'Documenti',
              function: () => setFieldToUpdate('documenti'),
              selected: fieldToUpdate === 'documenti',
            },
            {
              label: 'Aggiornamenti',
              function: () => setFieldToUpdate('updates'),
              selected: fieldToUpdate === 'updates',
            },
          ]}
        />

        <div className="p-4 bg-slate-200 border-4 rounded-b-2xl border-white">
          {fieldToUpdate === 'company-details' && (
            <form onSubmit={form.handleSubmit(onSubmitCompany)}>
              <div className="flex">
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
                    {italianCompany && (
                      <div className="mr-3 w-40">
                        <FormLabel>&nbsp;</FormLabel>
                        <Button
                          type="button"
                          btnStyle="inFormStyle"
                          small={true}
                          onClick={(e) => {
                            checkPIVA(e);
                          }}
                        >
                          Verifica
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex">
                    <div className="mr-3 w-96">
                      <FormLabel>Codice Fiscale</FormLabel>
                      <TextField
                        form={form}
                        name="fiscalCode"
                        type="string"
                        placeholder="Codice Fiscale"
                      />
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
                    <div className="mr-3 w-64">
                      <FormLabel>Telefono</FormLabel>
                      <TextField form={form} name="phone" type="tel" placeholder="Telefono" />
                    </div>
                  </div>
                  <div className="flex">
                    <div className="mr-3 mt-4 w-[235.33px]">
                      <div className="text-lg font-semibold">Indirizzo Sede</div>
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
                    <div className="pr-3 w-32">
                      <FormLabel>N. Civico</FormLabel>
                      <TextField
                        form={form}
                        name="address.houseNumber"
                        type="string"
                        placeholder="N. Civico"
                      />
                    </div>
                  </div>
                  <div className="flex">
                    <div className="pr-3 w-64">
                      <FormLabel>Provincia</FormLabel>
                      <SelectField
                        form={form}
                        name="address.province"
                        type="string"
                        placeholder={userCompany?.address?.province || 'Provincia'}
                        onChangeFunction={() =>
                          getCompanyCities(form.getValues('address.province'))
                        }
                        onClickFunction={() => getCompanyCities(form.getValues('address.province'))}
                        options={provinces}
                      />
                    </div>
                    <div className="pr-3 w-64">
                      <FormLabel>Comune</FormLabel>
                      <SelectField
                        form={form}
                        name="address.city"
                        type="string"
                        placeholder={userCompany?.address?.city || 'Comune'}
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
                        placeholder={userCompany?.address?.zipCode || 'CAP'}
                        options={companyZipCodes}
                      />
                    </div>
                    <div>
                      <FormLabel>Località:</FormLabel>
                      <TextField
                        form={form}
                        name="address.location"
                        type="string"
                        placeholder="Località"
                      />
                    </div>
                  </div>
                </div>
                <div className="w-2/5 flex flex-col">
                  <div className="h-full">
                    {showMap && <RenderMap location={location} markers={markers} zoom={15} />}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      btnStyle="slate"
                      className="mr-2"
                      onClick={() => history.goBack()}
                    >
                      &laquo; Annulla
                    </Button>
                    <Button>Aggiorna azienda</Button>
                  </div>
                </div>
              </div>
            </form>
          )}
          <div className="w-full">
            {fieldToUpdate === 'documenti' && <Documents userCompany={userCompany} />}
            {fieldToUpdate === 'updates' && (
              <UpdateEventsTable collectionName={'userCompanies'} id={params.id} />
            )}
          </div>
        </div>
      </WhiteBox>
      {showUserCompaniesModal ? (
        <UserCompaniesModal
          mode={'import'}
          userCompanyId={userCompany?._id}
          importedData={importedData}
          closeModal={closeModal}
          returnCompany={returnCompany}
        />
      ) : null}
    </Page>
  );
};

export default UserCompany;
