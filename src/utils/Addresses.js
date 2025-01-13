import provinceJson from '../assets/province';
import comuniJson from '../assets/comuni.js';
import countriesJson from '../assets/countries';

export const fetchCountries = async () => {
  return countriesJson.map((item) => {
    return {
      label: item.name,
      value: item.name,
    };
  });
};

export const provinces = provinceJson.map((item) => ({
  label: item.nome + ' (' + item.sigla + ')',
  value: item.sigla,
}));

export const fetchProvinces = () => provinces;

export const getProvinceFullName = (province) =>
  provinceJson.find((item) => item.sigla === province).nome;

export const getCityByProvince = (province) => {
  try {
    if (province === '') return;
    const comuni = comuniJson.filter((item) => item.sigla === province);
    const comuniResult = comuni.map((item) => {
      return {
        label: item.nome,
        value: item.nome,
      };
    });
    return comuniResult;
  } catch (err) {
    console.error(err);
  }
};

export const getZipCodeByCity = (city, province) => {
  try {
    if (city === '') return;
    const comune = comuniJson.find((item) => item.nome.toLocaleLowerCase() === city.toLocaleLowerCase());

    if (comune) {
      const zipCodes = comune?.cap.map((item) => {
        return {
          label: item,
          value: item,
        };
      });
      return zipCodes;
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
  }
};

export const checkAddressIsValid = async (address) => {
  try {
    const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(URL);
    const data = await response.json();
    if (data.status === 'ZERO_RESULTS') {
      return false;
    }
    if (data.results[0].partial_match) {
      return false;
    }

    if (data.status === 'OK') {
      return true;
    }
    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
};
