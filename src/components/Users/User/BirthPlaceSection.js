import React, { useEffect, useState } from 'react';

import { TextField } from '../../Form/TextField';
import { SelectField } from '../../Form/SelectField';
import { fetchCountries, getCityByProvince } from '../../../utils/Addresses';
import { provinces } from '../../../utils/Addresses';

import FormLabel from '../../UI/FormLabel';

const BirthPlaceSection = ({ user, form, mode }) => {
  const [countries, setCountries] = useState([]);
  const [isBornInItaly, setIsBornInItaly] = useState(true);
  const [comuni, setComuni] = useState([]);

  useEffect(() => {
    getCountries();
    getCities(user?.placeOfBirthProvince);
  }, [user]);

  const getCountries = async () => {
    setCountries(await fetchCountries());
  };

  const getCities = async (province) => {
    try {
      if (province === '') return;
      setComuni(await getCityByProvince(province));
    } catch (err) {
      console.error(err);
    }
  };

  const updatePlaceOfBirthNation = (nation) => {
    try {
      if (nation === '') return;
      setIsBornInItaly(nation === 'Italia');
      if (
        nation === 'Italia' &&
        user &&
        (user.placeOfBirthNation === '' || user.placeOfBirthNation === undefined)
      )
        return;

      form.setValue('placeOfBirth', '');
      form.setValue('placeOfBirthProvince', '');
      setComuni([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-wrap md:flex-nowrap md:gap-3">
      <div className="w-full md:w-64">
        <FormLabel>Nazione di Nascita</FormLabel>
        <SelectField
          form={form}
          name="placeOfBirthNation"
          type="string"
          placeholder="Nazione di Nascita"
          onChangeFunction={() =>
            updatePlaceOfBirthNation(form.getValues('placeOfBirthNation'))
          }
          validation={{
            required: { value: true, message: 'Nazione di Nascita obbligatoria' },
          }}
          options={countries}
        />
      </div>
      <div className="w-full md:w-64">
        <FormLabel>Provincia di Nascita</FormLabel>
        {isBornInItaly ? (
          <SelectField
            form={form}
            name="placeOfBirthProvince"
            type="string"
            placeholder="Provincia di Nascita"
            onChangeFunction={() => getCities(form.getValues('placeOfBirthProvince'))}
            validation={{
              required: { value: true, message: 'Provincia di Nascita obbligatoria' },
            }}
            options={provinces}
          />
        ) : (
          <TextField
            form={form}
            name="placeOfBirthProvince"
            type="string"
            placeholder="Provincia di Nascita"
            validation={{
              required: { value: true, message: 'Provincia di Nascita obbligatoria' },
            }}
          />
        )}
      </div>
      <div className="w-full md:w-64">
        <FormLabel>Comune di Nascita</FormLabel>
        {isBornInItaly ? (
          <SelectField
            form={form}
            name="placeOfBirth"
            type="string"
            placeholder={'Comune di Nascita'}
            validation={{
              required: { value: true, message: 'Comune di Nascita obbligatorio' },
            }}
            options={comuni}
          />
        ) : (
          <TextField
            form={form}
            name="placeOfBirth"
            type="string"
            placeholder={'Comune di Nascita'}
            validation={{
              required: { value: true, message: 'Comune di Nascita obbligatorio' },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BirthPlaceSection;
