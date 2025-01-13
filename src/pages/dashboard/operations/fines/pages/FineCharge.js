import moment from 'moment';
import React from 'react';
import { convertPrice } from '../../../../../utils/Prices';

const movTypes = {
  COM: 'comodato',
  NOL: 'noleggio',
  MNP: 'movimento non produttivo',
  def: 'movimento',
};

const FineCharge = ({ fine, userContext }) => (
  <div className="p-4 px-12 leading-5">
    <div className="my-3">
      {userContext?.data?.client?.imageUrl ? (
        <img
          className="h-12 w-auto rounded-full"
          src={userContext?.data?.client?.imageUrl}
          alt="logo cliente"
        />
      ) : (
        <img className="h-12 w-auto rounded-full" src="/logo192.png" alt="Movolab" />
      )}
    </div>

    <div className="flex justify-end my-3 pe-5 pb-5">
      <p className="my-3">
        Spett.le
        <br />
        {fine.rent.driver.name} {fine.rent.driver.surname},<br />
        {fine.rent.driver.fiscalCode},<br />
        {fine.rent.driver.email}
      </p>
    </div>

    <p className="my-3">
      <table className="font-bold">
        <tr>
          <td className="align-top pr-2">Oggetto:</td>
          <td>
            Verbale N. {fine.code} del {moment(fine.fineTime).format('DD/MM/YYYY')} ore{' '}
            {moment(fine.fineTime).format('HH:mm')};<br />
            Notificato in data {moment(fine.time).format('DD/MM/YYYY')} relativo al veicolo{' '}
            {fine.rent?.vehicle?.brand?.brandName} tg.{' '}
            {fine?.rent?.vehicle?.plate ? fine.rent.vehicle.plate.toUpperCase() : ''} e relative
            spese amministrative
          </td>
        </tr>
      </table>
    </p>

    <p className="my-3 mt-8">
      Gentile Cliente,
      <br />
      La informiamo che abbiamo ricevuto da parte delle Forze dell&rsquo;Ordine, &ldquo;Ente
      Accertatore&rdquo; del verbale, notifica di violazione alle norme del codice della strada. A
      seguito di verifiche effettuate sui nostri sistemi &egrave; stato accertato che
      l&rsquo;infrazione risulta essere a Lei imputabile in quanto &ldquo;utilizzatore&rdquo; del
      veicolo sanzionato <strong>{fine.rent?.vehicle?.brand?.brandName}</strong> tg.{' '}
      <strong>{fine?.rent?.vehicle?.plate ? fine.rent.vehicle.plate.toUpperCase() : ''} </strong>{' '}
      come risulta dal {movTypes[fine.rent?.movementType] ?? movTypes.def} {fine.rent?.code}{' '}
      consegnato da {fine.rent.pickUpLocation?.name} il{' '}
      {moment(fine.rent.pickUpDate).format('DD/MM/YYYY HH:mm')} e ritirato da
      {fine.rent.dropOffLocation?.name} il{' '}
      {moment(fine.rent.dropOffDate).format('DD/MM/YYYY HH:mm')}
      <br />
      Pertanto, in riferimento al suddetto movo e in ottemperanza alle relative Condizioni Generali,
      la scrivente Societ&agrave;, provveder&agrave; ad addebitarle l&rsquo;importo del verbale pari
      a {convertPrice(fine.amount)} ed i relativi spese per la gestione del verbale{' '}
      {convertPrice(fine.managementCosts || 0)}, iva inclusa, per un totale pari a{' '}
      {convertPrice(fine.amount + (fine.managementCosts || 0))}.
    </p>

    <p className="my-3">
      Con la presente,{' '}
      <u>
        <strong>
          Le chiediamo pertanto di provvedere al pagamento del suddetto importo entro e non oltre 5
          giorni
        </strong>
      </u>{' '}
      lavorativi dal ricevimento della presente mail,{' '}
      <u>
        <strong>attraverso le seguenti modalit&agrave;:</strong>
      </u>
    </p>

    <ul className="pl-5 list-disc">
      <li className="mb-3">
        Verificare la sussistenza dei fondi della Sua carta di credito e/o carta prepagata,
        comunicando tale sussistenza via mail a {fine?.rent?.pickUpLocation?.email}, per consentirci
        di procedere al relativo addebito;
      </li>
      <li>
        Effettuare un bonifico ai seguenti estremi bancari:
        <br />
        <strong>
          {userContext?.data?.client.ragioneSociale}
          <br />
          Codice IBAN: {fine.client?.iban}
        </strong>
        <br />
        CAUSALE : (indicare nome e cognome e ID corsa indicato via email).
        <br />
        In tal caso, La preghiamo una volta effettuato il pagamento di inviarcene copia rispondendo
        alla presente email.
      </li>
    </ul>

    <p className="my-6">
      Nel caso di mancato pagamento saremo costretti ad attivare la pratica recupero crediti.
    </p>

    <p className="my-3">
      In allegato alla presente e-mail trover&agrave; il suddetto verbale di contestazione.
    </p>

    <p className="my-3">Distinti Saluti.</p>
  </div>
);

export default FineCharge;
