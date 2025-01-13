import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { UserContext } from '../../../store/UserContext';
import SettingsPage from '../../../components/Settings/SettingsPage';
import TableHeader from '../../../components/UI/TableHeader';
import CargosSubmissionsTable from '../../../components/Cargos/CargosSubmissionsTable';

import { CLIENT_ROLE_ADMIN } from '../../../utils/Utils';

import { http } from '../../../utils/Utils';
import FormLabel from '../../../components/UI/FormLabel';
import { TextField } from '../../../components/Form/TextField';
import Button from '../../../components/UI/buttons/Button';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const Cargos = () => {
  const form = useForm();

  useEffect(() => {
    fetchCargosCredentials();
  }, []);

  const { data: userData } = useContext(UserContext);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [apiMessage, setApiMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [cargosUserName, setCargosUsername] = useState('');
  const [cargosPassword, setCargosPassword] = useState('');
  const [cargosApiKey, setCargosApiKey] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);

  form.setValue('cargos.user_name_field', cargosUserName);
  form.setValue('cargos.pass_word_field', cargosPassword);
  form.setValue('cargos.api_key', cargosApiKey);

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleApiKeyVisibility = (e) => {
    e.preventDefault();
    setIsApiKeyVisible(!isApiKeyVisible);
  };

  const fetchCargosCredentials = async () => {
    try {
      const response = await http({
        url: '/clients/cargos/decrypt-cargos-credentials',
      });
      setCargosUsername(response.username);
      setCargosPassword(response.password);
      setCargosApiKey(response.apiKey);
    } catch (error) {
      console.error('error', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      await http({
        method: 'POST',
        url: `/clients/cargos/save-cargos-credentials`,
        form: data, // Correctly send the data object
      });
      toast.success('Credenziali CARGOS aggiornate');
    } catch (err) {
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const testApi = async () => {
    try {
      setIsSuccess(false);
      setApiMessage('');
      const result = await http({
        method: 'POST',
        url: `/clients/cargos/check-cargos-connection`,
      });
      if (result?.success) {
        setApiMessage('Connessione API Funzionante!');
        setIsSuccess(true);
      } else {
        setApiMessage('Connessione API Fallita!');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('error', error);
      setApiMessage('Connessione API Fallita!');
      setIsSuccess(false);
    }
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN]}>
      <TableHeader
        tableName={'Cargos'}
        buttons={[
          {
            function: () => {
              setShowCredentials(!showCredentials);
            },
            label: showCredentials === true ? 'Vedi Invii' : 'Vedi Credenziali',
            hidden: userData?.client.license?.licenseOwner === 'movolab',
          },
        ]}
      />
      <>
        {showCredentials ? (
          <div className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} id="clientInfoForm">
              <fieldset disabled={form.formState.isSubmitting}>
                <div className="flex flex-wrap">
                  <div className="mr-3 w-64">
                    <FormLabel>Utente</FormLabel>
                    <TextField
                      form={form}
                      name="cargos.user_name_field"
                      type="text"
                      placeholder="Username"
                      value={cargosUserName}
                      onChange={(e) => setCargosUsername(e.target.value)}
                      autoComplete="new-username"
                      required
                    />
                  </div>
                  <div className="mr-3 w-64">
                    <FormLabel>Password</FormLabel>
                    <div className="relative flex items-center">
                      <TextField
                        form={form}
                        name={'cargos.pass_word_field'}
                        type={isPasswordVisible ? 'text' : 'password'}
                        placeholder="Password"
                        className="pr-10"
                        autoComplete="new-password"
                        required
                      />
                      <Button
                        type="button"
                        btnStyle={'inFormStyleBlack'}
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-2 flex items-center"
                      >
                        {isPasswordVisible ? 'Nascondi' : 'Mostra'}
                      </Button>
                    </div>
                  </div>
                  <div className="mr-3">
                    <FormLabel>API Key</FormLabel>
                    <div className="relative flex items-center">
                      <TextField
                        form={form}
                        name={'cargos.api_key'}
                        type={isApiKeyVisible ? 'text' : 'password'}
                        placeholder="API Key"
                        className="pr-10"
                        required
                      />
                      <Button
                        type="button"
                        btnStyle={'inFormStyleBlack'}
                        onClick={toggleApiKeyVisibility}
                        className="absolute inset-y-0 right-2 flex items-center"
                      >
                        {isApiKeyVisible ? 'Nascondi' : 'Mostra'}
                      </Button>
                    </div>
                  </div>
                  <div className="mr-3 mt-3">
                    <Button type="submit" className="mt-4 bg-blue-500 text-white">
                      Salva
                    </Button>
                  </div>
                </div>
              </fieldset>
            </form>
            <div className="mr-3 mt-3">
              <Button type="button" btnStyle={'lightGray'} onClick={testApi} className="mt-4">
                Verifica Connessione API
              </Button>
            </div>
            {apiMessage && (
              <div
                className={`mt-2 flex items-center p-2 rounded-md ${
                  isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {isSuccess ? (
                  <FaCheckCircle className="mr-2" />
                ) : (
                  <FaExclamationCircle className="mr-2" />
                )}
                {apiMessage}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <CargosSubmissionsTable />
          </div>
        )}
      </>
    </SettingsPage>
  );
};

export default Cargos;
