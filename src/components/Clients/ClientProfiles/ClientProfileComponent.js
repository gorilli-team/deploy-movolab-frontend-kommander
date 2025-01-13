import React, { useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { TextField } from '../../../components/Form/TextField';
import FormLabel from '../../../components/UI/FormLabel';
import Button from '../../../components/UI/buttons/Button';
import { UserContext } from '../../../store/UserContext';

import { useForm } from 'react-hook-form';
import AWS from 'aws-sdk';

import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR, http } from '../../../utils/Utils';
import ElementLabel from '../../UI/ElementLabel';
import { FaPencil } from 'react-icons/fa6';

//eslint-disable-next-line
const ClientProfileComponent = ({}) => {
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: 'eu-west-1',
    signatureVersion: 'v4',
  });
  const userContext = useContext(UserContext);

  const form = useForm();
  const [userData, setUserData] = useState({});

  useEffect(() => {
    getClientProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getClientProfileData = async () => {
    const profile = await userContext.getUserInfo();
    setUserData(profile);

    form.setValue('email', profile.email);
    form.setValue('fullname', profile.fullname);
    form.setValue('imageUrl', profile.imageUrl);
    if (profile.imageUrl) setImageUrl(profile.imageUrl);
  };

  const [imgToUpload, setImgToUpload] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const imageUploadElement = useRef();

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
      await http({
        method: 'PUT',
        url: `/clientProfile/${userData._id}`,
        form: data,
      });
      toast.success('Profilo aggiornato');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <div>
      <h2 className="font-semibold text-gray-800 text-2xl mb-3">Profilo</h2>
      {userData.role === CLIENT_ROLE_ADMIN && (
        <ElementLabel bgColor="bg-blue-500">Amministratore</ElementLabel>
      )}
      {userData.role === CLIENT_ROLE_OPERATOR && <ElementLabel>Operatore</ElementLabel>}

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={form.formState.isSubmitting}>
          <div className="flex flex-wrap md:flex-nowrap gap-4">
            <div className="w-full md:w-1/2">
              <div className="max-w-sm">
                <FormLabel>Email</FormLabel>
                <TextField
                  form={form}
                  name="email"
                  type="text"
                  placeholder="Email"
                  disabled={true}
                  autofocus
                />
              </div>

              <div className="max-w-sm">
                <FormLabel>Nome completo</FormLabel>
                <TextField form={form} name="fullname" type="text" placeholder="Nome completo" />
              </div>
            </div>

            <div
              className="shadow-sm relative cursor-pointer group w-full md:w-1/2"
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
              <div className="rounded-full aspect-square bg-slate-50 p-2 shadow absolute bottom-0 right-0 text-sm text-slate-600 group-hover:bg-slate-100">
                <FaPencil />
              </div>
            </div>
          </div>
          <div className="pt-3">
            <Button>Aggiorna</Button>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default ClientProfileComponent;
