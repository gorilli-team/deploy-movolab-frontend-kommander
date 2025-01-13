import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import AWS from 'aws-sdk';

import { TextField } from '../../../components/Form/TextField';
import { SelectField } from '../../../components/Form/SelectField';
import {
  MOVOLAB_ROLE_ADMIN,
  CLIENT_ROLE_ADMIN,
  CLIENT_ROLE_OPERATOR,
  http,
} from '../../../utils/Utils';
import FormLabel from '../../../components/UI/FormLabel';
import AdminPage from '../../../components/Admin/AdminPage';
import ElementLabel from '../../../components/UI/ElementLabel';
import CardsHeader from '../../../components/UI/CardsHeader';
import WhiteBox from '../../../components/UI/WhiteBox';
import ToggleSwitch from '../../../components/UI/ToggleSwitch';
import ClientProfilePasswordModal from '../../../components/Clients/ClientProfiles/ClientProfilePasswordModal';

const ClientProfile = () => {
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: 'eu-west-1',
    signatureVersion: 'v4',
  });
  const form = useForm();
  //eslint-disable-next-line
  const [userData, setUserData] = useState({});

  const params = useParams();
  const history = useHistory();
  const search = useLocation().search;

  const [clientAccount, setClientAccount] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imgToUpload, setImgToUpload] = useState('');
  const imageUploadElement = useRef();

  const mode = params.id ? 'edit' : 'create';

  useEffect(() => {
    fetchClientAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disableClientAccount = async () => {
    try {
      await http({
        method: 'PUT',
        url: `/clientProfile/${params.id}`,
        form: { enabled: !clientAccount.enabled },
      });
      toast.success('Profilo Cliente disabilitato');
      await fetchClientAccount();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const sendActivationEmail = async () => {
    try {
      await http({
        method: 'PUT',
        url: `/clientProfile/sendActivationEmail/${params.id}`,
      });
      toast.success('Email di attivazione inviata');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchClientAccount = async () => {
    try {
      if (mode === 'edit') {
        const response = await http({ url: `/clientProfile/${params.id}` });
        setClientAccount(response);
        form.setValue('fullname', response.fullname);
        form.setValue('email', response.email);
        form.setValue('role', response.role);
        form.setValue('imageUrl', response.imageUrl);
        if (response.imageUrl) setImageUrl(response.imageUrl);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const handleImageUploadClick = () => {
    imageUploadElement.current.click();
  };

  const imageChangeHandler = async (event) => {
    if (!event.target.files?.length) return;

    setImgToUpload(URL.createObjectURL(event.target.files[0]));
    // setAvatar(event.target.files[0]);
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
    // setUploadingImg(true);
    const { Location } = await s3.upload(params).promise();
    form.setValue('imageUrl', Location);
    // setUploadingImg(false);
    // setUploaded(true);

    await http({
      method: 'PUT',
      url: `/clientProfile/${userData._id}`,
      form: form.getValues(),
    });
    toast.success('Immagine aggiornata con successo');
  };

  const onSubmit = async (data) => {
    try {
      if (mode === 'create') {
        await http({
          method: 'POST',
          url: '/clientProfile/create',
          form: data,
        });
        toast.success('Profilo Cliente aggiunto');
        history.goBack();
      } else if (mode === 'edit') {
        await http({
          method: 'PUT',
          url: `/clientProfile/${params.id}`,
          form: data,
        });
        toast.success('Profilo Cliente aggiornato');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <AdminPage canAccess={[MOVOLAB_ROLE_ADMIN]} hasBox={false}>
      <CardsHeader
        title={mode === 'edit' ? 'Aggiorna Profilo Cliente' : 'Nuovo Profilo Cliente'}
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => {
              history.goBack();
            },
          },
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Reinvia Email di Attivazione',
            onClick: () => {
              sendActivationEmail();
            },
          },
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Imposta Password',
            onClick: () => {
              setShowPasswordModal(true);
            },
          },
          {
            children: mode === 'edit' ? 'Aggiorna profilo' : 'Crea profilo',
            form: 'clientAccount',
          },
        ]}
      />

      <WhiteBox className="mt-0 p-4">
        {mode === 'edit' && (
          <div className="flex p-3 gap-x-4 mb-4">
            <div className="flex-1">
              <div className="text-3xl font-semibold">{clientAccount?.fullname}</div>
              <div className="text-md">{clientAccount?.email}</div>
            </div>
            <div className="text-right p-1">
              <div className="flex mb-4">
                <div className="ml-2">
                  <ElementLabel>{clientAccount?.client?.ragioneSociale}</ElementLabel>
                </div>
                <div className="ml-2">
                  {clientAccount?.enabled ? (
                    <ElementLabel bgColor="bg-green-600">Abilitato</ElementLabel>
                  ) : (
                    <ElementLabel bgColor="bg-red-600">Disabilitato</ElementLabel>
                  )}
                </div>
                <div className="ml-2">
                  {clientAccount?.isVerified ? (
                    <ElementLabel bgColor="bg-green-600">Verificato</ElementLabel>
                  ) : (
                    <ElementLabel bgColor="bg-red-600">Non Verificato</ElementLabel>
                  )}
                </div>
              </div>

              <ToggleSwitch
                switches={[
                  {
                    label: 'ON',
                    onClick: (e) => {
                      disableClientAccount();
                    },
                    selected: clientAccount?.enabled,
                  },
                  {
                    label: 'OFF',
                    onClick: (e) => {
                      disableClientAccount();
                    },
                    selected: !clientAccount?.enabled,
                  },
                ]}
              />
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <div className="flex-1">
            <form onSubmit={form.handleSubmit(onSubmit)} id="clientAccount">
              <fieldset disabled={form.formState.isSubmitting}>
                <div className="max-w-sm">
                  <FormLabel>Nome Profilo Cliente</FormLabel>
                  <TextField
                    form={form}
                    name="fullname"
                    type="string"
                    placeholder="Nome Profilo Cliente"
                    validation={{
                      required: { value: true, message: 'Nome Profilo Cliente' },
                    }}
                  />
                  <FormLabel>Email</FormLabel>
                  <TextField form={form} name="email" type="string" placeholder="Email" />

                  <FormLabel>Ruolo</FormLabel>
                  <SelectField
                    name="role"
                    form={form}
                    options={[
                      { value: CLIENT_ROLE_ADMIN, label: 'Amministratore' },
                      { value: CLIENT_ROLE_OPERATOR, label: 'Operatore' },
                    ]}
                    placeholder="Ruolo"
                  />
                </div>
              </fieldset>
            </form>
          </div>
          <div className="p-4 text-right">
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
                backgroundColor: !imgToUpload && !imageUrl ? '#E8E8E8' : 'transparent', // lighter gray background if no image
                border: !imgToUpload && !imageUrl ? '1px solid #000' : 'none', // dark border if no image
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
      </WhiteBox>
      {showPasswordModal && (
        <ClientProfilePasswordModal closeModal={() => setShowPasswordModal(false)} />
      )}
    </AdminPage>
  );
};

export default ClientProfile;
