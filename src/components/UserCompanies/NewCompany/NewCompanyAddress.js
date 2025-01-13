import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { http } from '../../../utils/Utils';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../../store/UserContext';
import FormLabel from '../../UI/FormLabel';
import { SelectField } from '../../Form/SelectField';
import { TextField } from '../../Form/TextField';
import SearchAddress from '../../Places/SearchAddress';
import ModalConfirmDialog from '../../UI/ModalConfirmDialog';
import Button from '../../UI/buttons/Button';

import {
  fetchCountries,
  fetchProvinces,
  getCityByProvince,
  getZipCodeByCity,
  checkAddressIsValid,
} from '../../../utils/Addresses';

const NewCompanyAddress = ({ updateSection, userCompanyId, returnUserCompany, closeModal, mode = 'add' }) => {
  const form = useForm();
  const history = useHistory();
  const { data: currentClient } = useContext(UserContext);
  const [countries, setCountries] = useState([]);
  const [comuni, setComuni] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [zipCodes, setZipCodes] = useState([]);
  const [showAddress, setShowAddress] = useState(true);
  const [showAddressConfirmationMessage, setShowAddressConfirmationMessage] = useState(false);
  const [storedData, setStoredData] = useState({});

  useEffect(() => {
    fetchUserCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserCompany = async () => {
    try {
      const response = await http({ url: `/userCompanies/${userCompanyId}` });
      if (!response?.address) return;

      const address = response.address;
      if (address?.province) {
        setComuni(getCityByProvince(address?.province));
      }
      if (address?.city) {
        setZipCodes(getZipCodeByCity(address?.city));
      }
      
      form.setValue('nation', address?.nation);
      form.setValue('address', address?.address);
      form.setValue('houseNumber', address?.houseNumber);
      form.setValue('city', address?.city);
      form.setValue('province', address?.province);
      form.setValue('zipCode', address?.zipCode);
      form.setValue('location', address?.location);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
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

  const getCities = (province) => {
    try {
      if (province !== '') {
        const cities = (getCityByProvince(province));
        setComuni(cities);

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

  const returnAddress = async (address, address_components) => {
    form.setValue('nation', address_components.nation);
    form.setValue('address', address_components.street);
    form.setValue('houseNumber', address_components.houseNumber);
    form.setValue('province', address_components.province);
    getCities(address_components.province);
    form.setValue('city', address_components.city);
    fetchZipCodes(address_components.city);
    form.setValue('zipCode', address_components.zipCode);

    setShowAddress(true);
  };

  const updateUserCompany = async (data) => {
    try {
      const response = await http({
        method: 'PUT',
        url: `/userCompanies/${userCompanyId}`,
        form: { ...data, client: currentClient.client._id },
      });
      toast.success('Azienda aggiunta');
      if (returnUserCompany) {
        returnUserCompany(response);
        closeModal();
      } else {
        history.push(`/dashboard/utenti/azienda/${response?._id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const cancelButton = () => {
    setShowAddressConfirmationMessage(false);
  };

  const confirmButton = () => {
    updateUserCompany(storedData);
    setShowAddressConfirmationMessage(false);
  };

  const onSubmitCompany = async (data) => {
    try {
      try {
        const addressString =
          data?.address + ' ' +
          data?.houseNumber + ' ' +
          data?.city + ' ' +
          data?.zipCode + ' ' +
          data?.province + ' ' +
          data?.nation;

        const dataUpdate = { address: data };

        setStoredData(dataUpdate);

        await checkAddressIsValid(addressString).then((res) => {
          if (res === false) {
            setShowAddressConfirmationMessage(true);
          } else {
            updateUserCompany(dataUpdate);
          }
        });
      } catch (err) {
        console.error(err);
        toast.error(err?.reason?.error || 'Errore');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (<>
    <form onSubmit={form.handleSubmit(onSubmitCompany)}>
      <div>
        <div className="w-full">
          <div className="text-lg font-semibold">Indirizzo Sede</div>
        </div>
        <div className="flex">
          <SearchAddress returnAddress={returnAddress} onChange={() => {}} />
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
              <div className=" w-full md:w-64">
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
                      getCities(form.getValues('province'));
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
                    placeholder={'Comune'}
                    validation={{
                      required: { value: true, message: 'Seleziona un comune' },
                    }}
                    onChangeFunction={(e) =>
                      fetchZipCodes(e.target.value)
                    }
                    options={comuni}
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
                    placeholder={'CAP'}
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
      </div>
      <div className="mt-2 flex justify-end">
        <Button btnStyle="white" className="!py-1" onClick={(e) => {
          e.preventDefault();
          updateSection('data');
        }}>Indietro</Button>
        <Button btnStyle="blue" className="!py-1">{mode === 'modify' ? 'Salva' : 'Completa'}</Button>
      </div>
    </form>

    <ModalConfirmDialog
      isVisible={showAddressConfirmationMessage}
      handleCancel={cancelButton}
      handleOk={confirmButton}
      title="Non è possibile verificare l'indirizzo."
      description="Vuoi salvarlo lo stesso?"
      okText="Salva e continua"
    />
  </>
  );
};

export default NewCompanyAddress;
