import React, { useContext, useEffect, useState } from 'react';
import Page from '../../components/Dashboard/Page';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR, MOVOLAB_ROLE_ADMIN } from '../../utils/Utils';
import { http } from '../../utils/Utils';
import { UserContext } from '../../store/UserContext';
import Button from '../../components/UI/buttons/Button';
import ElementLabel from '../../components/UI/ElementLabel';
import WhiteBox from '../../components/UI/WhiteBox';
import { releaseDate, releaseNumber } from '../../utils/Release';
import Alert from '../../components/UI/Alert';
import moment from 'moment/min/moment-with-locales';
import { Link, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import SmartAssistantModal from '../../components/SmartAssistant/SmartAssistantModal';
// import SmartAssistantButton from '../../components/SmartAssistant/SmartAssistantButton';
import ChatWidget from '../../kommander/ChatWidget';

moment.locale('it');

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const history = useHistory();
  const [showSmartAssistantModal, setShowSmartAssistantModal] = useState(false);
  // const [workflowStats, setWorkflowStats] = useState({}); //eslint-disable-line
  const { data: userData } = useContext(UserContext);

  const isMovolabLicense =
    userData?.client?.license?.licenseOwner === 'movolab' || userData?.role === MOVOLAB_ROLE_ADMIN;

  useEffect(() => {
    fetchStats();
    // fetchWorkflowStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    await http({
      url: '/clients/stats',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
      .then((response) => {
        setStats(response);
      })
      .catch((error) => {
        console.error('error', error);
      });
  };

  const curLayout = userData?.client?.websiteLayout;

  function updateLayoutData(key, val) {
    curLayout.push({ key: 'hasUpdated' + key, value: val });

    const data = { websiteLayout: curLayout };

    http({
      method: 'PUT',
      url: `/clients/client/${userData?.client?._id}`,
      form: data,
    });
  }

  const hasCompletedTasks = {
    hasUpdatedPriceLists:
      curLayout === undefined ? false : curLayout?.find((l) => l.key === 'hasUpdatedPriceLists'),
    hasUpdatedRentalLocations:
      curLayout === undefined
        ? false
        : curLayout?.find((l) => l.key === 'hasUpdatedRentalLocations'),
    hasUpdatedClientProfiles:
      curLayout === undefined
        ? false
        : curLayout?.find((l) => l.key === 'hasUpdatedClientProfiles'),
    hasUpdatedProfile:
      curLayout === undefined ? false : curLayout?.find((l) => l.key === 'hasUpdatedProfile'),
  };

  const dashboard_tiles = [
    {
      name: 'Punti nolo',
      link: '/settings/puntinolo',
      count: stats.rentalLocations?.total || 0,
      subfields: [{ label: 'Abilitato', count: stats.rentalLocations?.enabled || 0 }],
    },
    {
      name: 'Veicoli',
      link: '/dashboard/veicoli/flotta',
      count: stats.vehicles?.total || 0,
      subfields: [
        { label: 'Abilitati', count: stats.vehicles?.enabled || 0 },
        { label: 'Non abilitati', count: stats.vehicles?.disabled || 0 },
        { label: 'Disponibili', count: stats.vehicles?.available || 0 },
        { label: 'In uso', count: stats.vehicles?.unavailable || 0 },
      ],
    },
    {
      name: 'Clienti',
      link: '/dashboard/utenti',
      count: stats.customers?.totalCustomers || 0,
      subfields: [
        { label: 'Persone', count: stats.customers?.users || 0 },
        { label: 'Aziende', count: stats.customers?.userCompanies || 0 },
      ],
    },
    {
      name: 'Prenotazioni',
      link: '/dashboard/prenotazioni',
      count: stats.reservations?.total || 0,
      subfields: [
        { label: 'Bozze', count: stats.reservations?.draft || 0 },
        { label: 'Da approvare', count: stats.reservations?.toBeApproved || 0 },
        { label: 'Aperte', count: stats.reservations?.open || 0 },
        { label: 'Chiuse', count: stats.reservations?.closed || 0 },
      ],
    },
    {
      name: 'Movo',
      link: '/dashboard/movimenti',
      count: stats.rents?.total || 0,
      subfields: [
        { label: 'Bozze', count: stats.rents?.draft || 0 },
        { label: 'Aperti', count: stats.rents?.open || 0 },
        { label: 'Chiusi', count: stats.rents?.closed || 0 },
        {
          label:
            'Fatturati' +
            (stats.rents?.partiallyInvoiced
              ? ` (${stats.rents?.partiallyInvoiced} parz. fatturati)`
              : ''),
          count: stats.rents?.invoiced || 0,
        },
        {
          label:
            'Incassati' +
            (stats.rents?.partiallyPaid ? ` (${stats.rents?.partiallyPaid} parz. incassati)` : ''),
          count: stats.rents?.paid || 0,
        },
      ],
    },
    {
      name: 'Fatture',
      link: '/dashboard/amministrazione',
      count: stats.invoices?.total || 0,
      subfields: [
        { label: 'Fatture mie', count: stats.invoices?.client || 0 },
        { label: 'Fatture Movolab', count: stats.invoices?.movolab || 0 },
      ],
    },
  ];

  const alerts = {
    success: [
      {
        label: 'Movo da aprire',
        count: stats.highlights?.movosToOpenToday || 0,
        link: '/dashboard/prenotazioni?stato=aperto',
      },
      {
        label: 'Movo in chiusura oggi',
        count: stats.highlights?.movosToCloseToday || 0,
        link: '/dashboard/movimenti?stato=aperto',
      },
    ],
    error: [
      {
        label: 'Prenotazioni scadute',
        count: stats.highlights?.expiredReservations || 0,
        link: '/dashboard/prenotazioni?stato=aperto',
      },
      {
        label: 'Movo scaduti',
        count: stats.highlights?.expiredRents || 0,
        link: '/dashboard/movimenti?stato=aperto',
      },
      {
        label: 'Prenotazioni in bozza',
        count: stats.highlights?.draftReservations || 0,
        link: '/dashboard/prenotazioni?stato=draft',
      },
      {
        label: 'Movo in bozza',
        count: stats.highlights?.draftRents || 0,
        link: '/dashboard/movimenti?stato=draft',
      },
    ],
  };

  //KOMMANDER
  const [isOpen, setIsOpen] = useState(false);
  const togglePanel = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <WhiteBox>
        {/* <Alert
          alertType="error"
          className="m-4 !py-2"
          button={
            <Button to="/dashboard/sepa" btnStyle="alertYellow">
              Abbonati
            </Button>
          }
        >
          Nessun SEPA associato al tuo account. Connetti il tuo conto bancario per gestire i
          pagamenti
        </Alert> */}
        {hasCompletedTasks.hasUpdatedProfile === undefined ? (
          <Alert
            alertType="orange"
            className="m-4 !py-2"
            button={
              <Button
                btnStyle="alertOrange"
                onClick={() => {
                  history.push('/settings/clientInfo');
                  updateLayoutData('Profile', true);
                }}
              >
                Completa Profilo
              </Button>
            }
          >
            Completa il tuo Profilo Azienda (dati amministrativi, logo azienda, colori
            personalizzati, etc)
          </Alert>
        ) : null}
        {stats.rentalLocationCount < 1 ? (
          <Alert
            alertType="warning"
            className="m-4 !py-2"
            button={
              <Button to="/settings/puntinolo" btnStyle="alertYellow" className="block">
                Crea Punto Nolo
              </Button>
            }
          >
            Nessun Punto Nolo creato. Crea un Punto Nolo per iniziare a noleggiare veicoli (nome,
            luogo, orari di apertura e chiusura)
          </Alert>
        ) : null}
        {hasCompletedTasks.hasUpdatedClientProfiles === undefined ? (
          <Alert
            alertType="purple"
            className="m-4 !py-2"
            button={
              <Button
                onClick={() => {
                  history.push('/settings/profiliCliente');
                  updateLayoutData('ClientProfiles', true);
                }}
                btnStyle="alertPurple"
              >
                Crea Profilo Operatore
              </Button>
            }
          >
            Crea un profilo Operatore per i tuoi collaboratori (tu sei l’Admin)
          </Alert>
        ) : null}
        {stats.vehicleCount < 1 ? (
          <Alert
            alertType="info"
            className="m-4 !py-2"
            button={
              <Button to="/dashboard/veicoli/crea" btnStyle="alertBlue" className="block">
                Aggiungi Veicolo
              </Button>
            }
          >
            Nessun Veicolo aggiunto. Aggiungi un veicolo per attivare il tuo punto nolo.
          </Alert>
        ) : null}
        {!isMovolabLicense ? (
          <>
            {hasCompletedTasks.hasUpdatedRentalLocations === undefined ? (
              <Alert
                alertType="error"
                className="m-4 !py-2"
                button={
                  <Button
                    onClick={() => {
                      history.push('/settings/flussi');
                      updateLayoutData('RentalLocations', true);
                    }}
                    btnStyle="alertRed"
                  >
                    Crea Flusso
                  </Button>
                }
              >
                Nessun Flusso creato. (Ora ne trovi uno di default. Puoi creare dei flussi di lavoro
                per gestire clienti particolari, per gestire noleggi prepagati, etc)
              </Alert>
            ) : null}
            {hasCompletedTasks.hasUpdatedPriceLists === undefined ? (
              <Alert
                alertType="success"
                className="m-4 !py-2"
                button={
                  <Button
                    onClick={() => {
                      history.push('/settings/listini');
                      updateLayoutData('PriceLists', true);
                    }}
                    btnStyle="alertGreen"
                  >
                    Crea Listino
                  </Button>
                }
              >
                Nessun Listino creato. (Ne troverai uno di default. Puoi aggiungere degli Extra,
                personalizzare le franchigie, le Tariffe, etc)
              </Alert>
            ) : null}
          </>
        ) : null}
        <div className="flex p-7 gap-x-4 md:mb-6 flex-wrap relative">
          <div className="w-10/12 md:w-80">
            <div className="text-xl md:text-3xl">
              Ciao<span className="font-semibold">{userData?.fullname}</span>
            </div>
            <div className="text-sm mt-4">
              {userData?.role === 'clientAdmin' ? 'Amministratore' : 'Operatore'}
              <br />
              <div className="flex space-x-2">
                <strong className="text-xl">{userData?.client?.ragioneSociale}</strong>
                <div className="text-xs mt-1.5">
                  {userData?.client?.license?.licenseOwner === 'movolab' ? (
                    <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>
                  ) : (
                    <ElementLabel bgColor="bg-gray-500">Personale</ElementLabel>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <button
                  onClick={togglePanel}
                  className="rounded-lg flex items-center justify-center py-2 px-4 shadow-md button-open-widget"
                > 
                  <img
                    src="/logo-kommander.png"
                    alt="kommander-icon"
                    className="logo-kommander-button"
                  />
                  <span className="pl-2 font-bold flex items-center">
                    Prenotazione Smart
                    <i className="fa-solid fa-arrow-right ml-2 arrow-icon"></i>
                  </span>
                </button>
              </div>

              {isOpen && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div
                  style={{
                    width: '60%',
                    height: '650px',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '10px',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    zIndex: 1000,
                  }}
                  className="relative w-11/12 max-w-4xl border border-gray-300 rounded-lg shadow-lg"
                >

                  <ChatWidget />

                  
                  <button
                    onClick={togglePanel}
                    className="absolute rounded-full flex justify-center items-center close-kommander-widget hover:text-blue-500"
                    style={{ zIndex: 2000 }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
              )}
            </div>
          </div>
          <div className="flex-1 pt-5 pr-5 md:p-0 absolute md:relative top-0 right-0">
            <div
              className="shadow-sm relative cursor-pointer bg-no-repeat bg-cover bg-center rounded-full m-auto w-16 h-16 md:w-28 md:h-28"
              style={{ backgroundImage: `url(${userData?.imageUrl})` }}
            />
          </div>
          <div className="md:text-right w-full md:w-80 pt-4 md:pt-0">
            <h3 className="capitalize text-lg md:text-xl md:mb-3">
              {moment().format('dddd, D MMMM YYYY')}
            </h3>
            <p className="text-xs">
              Ultimo accesso: {new Date(userData?.lastLogin).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="px-2 flex gap-y-4 flex-wrap">
          {Object.entries(alerts).map(([alertType, alertBox], index) =>
            alertBox.reduce((partial, a) => partial + a.count, 0) ? (
              <div className="w-full sm:w-1/2" key={index}>
                <Alert alertType={alertType} className="font-semibold mx-2 h-full" hideIcon>
                  {alertBox.map((message, jindex) =>
                    message.count ? (
                      <Link to={message.link} key={jindex} className="block">
                        {message.count} {message.label}
                      </Link>
                    ) : null,
                  )}
                </Alert>
              </div>
            ) : null,
          )}
        </div>

        <div className="flex flex-wrap py-4 px-2 gap-y-4">
          {dashboard_tiles.map((tile, key) => (
            <div className="w-full sm:w-1/2 md:w-1/3" key={key}>
              <Button
                btnStyle="gray"
                to={tile.link}
                className="flex flex-col h-full mx-2 py-4 px-5 !text-lg !font-light"
              >
                <h5 className="font-bold">
                  {tile.name} ({tile.count})
                </h5>
                <p className="text-sm">
                  {tile.subfields.map((field, key) => (
                    <span key={key}>
                      {field.count} {field.label}
                      <br />
                    </span>
                  ))}
                </p>
              </Button>
            </div>
          ))}
        </div>
      </WhiteBox>

      <div className="px-6 pb-4 mb-8 content-start text-xs text-left">
        <div>Versione: {releaseNumber}</div>
        <div>Data rilascio: {releaseDate}</div>
      </div>
      {showSmartAssistantModal && (
        <SmartAssistantModal
          closeModal={() => {
            setShowSmartAssistantModal(false);
          }}
        />
      )}
    </Page>
  );
};

export default Dashboard;
