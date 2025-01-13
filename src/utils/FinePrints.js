import React, { useContext } from 'react';
import { UserContext } from '../store/UserContext';

export const defConsentsCol1 = [
  `Il sottoscritto dichiara inoltre di avere letto l'informativa privacy ai sensi del
  Regolamento UE 2016/679 (GDPR) ed acconsento ai trattamenti ivi descritti, compresa la
  comunicazione dei dati personali ai terzi ivi elencati.`,
];

export const defConsentsCol2 = [
  `Ai sensi e per gli effetti dell'artt. 1341 e 1342 del codice civile approvo
  espressamente gli artt. 3, 4, 6, 7, 9 e 10 delle Condizioni sotto riportate`,
  `Acconsento a ricevere materiale informativo o pubblicitario.`,
];

export const DefTermsAndConditionsCol1 = ({ companyName = null, companyCity = null, forceClient = false }) => {
  const { data: user } = useContext(UserContext);

  const isMovolabOwner = user?.client?.license?.licenseOwner === 'movolab';

  const companyInfo = {
    name: companyName || ((forceClient || !isMovolabOwner) ? user?.client?.ragioneSociale : 'Movolab S.r.l.'),
    city: companyCity || ((forceClient || !isMovolabOwner) ? user?.client?.address?.city : 'Roma'),
  };

  return (
    <>
      <p>
        1. <strong>Condizioni generali</strong>. Il noleggio dei veicoli da{' '}
        <span className="text-blue-900">{companyInfo.name}</span> (di seguito &quot;il
        Locatore&quot;) &egrave; regolato dalle presenti condizioni e dalla Lettera di Noleggio a
        fronte delle medesime, che viene consegnata in copia cartacea o digitale al Cliente (di
        seguito il &quot;Locatario&quot;).
      </p>

      <p>
        2. <strong>Conclusione del contratto</strong>. Il presente contratto di noleggio si
        considera concluso nel momento in cui il Locatore riceve, nella propria sede di{' '}
        {companyInfo.city}, copia della presente Lettera di Noleggio sottoscritta dal Locatario.
      </p>

      <p>
        3. <strong>Obblighi del Locatario</strong>. Il Locatario s&#39;impegna, oltre che per gli
        obblighi previsti dall&#39;art.1587 c.c. a:
      </p>

      <ol className="ml-2">
        <li>a&#41; utilizzare il veicolo unicamente per necessit&agrave; personali;</li>
        <li>
          b&#41; ad utilizzare ad ogni sosta il dispositivo di bloccasterzo e chiudere il veicolo
          con chiave custodendo la stessa e i documenti di circolazione del veicolo;
        </li>
        <li>c&#41; a non utilizzare il veicolo al di fuori del territorio italiano;</li>
        <li>d&#41; a non rimorchiare altri veicoli ed a non effettuare traini di rimorchi;</li>
        <li>
          e&#41; usare l&#39;autoveicolo in conformit&agrave; alla destinazione, adibendolo ad usi
          consentiti dalle autorizzazioni amministrative; &egrave; fatto comunque divieto assoluto
          di partecipazione a gare.
        </li>
      </ol>

      <p>
        4. <strong>Guida del veicolo</strong>. Il Locatario dichiara e garantisce che il veicolo
        sar&agrave; condotto unicamente dalle persone indicate nella presente accordo. Ciascun
        conducente del veicolo si impegna a non fornire false informazioni sulle proprie
        generalit&agrave;, la propria et&agrave;, il proprio indirizzo e l&#39;esistenza dei
        requisiti di legge per l&#39;abilitazione alla guida. A tutti gli effetti di legge
        l&#39;indirizzo di residenza del Locatario &egrave; quello indicato nella presente accordo.
        Sia il Locatario che ogni conducente autorizzato dovranno&nbsp; essere in possesso di una
        valida patente di guida per il veicolo oggetto del presente accordo.&nbsp;
      </p>

      <p>
        Il Locatario &egrave; informato che sul veicolo pu&ograve; essere installato un dispositivo
        elettronico di rilevazione della posizione geografica dello stesso e/o di registrazione di
        parametri di guida. Tali dati potranno essere utilizzati dalla Societ&agrave; proprietaria
        del veicolo in caso di furto, mancata riconsegna del veicolo, sinistri o altri comportamenti
        illeciti nei quali il veicolo oggetto di noleggio possa essere stato coinvolto e non
        verranno conservati oltre il periodo strettamente necessario per tali finalit&agrave; o
        comunicati a soggetti diversi da autorit&agrave; pubbliche, compagnie assicurative,
        societ&agrave; e professionisti incaricati che forniscono alla Societ&agrave; proprietaria.
      </p>

      <p>
        5. <strong>Accessori veicolo</strong>. Il Locatario dichiara che il veicolo preso in
        noleggio &egrave; dotato di ruota di scorta (o ruotino),&nbsp; normali&nbsp; attrezzi,&nbsp;
        triangolo, giubbino, carta&nbsp; di&nbsp; circolazione, e certificato assicurativo.
      </p>

      <p>
        6. <strong>Danni al veicolo</strong>. Il Locatario &egrave; responsabile diretto per ogni
        danno derivante dalla circolazione e/o custodia del veicolo in uso, e dichiara di farsi
        carico, a titolo di penale per il risarcimento del danno nei limiti, se previsti, dal
        presente contratto alla voce sopra indicata come "Franchigie", normalmente, per:
      </p>

      <ol className="ml-2">
        <li>a&#41; danni arrecati a terzi a seguito di sinistro (cd RCA);</li>
        <li>b&#41; danni causati al veicolo noleggiato (cd Kasko);</li>
        <li>
          c&#41; furto o incendio totale del veicolo noleggiato, qualora vengano consegnate le
          chiavi dello stesso; in caso di mancata restituzione delle chiavi, il Locatario sarà
          tenuto a l risarcimento integrale del veicolo noleggiato
        </li>
        <li>
          d&#41; dell&rsquo;importo di Euro 150,00 in caso di smarrimento e/o mancata restituzione
          delle chiavi (fatto salvo quanto gi&agrave; previsto al punto c).
        </li>
      </ol>

      <p>
        Il Locatario corrisponder&agrave; dette somme tramite l&rsquo;incaricato del Punto Vendita,
        contestualmente alla riconsegna del veicolo.
      </p>
    </>
  );
};

export const DefTermsAndConditionsCol2 = ({ companyName = null, companyCity = null, forceClient = false }) => {
  const { data: user } = useContext(UserContext);

  const isMovolabOwner = user?.client?.license?.licenseOwner === 'movolab';

  const companyInfo = {
    name: companyName || ((forceClient || !isMovolabOwner) ? user?.client?.ragioneSociale : 'Movolab S.r.l.'),
    city: companyCity || ((forceClient || !isMovolabOwner) ? user?.client?.address?.city : 'Roma'),
  };

  return (
    <>
      <p>
        Il Locatario dichiara di riconoscere ed accettare espressamente che, in caso di violazione
        di uno qualsiasi degli obblighi di cui agli artt. 3 e 7, nonch&eacute; nel caso di
        danni/furti procurati al veicolo noleggiato con dolo o colpa da parte del Locatario stesso
        (a mero titolo esemplificativo e non esaustivo: errato rifornimento, bruciatura frizione,
        congelamento carburante, danni al motore per mancanza di olio o liquido refrigerante, ecc.),
        non operer&agrave; qualsivoglia limitazione/esclusione di responsabilit&agrave;.
      </p>

      <p>
        7. <strong>Denunce</strong>. Il Locatario si obbliga a comunicare e denunciare per iscritto
        al Locatore entro e non oltre&nbsp; 24 ore dal fatto accaduto, fornendo circostanze, prove e
        testimonianze a favore, qualsiasi incidente anche di minima importanza e di qualsiasi tipo
        fosse avvenuto durante il periodo di utilizzo e suscettibile di produrre le conseguenze
        accennate ai punti precedenti e seguenti. Nel caso di furto e/o incendio totale e/o
        parziale, il Locatario &egrave; obbligato a presentare immediatamente denuncia alle
        competenti autorit&agrave; e a restituire le chiavi del veicolo, nonch&eacute; a consegnare
        l&#39;originale della denuncia.
      </p>

      <p>
        8.&nbsp; <strong>Costi</strong>. Per il periodo del noleggio saranno a completo carico del
        Locatario i costi relativi all&#39;acquisto del carburante e dei lubrificanti nonch&eacute;
        le spese per l&#39;ordinaria manutenzione. Nel caso in cui il veicolo sia consegnato al
        Locatario con il pieno di carburante e venga riconsegnato al Locatore senza lo stesso, il
        Locatario sar&agrave; tenuto a pagare al Locatore, oltre che l&#39;importo dei litri
        mancanti, il costo del servizio di rifornimento.
      </p>

      <p>
        &nbsp;9. <strong>Addebiti</strong>. Il Locatario si obbliga a corrispondere al Locatore:
      </p>

      <ol className="ml-2">
        <li>a&#41; Il corrispettivo di noleggio.</li>
        <li>
          b&#41; Il rimborso delle spese sostenute per il recupero del veicolo non consegnato nel
          luogo convenuto per qualsivoglia motivo.
        </li>
        <li>
          c&#41; L&#39;ammontare delle sanzioni pecuniarie addebitate al Locatore e/o al Locatario
          e/o a qualsiasi conducente del veicolo per violazioni del Codice della Strada e altra
          normativa applicabile commesse durante il periodo del presente noleggio ed, in ogni caso,
          fino alla restituzione del presente&nbsp; veicolo.
        </li>
        <li>
          d&#41; Quanto dovuto in generale a titolo di risarcimento e/o indennizzo e/o rimborso in
          conseguenza delle responsabilit&agrave; e degli obblighi assunti con la sottoscrizione
          della presente Lettera di Noleggio.
        </li>
        <li>
          e&#41; Il rimborso delle spese anticipate per far rimuovere gli eventuali beni che il
          Locatario avesse lasciato nel veicolo noleggiato e per depositarli in un magazzino,
          nonch&eacute; l&#39;importo della tariffa di noleggio del veicolo per ogni giorno di
          mancato utilizzo.
        </li>
      </ol>

      <p>
        10. <strong>Foro competente</strong>. Per ogni eventuale controversia il Locatario elegge
        come unica competente&nbsp; l&#39;autorit&agrave;&nbsp; giudiziaria&nbsp; di&nbsp;{' '}
        {companyInfo.city}.
      </p>

      <p>&nbsp;</p>

      <p>
        <strong>Informativa sul trattamento dei dati personali</strong>
      </p>

      <p>
        I dati personali verranno utilizzati per le finalit&agrave; previste nella lettera di
        noleggio e trattati in conformit&agrave; al D.Lgs. 196/2003 posto a tutela della privacy.
      </p>

      <p>
        Il consenso all&#39;invio di materiale informativo e promozionale &egrave; facoltativo e Lei
        pu&ograve; autorizzarlo o meno barrando l&#39;apposita casella presente sulla Lettera di
        Noleggio.
      </p>
    </>
  );
};

const FinePrints = ({
  className = 'm-2 border-gray-500 border-2 rounded-2xl overflow-hidden',
  // companyName = 'Movolab Srl',
  consentsTitle = 'Accettazione e consensi',
  consentsCol1 = defConsentsCol1,
  consentsCol2 = defConsentsCol2,
  termsAndConditionsTitle = 'Condizioni generali',
  TermsAndConditionsCol1 = DefTermsAndConditionsCol1,
  TermsAndConditionsCol2 = DefTermsAndConditionsCol2,
  customAgreements = false,
  children,
  ...props
}) => (
  <div className={className} {...props}>
    <div className="py-2 px-3 bg-slate-100">
      <div className="w-full text-lg font-semibold mb-2">
        <h3>{consentsTitle}</h3>
      </div>
      {!customAgreements ? (
        <div className="flex flex-wrap space-y-3 text-xs leading-3">
          <div className="w-full lg:w-1/2 space-y-3">
            {consentsCol1.map((text, index) => (
              <div className="flex items-center" key={index}>
                <label className="block w-2/3">
                  <input type="checkbox" className="mr-1 mb-1" />
                  {text}
                </label>
                <div className="ml-2 font-semibold">firma x</div>
              </div>
            ))}
          </div>
          <div className="w-full lg:w-1/2 space-y-3">
            {consentsCol2.map((text, index) => (
              <div className="flex items-center" key={index}>
                <label className="block w-2/3">
                  <input type="checkbox" className="mr-1 mb-1" />
                  {text}
                </label>
                <div className="ml-2 font-semibold">firma x</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
    <div className="py-2 px-3">
      <div className="w-full text-lg font-semibold mb-2">
        <h3>{termsAndConditionsTitle}</h3>
      </div>
      <div className="flex flex-wrap text-xs leading-3">
        <div className="w-full lg:w-1/2">
          {TermsAndConditionsCol1}
        </div>
        <div className="w-full lg:w-1/2 lg:pl-2">
          {TermsAndConditionsCol2}
        </div>
      </div>
    </div>
  </div>
);

export default FinePrints;
