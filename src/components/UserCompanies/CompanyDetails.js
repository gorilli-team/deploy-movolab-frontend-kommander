import React, { useState } from 'react';
import { http } from '../../utils/Utils';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import ImageUploader from '../Form/ImageUploader';

import toast from 'react-hot-toast';

const CompanyDetails = ({ user }) => {
  const form = useForm();
  const params = useParams();
  const [documentUrl, setDocumentUrl] = useState('');

  const onSubmit = async (data) => {
    try {
      await http({
        method: 'PUT',
        url: `/users/${params.id}`,
        form: data,
      });
      toast.success('Utente aggiornato');
      user.drivingLicense = data.drivingLicense;
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const updateImageUrl = (url) => {
    form.setValue('imageUrl', url);
    setDocumentUrl(url);
  };

  if (!user) {
  } else {
    form.setValue('drivingLicense.number', user?.drivingLicense?.number);
    form.setValue('drivingLicense.category', user?.drivingLicense?.category);
    form.setValue('drivingLicense.releasedBy', user?.drivingLicense?.releasedBy);
    user?.drivingLicense?.releaseDate &&
      form.setValue(
        'drivingLicense.releaseDate',
        new Date(user?.drivingLicense?.releaseDate).toISOString().split('T')[0],
      );
    user?.drivingLicense?.expirationDate &&
      form.setValue(
        'drivingLicense.expirationDate',
        new Date(user?.drivingLicense?.expirationDate).toISOString().split('T')[0],
      );
  }

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="col-span-2">
          <p className="text-lg mb-5" style={{ borderBottom: '3px solid #1E293B' }}>
            <b>Documenti</b>
            {/*drivinglicense*/}
          </p>
          <div className="pr-2">
            <ImageUploader imageUrl={documentUrl} updateImageUrl={updateImageUrl}></ImageUploader>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanyDetails;
