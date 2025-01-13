import React, { useEffect, useState } from 'react';
import { http } from '../../../utils/Utils';
import toast from 'react-hot-toast';

import { useParams } from 'react-router-dom';
import FormLabel from '../../UI/FormLabel';
import { useForm } from 'react-hook-form';
import { TextField } from '../../Form/TextField';
import { SelectField } from '../../Form/SelectField';
import comuniJson from '../../../assets/comuni.js';
import SearchAddress from '../../Places/SearchAddress';
import { fetchCountries, fetchProvinces, checkAddressIsValid } from '../../../utils/Addresses';
import ModalConfirmDialog from '../../UI/ModalConfirmDialog.js';

const Residence = ({ user, onSubmitUpdate }) => {
  const form = useForm();

  const params = useParams();
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('Italia');
  const [provinces, setProvinces] = useState([]);
  const [comuni, setComuni] = useState([]);
  const [zipCodes, setZipCodes] = useState([]);
  const [showAddress, setShowAddress] = useState(true);
  const [showAddressGoogle, setShowAddressGoogle] = useState(false);
  const [showAddressConfirmationMessage, setShowAddressConfirmationMessage] = useState(false);
  const [storedData, setStoredData] = useState({});

  const onSubmit = async (data) => {
    try {
      let residency = {};

      if (showAddressGoogle) {
        residency = {
          nation: data.nationGoogle,
          address: data.addressGoogle,
          houseNumber: data.houseNumberGoogle,
          province: data.provinceGoogle,
          city: data.cityGoogle,
          zipCode: data.zipCodeGoogle,
          location: data.locationGoogle,
        };
      } else {
        residency = {
          nation: data.nation,
          address: data.address,
          houseNumber: data.houseNumber,
          province: data.province,
          city: data.city,
          zipCode: data.zipCode,
          location: data.location,
        };
      }

      data = { ...data, residency };

      delete data.nation;
      delete data.address;
      delete data.houseNumber;
      delete data.province;
      delete data.city;
      delete data.zipCode;
      delete data.location;

      delete data.nationGoogle;
      delete data.addressGoogle;
      delete data.houseNumberGoogle;
      delete data.provinceGoogle;
      delete data.cityGoogle;
      delete data.zipCodeGoogle;
      delete data.locationGoogle;

      const addressString =
        data?.residency?.address +
        ' ' +
        data?.residency?.houseNumber +
        ' ' +
        data?.residency?.city +
        ' ' +
        data?.residency?.zipCode +
        ' ' +
        data?.residency?.province +
        ' ' +
        data?.residency?.nation;

      await checkAddressIsValid(addressString).then((res) => {
        if (res === false) {
          setStoredData(data);
          setShowAddressConfirmationMessage(true);
        } else {
          updateUser(data);
        }
      });
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const updateUser = async (data) => {
    await http({
      method: 'PUT',
      url: `/users/${params.id}`,
      form: data,
    });
    user.residency = data.residency;
    toast.success('Utente aggiornato');
    onSubmitUpdate();
  };

  const getUserDataAndUpdate = async () => {
    const data = storedData;
    await updateUser(data);
  };

  const cancelButton = async () => {
    setShowAddressConfirmationMessage(false);
  };

  const confirmButton = async () => {
    await getUserDataAndUpdate();
    setShowAddressConfirmationMessage(false);
  };

  useEffect(() => {
    getCountries();
    getProvinces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const returnAddress = async (address, address_components) => {
    form.setValue('nationGoogle', address_components.nation);
    setCountry(address_components.nation);
    form.setValue('addressGoogle', address_components.street);
    form.setValue('houseNumberGoogle', address_components.houseNumber);
    form.setValue('provinceGoogle', address_components.province);
    await getCityByProvince(address_components.province);
    form.setValue('cityGoogle', address_components.city);
    await getZipCodeByCity(
      address_components.city,
      address_components.province,
      address_components.nation,
    );
    form.setValue('zipCodeGoogle', address_components.zipCode);

    setShowAddressGoogle(true);
    setShowAddress(false);
  };

  const onChange = (e) => {
    form.setValue('address', '');
    setShowAddress(false);
    setShowAddressGoogle(false);
  };

  const getCountries = async () => {
    setCountries(await fetchCountries());
  };

  const getProvinces = async () => {
    if (!country || country !== 'Italia') return;
    setProvinces(fetchProvinces());
  };

  const getCityByProvince = async (province) => {
    try {
      if (!country || country !== 'Italia') return;

      if (province === '') return;
      const comuni = comuniJson.filter((item) => item.sigla === province);
      await setComuni(
        comuni.map((item) => {
          return {
            label: item.nome,
            value: item.nome,
          };
        }),
      );
      form.setValue('province', province);
    } catch (err) {
      console.error(err);
    }
  };

  const getZipCodeByCity = async (city, province, nation) => {
    try {
      if (!nation || nation !== 'Italia') return;

      if (city === '') return;
      const comune = comuniJson.find((item) => item.nome === city);
      await setZipCodes(
        comune.cap.map((item) => {
          return {
            label: item,
            value: item,
          };
        }),
      );
      form.setValue('province', province);
      form.setValue('city', city);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
  } else {
    form.setValue('nation', user?.residency?.nation);
    form.setValue('address', user?.residency?.address);
    form.setValue('houseNumber', user?.residency?.houseNumber);
    form.setValue('city', user?.residency?.city);
    form.setValue('province', user?.residency?.province);
    form.setValue('zipCode', user?.residency?.zipCode);
    form.setValue('location', user?.residency?.location);
  }

  return (
    <div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-wrap justify-between items-end"
        id="saveUserForm"
      >
        <div className="col-span-2">
          <div className="flex">
            <SearchAddress returnAddress={returnAddress} onChange={onChange} />
          </div>
          {showAddress && (
            <div>
              <div className="flex">
                <div className="w-64">
                  <FormLabel>Nazione</FormLabel>
                  <SelectField
                    form={form}
                    name="nation"
                    type="string"
                    placeholder="Nazione"
                    options={countries}
                  />
                </div>
              </div>

              <div className="flex">
                <div className="w-64 mr-2">
                  <FormLabel>Indirizzo</FormLabel>
                  <TextField form={form} name="address" type="string" placeholder="Indirizzo" />
                </div>
                <div className="w-30 mr-2">
                  <FormLabel>N. Civico</FormLabel>
                  <TextField
                    className="w-full"
                    form={form}
                    name="houseNumber"
                    placeholder="N. Civico"
                    type="string"
                  />
                </div>
              </div>
              <div className="flex">
                <div className="w-64 mr-2">
                  <FormLabel>Provincia</FormLabel>
                  {user?.residency?.nation === 'Italia' || user?.residency?.nation === '' ? (
                    <SelectField
                      form={form}
                      name="province"
                      type="string"
                      placeholder="Provincia"
                      onChangeFunction={() => getCityByProvince(form.getValues('province'))}
                      options={provinces}
                    />
                  ) : (
                    <TextField form={form} name="province" type="string" placeholder="Provincia" />
                  )}
                </div>
                <div className="w-64 mr-2">
                  <FormLabel>Comune</FormLabel>
                  {user?.residency?.nation === 'Italia' || user?.residency?.nation === '' ? (
                    <SelectField
                      form={form}
                      name="city"
                      type="string"
                      placeholder={user?.residency?.city || 'Comune'}
                      onChangeFunction={() =>
                        getZipCodeByCity(
                          form.getValues('city'),
                          form.getValues('province'),
                          form.getValues('nation'),
                        )
                      }
                      options={comuni}
                    />
                  ) : (
                    <TextField form={form} name="city" type="string" placeholder="Comune" />
                  )}
                </div>
              </div>
              <div className="flex">
                <div className="w-64 mr-2">
                  <FormLabel>CAP:</FormLabel>
                  {user?.residency?.nation === 'Italia' || user?.residency?.nation === '' ? (
                    <SelectField
                      form={form}
                      name="zipCode"
                      type="string"
                      placeholder={user?.residency?.zipCode || 'CAP'}
                      options={zipCodes}
                    />
                  ) : (
                    <TextField form={form} name="zipCode" type="string" placeholder="CAP" />
                  )}
                </div>
                <div className="w-64 mr-2">
                  <FormLabel>Località:</FormLabel>
                  <TextField form={form} name="location" type="string" placeholder="Località" />
                </div>
              </div>
            </div>
          )}
          {showAddressGoogle && (
            <div>
              <div className="flex">
                <div className=" w-[235.33px] mr-3">
                  <FormLabel>Nazione</FormLabel>
                  <SelectField
                    form={form}
                    name="nationGoogle"
                    type="string"
                    placeholder="Nazione"
                    options={countries}
                  />
                </div>
              </div>
              <div className="flex">
                <div className=" w-[235.33px] mr-3">
                  <FormLabel>Indirizzo</FormLabel>
                  <TextField
                    form={form}
                    name="addressGoogle"
                    type="string"
                    placeholder="Indirizzo"
                  />
                </div>
                <div className=" w-[235.33px] mr-3">
                  <FormLabel>N. Civico</FormLabel>
                  <TextField
                    className="pr-2"
                    form={form}
                    name="houseNumberGoogle"
                    placeholder="N. Civico"
                    type="string"
                  />
                </div>
              </div>
              <div className="flex">
                <div className=" w-[235.33px] mr-3">
                  <FormLabel>Provincia</FormLabel>
                  {country === 'Italia' ? (
                    <SelectField
                      form={form}
                      name="provinceGoogle"
                      type="string"
                      placeholder="Provincia"
                      onChangeFunction={() => getCityByProvince(form.getValues('provinceGoogle'))}
                      options={provinces}
                    />
                  ) : (
                    <TextField
                      form={form}
                      name="provinceGoogle"
                      type="string"
                      placeholder="Provincia"
                    />
                  )}
                </div>
                <div className=" w-[235.33px] mr-3">
                  <FormLabel>Comune</FormLabel>
                  {country === 'Italia' ? (
                    <SelectField
                      form={form}
                      name="cityGoogle"
                      type="string"
                      placeholder="Provincia"
                      onChangeFunction={() =>
                        getZipCodeByCity(
                          form.getValues('cityGoogle'),
                          form.getValues('provinceGoogle'),
                          form.getValues('nationGoogle'),
                        )
                      }
                      options={comuni}
                    />
                  ) : (
                    <TextField form={form} name="cityGoogle" type="string" placeholder="Comune" />
                  )}
                </div>
              </div>
              <div className="flex">
                <div className=" w-[235.33px] mr-3">
                  <FormLabel>CAP:</FormLabel>
                  {country === 'Italia' ? (
                    <SelectField
                      form={form}
                      name="zipCodeGoogle"
                      type="string"
                      placeholder="CAP"
                      options={zipCodes}
                    />
                  ) : (
                    <TextField form={form} name="zipCodeGoogle" type="string" placeholder="CAP" />
                  )}
                </div>
                <div className=" w-[235.33px] mr-3">
                  <FormLabel>Località:</FormLabel>
                  <TextField
                    form={form}
                    name="locationGoogle"
                    type="string"
                    placeholder="Località"
                  />
                </div>
              </div>
            </div>
          )}

          <ModalConfirmDialog
            isVisible={showAddressConfirmationMessage}
            handleCancel={cancelButton}
            handleOk={confirmButton}
            title="Non è possibile verificare l'indirizzo."
            description="Vuoi salvarlo lo stesso?"
            okText="Salva e continua"
          />
        </div>
      </form>
    </div>
  );
};

export default Residence;
