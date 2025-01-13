import React, { useEffect, useState } from 'react';
import FormLabel from '../../UI/FormLabel';
import { TextField } from '../../Form/TextField';
import { SelectField } from '../../Form/SelectField';
import Button from '../../UI/buttons/Button';
import CodiceFiscale from 'codice-fiscale-js';
import { fetchCountries } from '../../../utils/Addresses';

const FiscalCode = ({ user, form, checkUserFunction }) => {
  const [validFiscalCode, setValidFiscalCode] = useState(false);
  const [showFiscalCodeCheck, setShowFiscalCodeCheck] = useState(false);
  const [errorInFiscalCodeCheck, setErrorInFiscalCodeCheck] = useState(false);
  const [missingField, setMissingField] = useState('');
  const [countries, setCountries] = useState([]);

  const [calculatedFiscalCode, setCalculatedFiscalCode] = useState('');

  if (!user || (user && user.nationality === undefined)) {
    form.setValue('nationality', 'Italia');
  }

  useEffect(() => {
    getCountries();
  }, []);

  const getCountries = async () => {
    setCountries(await fetchCountries());
  };

  const protectFields = (data) => {
    if (user === undefined || user === null) return;

    user.placeOfBirth = data.birthplace;
    user.placeOfBirthProvince = data.birthplaceProvincia;
    user.name = data.name;
    user.surname = data.surname;
    user.userType = data.userType;
    user.gender = data.gender;
  };

  const checkFiscalCode = (e, fiscalCode) => {
    try {
      e.preventDefault();
      setErrorInFiscalCodeCheck(false);
      setMissingField('');
      setShowFiscalCodeCheck(false);

      const userData = {
        name: form.getValues('name'),
        surname: form.getValues('surname'),
        gender: form.getValues('gender'),
        day: form.getValues('birthDate')?.split('-')[2],
        month: form.getValues('birthDate')?.split('-')[1],
        year: form.getValues('birthDate')?.split('-')[0],
        birthplace: form.getValues('placeOfBirth'),
        placeOfBirth: form.getValues('placeOfBirth'), // Optional
        birthplaceProvincia: form.getValues('placeOfBirthProvince'), // Optional
        placeOfBirthProvince: form.getValues('placeOfBirthProvince'), // Optional
      };

      if (userData.name === undefined || userData.name === '') {
        setErrorInFiscalCodeCheck(true);
        setMissingField('Nome');
        return;
      }
      if (userData.surname === undefined || userData.surname === '') {
        setErrorInFiscalCodeCheck(true);
        setMissingField('Cognome');
        return;
      }
      if (userData.gender === undefined || userData.gender === '') {
        setErrorInFiscalCodeCheck(true);
        setMissingField('Genere');
        return;
      }
      if (form.getValues('birthDate') === undefined || form.getValues('birthDate') === '') {
        setErrorInFiscalCodeCheck(true);
        setMissingField('Data di nascita');
        return;
      }
      if (userData.birthplace === undefined || userData.birthplace === '') {
        setErrorInFiscalCodeCheck(true);
        setMissingField('Luogo di nascita');
        return;
      }
      if (userData.birthplaceProvincia === undefined || userData.birthplaceProvincia === '') {
        setErrorInFiscalCodeCheck(true);
        setMissingField('Provincia di nascita');
        return;
      }

      const cf = new CodiceFiscale(userData);
      setCalculatedFiscalCode(cf.code);

      if (cf.code === fiscalCode) {
        setValidFiscalCode(true);
        setShowFiscalCodeCheck(true);
      } else {
        setValidFiscalCode(false);
        setShowFiscalCodeCheck(true);
      }
      protectFields(userData);
      if (fiscalCode?.length !== 16) return false;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="flex flex-wrap md:flex-nowrap">
        <div className="w-8/12 md:w-64">
          <FormLabel>Nazionalità</FormLabel>
          <SelectField
            form={form}
            name="nationality"
            type="string"
            placeholder="Nazionalità"
            options={countries}
            autofocus
          />
        </div>
      </div>
      <div className="flex flex-wrap md:flex-nowrap gap-x-3">
        <div className="w-full md:w-64">
          <FormLabel>Codice fiscale</FormLabel>
          <TextField
            form={form}
            name="fiscalCode"
            type="string"
            placeholder="Codice fiscale"
            validation={{
              required: { value: true, message: 'Codice Fiscale obbligatorio' },
            }}
            autofocus
          />
        </div>
        {!user && (
          <div>
            <FormLabel className="hidden md:block">&nbsp;</FormLabel>
            <Button type="button" btnStyle="inFormStyle" onClick={checkUserFunction}>
              Cerca nel DB
            </Button>
          </div>
        )}
        <div>
          <FormLabel className="hidden md:block">&nbsp;</FormLabel>
          <Button type="button" btnStyle="inFormStyle"
            onClick={(e) => {
              checkFiscalCode(e, form.getValues('fiscalCode'));
            }}
          >
            Calcola
          </Button>
        </div>
        {errorInFiscalCodeCheck && (
          <div className="mt-4">
            <div className="text-sm font-semibold text-red-700">
              Non posso calcolare il codice fiscale
            </div>

            <div className="text-sm">Campo mancante: {missingField}</div>
          </div>
        )}
        {showFiscalCodeCheck && (
          <div className="mt-4">
            {validFiscalCode === true ? (
              <div className="text-sm font-semibold text-green-700">Codice fiscale valido</div>
            ) : (
              <div className="text-sm font-semibold text-red-700">Codice fiscale non valido</div>
            )}
            <div className="text-sm flex">
              <div>CF corretto: {calculatedFiscalCode}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FiscalCode;
