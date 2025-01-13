import toast from 'react-hot-toast';
import moment from 'moment';
import { olderThan18 } from './Age';

const checkUserHasDrivingLicense = (user) => {
  if (!user?.drivingLicense?.expirationDate || !user.drivingLicense?.number) {
    toast.error(`Conducente ${user.name} ${user.surname} non ha patente valida.`);
    return false;
  }
  if (user.documents.length === 0) {
    toast.error(`Conducente ${user.name} ${user.surname} non ha caricato nessun documento.`);
    return false;
  }

  let drivingLicenseFront = '';
  let drivingLicenseBack = '';

  user.documents.filter((document) => {
    if (!document.name) return false;
    if (document.name === 'Patente Fronte') {
      drivingLicenseFront = document.url;
    }
    if (document.name === 'Patente Retro') {
      drivingLicenseBack = document.url;
    }
    return true;
  });
  if (drivingLicenseFront === '') {
    toast.error(`Conducente ${user.name} ${user.surname} non ha caricato la patente fronte.`);
    return false;
  }
  if (drivingLicenseBack === '') {
    toast.error(`Conducente ${user.name} ${user.surname} non ha caricato la patente retro.`);
    return false;
  }
  return true;
};

export const checkUsers = (
  customer,
  driver,
  secondDriver,
  dropOffDate,
  customerCompany = undefined,
  clientVerbose = true,
) => {
  try {
    if (!customer && !customerCompany) {
      if (clientVerbose) {
        toast.error('Inserire cliente');
      }
      return false;
    }
    if (customer && !olderThan18(customer?.birthDate)) {
      toast.error(
        `Cliente ${customer.name} ${customer.surname} non ha 18 anni. Data di nascita: ${moment(
          customer?.birthDate,
        ).format('DD/MM/YYYY')}.`,
      );
      return false;
    }

    if (!driver) {
      toast.error('Inserire conducente');
      return false;
    } else {
      if (!driver?.drivingLicense?.expirationDate || !driver.drivingLicense?.number) {
        toast.error(`Conducente ${driver.name} ${driver.surname} non ha patente valida.`);
        return false;
      }
      if (driver?.drivingLicense?.expirationDate < dropOffDate) {
        toast.error(
          `Patente conducente ${driver.name} ${driver.surname} non valida. Scadenza: ${moment(
            driver?.drivingLicense?.expirationDate,
          ).format('DD/MM/YYYY')}.`,
        );
        return false;
      }

      if (!checkUserHasDrivingLicense(driver)) return false;

      if (!olderThan18(driver?.birthDate)) {
        toast.error(
          `Conducente ${driver.name} ${driver.surname} non ha 18 anni. Data di nascita: ${moment(
            driver?.birthDate,
          ).format('DD/MM/YYYY')}.`,
        );
        return false;
      }
    }

    if (secondDriver) {
      if (!secondDriver?.drivingLicense?.expirationDate || !secondDriver.drivingLicense?.number) {
        toast.error(
          `Secondo Conducente ${secondDriver.name} ${secondDriver.surname} non ha patente valida.`,
        );
        return false;
      }
      if (secondDriver?.drivingLicense?.expirationDate < dropOffDate) {
        toast.error(
          `Patente secondo conducente ${secondDriver.name} ${
            secondDriver.surname
          } non valida. Scadenza: ${moment(secondDriver?.drivingLicense?.expirationDate).format(
            'DD/MM/YYYY',
          )}.`,
        );
        return false;
      }

      if (!checkUserHasDrivingLicense(secondDriver)) return false;

      if (!olderThan18(secondDriver?.birthDate)) {
        toast.error(
          `Secondo conducente ${secondDriver.name} ${secondDriver.surname} non ha 18 anni.
            Data di nascita: ${moment(secondDriver?.birthDate).format('DD/MM/YYYY')}.`,
        );
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error(err);
    toast.error(err?.error || 'Errore');
  }
};
