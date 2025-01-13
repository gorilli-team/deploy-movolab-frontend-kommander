import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { http } from '../../../utils/Utils';
import { CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR } from '../../../utils/Utils';
import { useLocation, useParams, useHistory } from 'react-router-dom';
import WhiteBox from '../../../components/UI/WhiteBox';
import TableHeaderTab from '../../../components/UI/TableHeaderTab';
import CardsHeader from '../../../components/UI/CardsHeader';

import AWS from 'aws-sdk';

import CorporatePage from '../../../components/Corporate/CorporatePage';

import Residence from '../../../components/Users/User/Residence';
import PersonalDetails from '../../../components/Users/User/PersonalDetails';
import DrivingLicense from '../../../components/Users/User/DrivingLicense';
import CustomerDetails from '../../../components/Users/User/CustomerDetails';
import UserUpdates from '../../../components/Users/User/UserUpdates';
import Documents from '../../../components/Users/User/Documents';
import ElementLabel from '../../../components/UI/ElementLabel';
import ToggleSwitch from '../../../components/UI/ToggleSwitch';

const CorporateUser = () => {
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: 'eu-west-1',
    signatureVersion: 'v4',
  });

  const form = useForm();
  const params = useParams();
  const search = useLocation().search;
  const history = useHistory();
  const section = new URLSearchParams(search).get('sezione');

  const [user, setUser] = useState(null);
  const [imgToUpload, setImgToUpload] = useState('');
  const [uploaded, setUploaded] = useState(false); //eslint-disable-line
  const [uploadingImg, setUploadingImg] = useState(); //eslint-disable-line
  const [avatar, setAvatar] = useState(undefined); //eslint-disable-line
  const [imageUrl, setImageUrl] = useState('');
  const imageUploadElement = useRef();

  const handleImageUploadClick = () => {
    imageUploadElement.current.click();
  };

  const fetchUser = async () => {
    try {
      const response = await http({ url: `/users/${params.id}` });
      setUser(response);

      form.setValue('name', response.name);
      form.setValue('surname', response.surname);
      form.setValue('residency.nation', response.residency?.nation);
      form.setValue('residency.address', response.residency?.address);
      form.setValue('residency.houseNumber', response.residency?.houseNumber);
      form.setValue('residency.city', response.residency?.city);
      form.setValue('residency.province', response.residency?.province);
      form.setValue('residency.zipCode', response.residency?.zipCode);
      form.setValue('email', response.email);
      form.setValue('phone', response.phone);
      form.setValue('fiscalCode', response.fiscalCode);
      form.setValue('gender', response.gender);
      form.setValue('birthDate', response.birthDate);
      form.setValue('cityOfBirth', response.cityOfBirth);
      form.setValue('imageUrl', response.imageUrl);
      if (response.imageUrl) setImageUrl(response.imageUrl);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const [fieldToUpdate, setFieldToUpdate] = useState(section || 'personal-details');

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
      Key: `USER-${Date.now()}.${file.name}`,
      Body: file,
    };
    setUploadingImg(true);
    const { Location } = await s3.upload(params).promise();
    form.setValue('imageUrl', Location);
    setUploadingImg(false);
    setUploaded(true);

    await http({
      method: 'PUT',
      url: `/users/${user._id}`,
      form: form.getValues(),
    });
    toast.success('Immagine aggiornata con successo');
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleUserStatus = async (status) => {
    try {
      await http({
        method: 'PUT',
        url: `/users/${params.id}`,
        form: { state: status },
      });
      toast.success('Stato utente aggiornato');
      onSubmit();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onSubmit = () => {
    fetchUser();
  };

  if (!user) return <CorporatePage />;

  return (
    <CorporatePage
      canAccess={[CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR]}
      bodyClassName={'px-2 pb-4'}
    >
      <CardsHeader
        title="Modifica persona"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
          },
          {
            children: 'Aggiorna Utente',
            form: 'saveUserForm',
            type: 'submit',
            hiddenIf: fieldToUpdate === 'documenti' || fieldToUpdate === 'updates',
          },
        ]}
      />
      <WhiteBox className="mt-0">
        <div className={`flex`}>
          {/* 1. Col intestazione */}
          <div className="flex-1 p-4">
            <h1 className="text-2xl font-semibold m-2">
              <strong className="font-medium">
                {user?.name || ''} {user?.surname || ''}
              </strong>
            </h1>

            {user && user.userType !== undefined && (
              <p className="font-semibold text-gray-600 uppercase m-2">
                {user?.userType === 'driver' ? (
                  <ElementLabel bgColor="bg-green-600">Conducente</ElementLabel>
                ) : user.userType === 'customer' ? (
                  <ElementLabel bgColor="bg-yellow-600">Cliente</ElementLabel>
                ) : (
                  ''
                )}
              </p>
            )}

            {user?.profession ? (
              <h3 className="text-lg m-2 mt-4">{user?.profession.replace(/_/g, ' ')}</h3>
            ) : null}
          </div>

          {/* 2. Col immagine */}
          <div className="flex-initial w-1/3 p-4">
            <div
              className="shadow-sm relative cursor-pointer"
              style={{
                backgroundImage: `url(${imgToUpload || imageUrl})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                borderRadius: '5em',
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

          {/* 3. Col stato utente */}
          <div className="flex-initial w-1/3 p-4">
            <div className="flex justify-end gap-4 py-2">
              <div className="flex flex-col items-end justify-center gap-2 min-w-[8rem]">
                <div className="font-semibold uppercase">
                  {user.state === 'attivo' ? (
                    <ElementLabel bgColor="bg-green-600 whitespace-nowrap">Attivo</ElementLabel>
                  ) : user.state === 'chiuso' ? (
                    <ElementLabel bgColor="bg-yellow-600 whitespace-nowrap">Chiuso</ElementLabel>
                  ) : (
                    <ElementLabel bgColor="bg-red-600 whitespace-nowrap">Annullato</ElementLabel>
                  )}
                </div>

                <ToggleSwitch
                  switches={[
                    {
                      label: 'ON',
                      onClick: (e) => {
                        toggleUserStatus('attivo');
                      },
                      selected: user.state === 'attivo',
                    },
                    {
                      label: 'OFF',
                      onClick: (e) => {
                        toggleUserStatus('chiuso');
                      },
                      selected: user.state === 'chiuso',
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        <TableHeaderTab
          buttons={[
            {
              label: 'Dati anagrafici',
              function: () => setFieldToUpdate('personal-details'),
              selected: fieldToUpdate === 'personal-details',
            },
            {
              label: 'Patente',
              function: () => setFieldToUpdate('driving-license'),
              selected: fieldToUpdate === 'driving-license',
            },
            {
              label: 'Residenza',
              function: () => setFieldToUpdate('residence'),
              selected: fieldToUpdate === 'residence',
            },
            {
              label: 'Stato Cliente',
              function: () => setFieldToUpdate('stato-cliente'),
              selected: fieldToUpdate === 'stato-cliente',
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
          {fieldToUpdate === 'personal-details' && (
            <PersonalDetails user={user} onSubmitUpdate={onSubmit} />
          )}
          {fieldToUpdate === 'driving-license' && (
            <DrivingLicense user={user} onSubmitUpdate={onSubmit} />
          )}
          {fieldToUpdate === 'residence' && <Residence user={user} onSubmitUpdate={onSubmit} />}
          {fieldToUpdate === 'stato-cliente' && (
            <CustomerDetails user={user} onSubmitUpdate={onSubmit} />
          )}
          {fieldToUpdate === 'documenti' && <Documents user={user} />}
          {fieldToUpdate === 'updates' && <UserUpdates user={user} />}
        </div>
      </WhiteBox>
    </CorporatePage>
  );
};

export default CorporateUser;
