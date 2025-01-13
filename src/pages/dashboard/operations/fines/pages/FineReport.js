import moment from 'moment';
import React from 'react';

const FineReport = ({ fine, userContext }) => (
  <div className="p-4 px-12 leading-5">
    <div className="my-3">
      {userContext?.data?.client?.imageUrl ? (
        <img
          className="h-12 w-auto rounded-full"
          src={userContext?.data?.client?.imageUrl}
          alt={'logo cliente'}
        />
      ) : (
        <img className="h-12 w-auto rounded-full" src="/logo192.png" alt="Movolab" />
      )}
    </div>

    <div className="flex justify-end my-3 pe-5 pb-5">
      <p>
        Spett.le&nbsp;
        <br />
        {fine.issuer},<br />
        {fine.issuerAddress}
      </p>
    </div>

    <p className="my-8">
      <table className="font-bold">
        <tr>
          <td className="align-top pr-2">Oggetto:</td>
          <td>
            Verbale N. {fine.code} del {moment(fine.fineTime).format('DD/MM/YYYY')} ore{' '}
            {moment(fine.fineTime).format('HH:mm')};<br />
            Notificato in data {moment(fine.time).format('DD/MM/YYYY')} relativo al veicolo{' '}
            {fine.rent?.vehicle?.brand?.brandName} tg. {fine.rent.vehicle.plate.toUpperCase()}
          </td>
        </tr>
      </table>
    </p>

    <p className="my-3">
      In conformit&agrave; a quanto previsto dall&rsquo; art. 196 comma 1 e dall&rsquo;art. 84
      C.d.S., il principio di solidariet&agrave; si applica non nei confronti del proprietario ma
      nei confronti del locatario, usufruttario o utilizzatore a titolo di locazione finanziaria.
    </p>
    <p className="my-3">
      La Societ&agrave; scrivente, in forza di quanto sopra, &egrave; estranea al procedimento
      sanzionatorio di cui in oggetto; vi indichiamo pertanto il nominativo a cui inoltrare per
      competenza la vostra richiesta:
    </p>

    <p className="my-3 mt-6">
      Codice Fiscale {fine.rent.driver.fiscalCode}
      <br />
      {fine.rent.driver?.residency?.address}, {fine.rent.driver?.residency?.zipCode}{' '}
      {fine.rent.driver?.residency?.city} ({fine.rent.driver?.residency?.province}),{' '}
      {fine.rent.driver?.residency?.nation}{' '}
    </p>

    <p className="my-4">
      <table>
        <tr>
          <td className="pr-4">Data e luogo di nascita:</td>
          <td>
            {fine.rent.driver?.placeOfBirth} ({fine.rent.driver?.placeOfBirthProvince}),{' '}
            {fine.rent.driver?.placeOfBirthNation} il{' '}
            {moment(fine.rent.driver?.birthDate).format('DD/MM/YYYY')}
          </td>
        </tr>
        <tr>
          <td className="pr-4">Patente Numero:</td>
          <td>{fine.rent.driver?.drivingLicense?.number}</td>
        </tr>
        <tr>
          <td className="pr-4">Data e luogo rilascio Patente:</td>
          <td>
            rilasciata da {fine.rent.driver?.drivingLicense?.releasedBy} il{' '}
            {moment(fine.rent.driver?.drivingLicense?.releaseDate).format('DD/MM/YYYY')}
          </td>
        </tr>
        <tr>
          <td className="pr-4">Data scadenza:</td>
          <td>{moment(fine.rent.driver?.drivingLicense?.expirationDate).format('DD/MM/YYYY')}</td>
        </tr>
      </table>
    </p>

    <p className="my-2">
      Riferimento Noleggio dal {moment(fine.rent.pickUpDate).format('DD/MM/YYYY HH:mm')} al{' '}
      {moment(fine.rent.dropOffDate).format('DD/MM/YYYY HH:mm')}
    </p>
    <p className="my-2">
      Punto Nolo di consegna: {fine.rent.pickUpLocation?.name} in{' '}
      {fine.rent.pickUpLocation?.address}
    </p>
    <p className="my-2">
      Punto Nolo di riconsegna: {fine.rent.dropOffLocation?.name} in{' '}
      {fine.rent.dropOffLocation?.address}
    </p>

    <p className="my-3 mt-6">Distinti Saluti.&nbsp;</p>
  </div>
);

export default FineReport;
