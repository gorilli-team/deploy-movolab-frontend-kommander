import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { http } from '../../../utils/Utils';
import { Link } from 'react-router-dom';

import { TextField } from '../../../components/Form/TextField';
import { SelectField } from '../../../components/Form/SelectField';
import Button from '../../UI/buttons/Button';
import FormLabel from '../../UI/FormLabel';

import DocumentUploader from '../../Form/DocumentUploader';
import { FaPen } from 'react-icons/fa';
import moment from 'moment';

const NewDrivingLicense = ({ type, updateSection, userId, returnUser, mode }) => {
  const form = useForm();
  const [documents, setDocuments] = useState([]);
  const [drivingLicenseFront, setDrivingLicenseFront] = useState(null);
  const [drivingLicenseBack, setDrivingLicenseBack] = useState(null);

  const getDrivingLicensePictures = (documents) => {
    const drivingLicensePictures = documents.filter((document) => {
      if (!document.name) return false;
      if (document.name === 'Patente Fronte') {
        setDrivingLicenseFront(document.fileUrl);
      }
      if (document.name === 'Patente Retro') {
        setDrivingLicenseBack(document.fileUrl);
      }

      return document.name === 'Patente Fronte' || document.name === 'Patente Retro';
    });
    return drivingLicensePictures;
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async () => {
    try {
      const response = await http({ url: `/users/${userId}` });
      setDocuments(response.documents);
      getDrivingLicensePictures(response.documents);

      if (!response && !response.drivingLicense) {
      } else {
        form.setValue('number', response?.drivingLicense?.number);
        form.setValue('category', response?.drivingLicense?.category);
        form.setValue('releasedBy', response?.drivingLicense?.releasedBy);
        if (
          response?.drivingLicense?.releaseDate === null ||
          response?.drivingLicense?.releaseDate === undefined
        ) {
          form.setValue('releaseDate', '');
        } else {
          form.setValue(
            'releaseDate',
            new Date(response.drivingLicense?.releaseDate).toISOString().split('T')[0],
          );
        }
        if (
          response?.drivingLicense?.expirationDate === null ||
          response?.drivingLicense?.expirationDate === undefined
        ) {
          form.setValue('expirationDate', '');
        } else {
          form.setValue(
            'expirationDate',
            new Date(response.drivingLicense?.expirationDate).toISOString().split('T')[0],
          );
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const uploadDocumentUrl = async (url, name = undefined) => {
    const document = { url, name };
    document.fileUrl = url;

    try {
      if (url) {
        await http({
          method: 'PUT',
          url: `/users/document/${userId}`,
          form: document,
        });
      }
      toast.success('Patente inserita');
      setDocuments([...documents, document]);
      if (name === 'Patente Fronte') setDrivingLicenseFront(url);
      if (name === 'Patente Retro') setDrivingLicenseBack(url);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onSubmitUser = async (data) => {
    try {
      if (mode !== 'import') {
        if (!data.number) {
          toast.error('Inserire numero patente');
          return;
        }
        if (!data.category) {
          toast.error('Inserire categoria patente');
          return;
        }
        if (!data.releasedBy) {
          toast.error('Inserire rilasciata da');
          return;
        }
        if (!data.releaseDate) {
          toast.error('Inserire data rilascio');
          return;
        }
        if (!data.expirationDate) {
          toast.error('Inserire data scadenza');
          return;
        }
        if (data.releaseDate > data.expirationDate) {
          toast.error('Data rilascio maggiore di data scadenza');
          return;
        }
        if (data.releaseDate >= new Date(new Date()).toISOString().split('T')[0]) {
          toast.error('Data rilascio minore di data odierna');
          return;
        }
        if (data.expirationDate <= new Date(new Date()).toISOString().split('T')[0]) {
          toast.error('Patente scaduta');
          return;
        }
        if (!drivingLicenseFront) {
          toast.error('Inserire patente fronte');
          return;
        }
        if (!drivingLicenseBack) {
          toast.error('Inserire patente retro');
          return;
        }
      }

      data.drivingLicense = {
        number: data.number,
        category: data.category,
        releasedBy: data.releasedBy,
        releaseDate: data.releaseDate,
        expirationDate: data.expirationDate,
      };

      delete data.number;
      delete data.category;
      delete data.releasedBy;
      delete data.releaseDate;
      delete data.expirationDate;

      const response = await http({
        method: 'PUT',
        url: `/users/${userId}`,
        form: data,
      });
      returnUser(response);
      updateSection('modal-completed');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmitUser)}>
      <div>
        <div>
          {(type === 'driver' || type === 'secondDriver') && (
            <>
              <div className="text-lg font-semibold">Patente</div>
              <div className="flex flex-wrap md:flex-nowrap gap-x-2">
                <div className="w-8/12 md:w-64">
                  <FormLabel>Numero:</FormLabel>
                  <TextField
                    form={form}
                    name="number"
                    type="string"
                    placeholder="Numero"
                    disabled={mode === 'import' ? true : false}
                    validation={{
                      required: {
                        value: mode !== 'import',
                        message: 'Numero patente obbligatorio',
                      },
                    }}
                  />
                </div>
                <div className="w-full md:w-32">
                  <FormLabel>Categoria</FormLabel>
                  <SelectField
                    form={form}
                    name="category"
                    type="string"
                    placeholder="Categoria"
                    disabled={mode === 'import' ? true : false}
                    options={[
                      { value: 'B', label: 'B' },
                      { value: 'C', label: 'C' },
                      { value: 'D', label: 'D' },
                      { value: 'E', label: 'E' },
                    ]}
                  />
                </div>
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-x-2">
                <div className="w-full md:w-64">
                  <FormLabel>Rilasciata da</FormLabel>
                  <TextField
                    form={form}
                    name="releasedBy"
                    type="string"
                    placeholder="Rilasciata da"
                    validation={{
                      required: {
                        value: mode !== 'import',
                        message: 'Rilasciata da obbligatorio',
                      },
                    }}
                    disabled={mode === 'import' ? true : false}
                  />
                </div>
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-x-2">
                <div className="w-full md:w-64">
                  <FormLabel>Data rilascio</FormLabel>
                  <TextField
                    form={form}
                    name="releaseDate"
                    type="date"
                    max={new moment().subtract(1, 'days').format('YYYY-MM-DD')}
                    placeholder="Data rilascio"
                    disabled={mode === 'import' ? true : false}
                    validation={{
                      required: {
                        value: mode !== 'import',
                        message: 'Data rilascio obbligatoria',
                      },
                    }}
                  />
                </div>
                <div className="w-full md:w-64">
                  <FormLabel>Data scadenza</FormLabel>
                  <TextField
                    form={form}
                    name="expirationDate"
                    type="date"
                    min={
                      form.getValues('releaseDate') ||
                      new Date(new Date()).toISOString().split('T')[0]
                    }
                    placeholder="Data scadenza"
                    disabled={mode === 'import' ? true : false}
                    validation={{
                      required: {
                        value: mode !== 'import',
                        message: 'Data scadenza obbligatoria',
                      },
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-x-2">
                <div className="w-full md:w-64">
                  <Link
                    className="flex space-x-1"
                    to={`/dashboard/utenti/persona/${userId}?sezione=documenti`}
                    target="_blank"
                  >
                    <FormLabel>
                      Patente Fronte <FaPen className="inline" />
                    </FormLabel>
                  </Link>
                  <div>
                    {drivingLicenseFront ? (
                      <img
                        style={{ height: '100px' }}
                        src={drivingLicenseFront}
                        alt="Patente Fronte"
                      />
                    ) : (
                      <DocumentUploader
                        uploadDocumentUrl={uploadDocumentUrl}
                        name="Patente Fronte"
                      ></DocumentUploader>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-64">
                  <Link
                    className="flex space-x-1"
                    to={`/dashboard/utenti/persona/${userId}?sezione=documenti`}
                    target="_blank"
                  >
                    <FormLabel>
                      Patente Retro <FaPen className="inline" />
                    </FormLabel>
                  </Link>

                  <div>
                    {drivingLicenseBack ? (
                      <img
                        style={{ height: '100px' }}
                        src={drivingLicenseBack}
                        alt="Patente Retro"
                      />
                    ) : (
                      <DocumentUploader
                        uploadDocumentUrl={uploadDocumentUrl}
                        name="Patente Retro"
                      ></DocumentUploader>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            btnStyle="white"
            className="!py-1"
            onClick={(e) => {
              e.preventDefault();
              updateSection('residence');
            }}
          >
            Indietro
          </Button>
          {mode === 'import' ? (
            <Button btnStyle="white" className="!py-1">
              Importa Utente
            </Button>
          ) : (
            <Button btnStyle="blue" className="!py-1">
              Completa
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default NewDrivingLicense;
