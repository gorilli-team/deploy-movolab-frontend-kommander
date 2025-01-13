import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { http } from '../../../utils/Utils';

import { TextField } from '../../../components/Form/TextField';
import { SelectField } from '../../../components/Form/SelectField';
import Button from '../../UI/buttons/Button';
import SearchAddress from '../../Places/SearchAddress';
import ModalConfirmDialog from '../../UI/ModalConfirmDialog';

import {
  fetchCountries,
  fetchProvinces,
  getCityByProvince,
  getZipCodeByCity,
  checkAddressIsValid,
} from '../../../utils/Addresses';

import FormLabel from '../../UI/FormLabel';

const NewResidence = ({ type, updateSection, userId, returnUser, importUser, mode }) => {
  const form = useForm();

  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [residencyComuni, setResidencyComuni] = useState([]);
  const [zipCodes, setZipCodes] = useState([]);
  const [showAddress, setShowAddress] = useState(true);
  const [user, setUser] = useState({});
  const [showAddressConfirmationMessage, setShowAddressConfirmationMessage] = useState(false);

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async () => {
    try {
      const response = await http({ url: `/users/${userId}` });
      setUser(response);
      if (!response?.residency) return;

      const residency = response.residency;
      if (residency?.province) {
        setResidencyComuni(getCityByProvince(residency?.province));
      }
      if (residency?.city) {
        setZipCodes(getZipCodeByCity(residency?.city));
      }

      form.setValue('nation', residency?.nation);
      form.setValue('address', residency?.address);
      form.setValue('houseNumber', residency?.houseNumber);
      form.setValue('city', residency?.city);
      form.setValue('province', residency?.province);
      form.setValue('zipCode', residency?.zipCode);
      form.setValue('location', residency?.location);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const returnAddress = (address, address_components) => {
    form.setValue('nation', address_components.nation);
    form.setValue('address', address_components.street);
    form.setValue('houseNumber', address_components.houseNumber);
    form.setValue('province', address_components.province);
    getResidencyCities(address_components.province);
    form.setValue('city', address_components.city);
    fetchZipCodes(address_components.city);
    form.setValue('zipCode', address_components.zipCode);

    setShowAddress(true);
  };

  const onSubmitUser = async (data) => {
    try {
      const addressString =
        data?.address + ' ' +
        data?.houseNumber + ' ' +
        data?.city + ' ' +
        data?.zipCode + ' ' +
        data?.province + ' ' +
        data?.nation;

      const dataUpdate = { residency: data };

      await checkAddressIsValid(addressString).then((res) => {
        if (res === false) {
          setShowAddressConfirmationMessage(true);
        } else {
          updateUser(dataUpdate);
        }
      });
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const getUserDataAndUpdate = async () => {
    const data = form.getValues();
    data.residency = {
      nation: data.nation,
      address: data.address,
      houseNumber: data.houseNumber,
      province: data.province,
      city: data.city,
      zipCode: data.zipCode,
      location: data.location,
    };
    await updateUser(data);
  };

  const updateUser = async (data) => {
    const response = await http({
      method: 'PUT',
      url: `/users/${userId}`,
      form: data,
    });
    user.residency = data.residency;
    toast.success('Utente aggiornato');

    if (type === 'driver' || type === 'secondDriver') {
      updateSection('driving-license');
    } else {
      returnUser(response);
      updateSection('modal-completed');
    }
  };

  useEffect(() => {
    getCountries();
    getProvinces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCountries = async () => {
    setCountries(await fetchCountries());
  };

  const getProvinces = () => {
    setProvinces(fetchProvinces());
  };

  const getResidencyCities = (province) => {
    try {
      if (province !== '') {
        const cities = (getCityByProvince(province));
        setResidencyComuni(cities);

        if (cities.length > 0) {
          form.setValue('city', cities?.[0]?.value);
          fetchZipCodes(cities?.[0]?.value);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchZipCodes = (city) => {
    try {
      if (city !== '') {
        const zips = getZipCodeByCity(city);
        setZipCodes(zips);

        if (zips.length > 0) {
          form.setValue('zipCode', zips?.[0]?.value);
        }
      }

    } catch (err) {
      console.error(err);
    }
  };

  const importUserFunction = async (e) => {
    e.preventDefault();
    try {
      importUser(userId);
    } catch (err) {
      console.error(err);
    }
  };

  const cancelButton = async () => {
    setShowAddressConfirmationMessage(false);
  };

  const confirmButton = async () => {
    await getUserDataAndUpdate();
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmitUser)}>
        <div>
          <div className="text-lg font-semibold">Residenza</div>
          <div className="flex flex-wrap md:flex-nowrap gap-x-2">
            <SearchAddress returnAddress={returnAddress} onChange={() => { }} placeholder="Cerca e autocompleta..." />
          </div>
          {showAddress && (
            <div>
              <div className="flex flex-wrap md:flex-nowrap gap-x-2">
                <div className="w-full md:w-64">
                  <FormLabel>Nazione</FormLabel>
                  <SelectField
                    form={form}
                    name="nation"
                    type="string"
                    placeholder="Nazione"
                    validation={{
                      required: { value: true, message: 'Seleziona una nazione' },
                    }}
                    options={countries}
                  />
                </div>
              </div>

              <div className="flex flex-wrap md:flex-nowrap gap-x-2">
                <div className="w-full md:w-64">
                  <FormLabel>Indirizzo</FormLabel>
                  <TextField
                    form={form}
                    name="address"
                    type="string"
                    placeholder="Indirizzo"
                    validation={{
                      required: { value: true, message: 'Inserisci un indirizzo' },
                    }}
                  />
                </div>
                <div className="w-full md:w-64">
                  <FormLabel>N. Civico</FormLabel>
                  <TextField
                    form={form}
                    name="houseNumber"
                    placeholder="N. Civico"
                    type="string"
                    validation={{
                      required: { value: true, message: 'Inserisci un numero civico' },
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-x-2">
                <div className="w-full md:w-64">
                  <FormLabel>Provincia</FormLabel>
                  {form.watch('nation') === 'Italia' ? (
                    <SelectField
                      form={form}
                      name="province"
                      type="string"
                      placeholder="Provincia"
                      validation={{
                        required: { value: true, message: 'Seleziona una provincia' },
                      }}
                      onChangeFunction={() => {
                        getResidencyCities(form.getValues('province'));
                      }}
                      options={provinces}
                    />
                  ) : (
                    <TextField
                      form={form}
                      name="province"
                      type="string"
                      placeholder="Provincia"
                      validation={{
                        required: { value: true, message: 'Inserisci una provincia' },
                      }}
                    />
                  )}
                </div>
                <div className="w-full md:w-64">
                  <FormLabel>Comune</FormLabel>
                  {form.watch('nation') === 'Italia' ? (
                    <SelectField
                      form={form}
                      name="city"
                      type="string"
                      placeholder={user?.residency?.city || 'Comune'}
                      validation={{
                        required: { value: true, message: 'Seleziona un comune' },
                      }}
                      onChangeFunction={(e) =>
                        fetchZipCodes(e.target.value)
                      }
                      options={residencyComuni}
                    />
                  ) : (
                    <TextField
                      form={form}
                      name="city"
                      type="string"
                      placeholder="Comune"
                      validation={{
                        required: { value: true, message: 'Inserisci un comune' },
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-x-2">
                <div className="w-full md:w-64">
                  <FormLabel>CAP</FormLabel>
                  {form.watch('nation') === 'Italia' ? (
                    <SelectField
                      form={form}
                      name="zipCode"
                      type="string"
                      placeholder={user?.residency?.zipCode || 'CAP'}
                      options={zipCodes}
                      validation={{
                        required: { value: true, message: 'Seleziona un CAP' },
                      }}
                    />
                  ) : (
                    <TextField
                      form={form}
                      name="zipCode"
                      type="string"
                      placeholder="CAP"
                      validation={{
                        required: { value: true, message: 'Inserisci un CAP' },
                      }}
                    />
                  )}
                </div>
                <div className="w-full md:w-64">
                  <FormLabel>Località</FormLabel>
                  <TextField
                    form={form}
                    name="location"
                    type="string"
                    placeholder="Località"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-2">
            <Button btnStyle="white" className="!py-1"
              onClick={(e) => {
                e.preventDefault();
                updateSection('personal-details');
              }}
            >
              Indietro
            </Button>
            {showAddress ? (
              <>
                {type === 'driver' || type === 'secondDriver' ? (
                  <Button btnStyle="white" className="!py-1">Avanti</Button>
                ) : (
                  <Button btnStyle="blue" className="!py-1">{mode === 'modify' ? 'Salva' : 'Completa'}</Button>
                )}
                {mode === 'import' ? (
                  <Button btnStyle="gray" className="!py-1"
                    onClick={(e) => {
                      importUserFunction(e);
                    }}
                  >
                    Importa Utente
                  </Button>
                ) : (
                  <></>
                )}
              </>
            ) : null}
          </div>
        </div>

        <ModalConfirmDialog
          isVisible={showAddressConfirmationMessage}
          handleCancel={cancelButton}
          handleOk={confirmButton}
          title="Non è possibile verificare l'indirizzo."
          description="Vuoi salvarlo lo stesso?"
          okText="Salva e continua"
        />
      </form>
    </>
  );
};

export default NewResidence;
