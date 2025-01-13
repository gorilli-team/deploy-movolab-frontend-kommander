import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../store/UserContext';
import { http, MOVOLAB_ROLE_ADMIN } from '../../utils/Utils';
import { FaAngleDown, FaLink } from 'react-icons/fa';
import { FaToolbox } from 'react-icons/fa';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import UserImage from '../Users/UserImage';
import ElementLabel from '../UI/ElementLabel';
import RentElementLabel from './rentElements/RentElementLabel';
import { MdGarage } from 'react-icons/md';
import UserCompanyImage from '../UserCompanies/UserCompanyImage';
import WhiteBox from '../../components/UI/WhiteBox';
import { convertPrice } from '../../utils/Prices';
import { fetchFranchises } from './rentElements/Franchises';
import { rentStateIsEqualOrAfter } from '../../utils/Rent';
import { countDays } from '../../utils/Utils';
import moment from 'moment';
import toast from 'react-hot-toast';

const RentRecap = ({
  rent,
  phase,
  expandFn = false,
  isExpanded = false,
  className = '',
  type = 'client',
}) => {
  const [frachisesLabels, setFranchiseLabels] = useState([]);
  const [client, setClient] = useState(null);

  const pathname = window.location.pathname.split('/')[1];

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN; // eslint-disable-line no-unused-vars

  const fetchFranchiseLabels = async () => {
    setFranchiseLabels(await fetchFranchises(rent, phase));
  };

  const fetchClient = async () => {
    try {
      const response = await http({ url: `/clients/client/${rent?.ownedByClient}` });
      setClient(response);
    } catch (error) {
      toast.error(error?.reason?.error || 'Errore nel caricamento del cliente associato');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFranchiseLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (type === 'admin') {
      fetchClient();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return (
    <WhiteBox className={`mx-0 mt-0 p-6 ${className}`}>
      <div className="flex flex-wrap">
        <div className="flex-1">
          <div className="flex flex-wrap gap-x-6">
            <div>
              <h1 className="text-2xl font-semibold">
                <strong className="font-medium">{rent?.code}</strong>
              </h1>
              {rent?.reservation && rent?.reservation?._id !== null && (
                <div className="font-medium text-xs text-gray-500">
                  <span className="font-semibold">Prenotazione Associata: {''}</span>
                  <Link
                    className="text-gray-500"
                    to={`${
                      pathname === 'corporate'
                        ? '/corporate'
                        : pathname === 'admin'
                        ? '/admin'
                        : '/dashboard'
                    }/prenotazioni/${rent?.reservation?._id}`}
                  >
                    {rent?.reservation?.code} <FaLink className="inline mb-1 text-blue-600" />
                  </Link>
                </div>
              )}
              {type === 'admin' && client && (
                <div className="font-medium text-xs text-gray-500">
                  <span className="font-semibold">Cliente Associato: {''}</span>
                  <Link className="text-gray-500" to={`/admin/clienti/anagrafica/${client?._id}`}>
                    {client?.ragioneSociale} <FaLink className="inline mb-1 text-blue-600" />
                  </Link>
                </div>
              )}
            </div>
            <div className="pt-1 uppercase font-semibold">
              {rent.movementType !== undefined && (
                <>
                  {rent.movementType === 'NOL' ? (
                    <ElementLabel bgColor="bg-blue-500">NOLEGGIO</ElementLabel>
                  ) : rent.movementType === 'COM' ? (
                    <ElementLabel bgColor="bg-orange-600">COMODATO</ElementLabel>
                  ) : rent.movementType === 'MNP' ? (
                    <ElementLabel bgColor="bg-gray-600">MOV NON PRODUTTIVO</ElementLabel>
                  ) : (
                    <ElementLabel>{rent.movementType}</ElementLabel>
                  )}
                </>
              )}
            </div>
            <div className="pt-1 uppercase font-semibold">
              {rent.state !== undefined && (
                <>
                  {rent.state === 'draft' && rent.customerCompany !== undefined ? (
                    <RentElementLabel
                      rentState={rent?.state}
                      rentCustomerCompany={rent?.customerCompany}
                    />
                  ) : (
                    <RentElementLabel rentState={rent.state} />
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-2 gap-y-4">
            {rent?.customerCompany && (
              <div className="font-semibold min-w-[11rem]">
                <div className="text-sm">Azienda cliente</div>
                <div className="flex text-gray-600">
                  <div className="mr-2">
                    <div>{rent?.customerCompany?.ragioneSociale}</div>
                    <div className="text-sm">{rent?.customerCompany?.phone}</div>
                  </div>

                  {rent?.customerCompany && (
                    <UserCompanyImage
                      userCompany={rent?.customerCompany}
                      size="25"
                      goToUser={true}
                    />
                  )}
                </div>
              </div>
            )}

            {rent?.customer && !rent?.customerCompany && (
              <div className="font-semibold min-w-[11rem]">
                <div className="text-sm">Cliente</div>
                <div className="flex text-gray-600">
                  <div className="mr-2">
                    <div>
                      {rent?.customer?.name} {rent?.customer?.surname}
                    </div>
                    <div className="text-sm">{rent?.customer?.phone}</div>
                  </div>

                  {rent?.customer && <UserImage user={rent?.customer} size="25" goToUser={true} />}
                </div>
              </div>
            )}

            <div className="font-semibold min-w-[11rem]">
              <div className="text-sm">Conducente</div>
              <div className="flex text-gray-600">
                <div className="mr-2">
                  <div>
                    {rent?.driver?.name} {rent?.driver?.surname}
                  </div>
                  <div className="text-sm">{rent?.driver?.phone}</div>
                </div>

                {rent?.driver && <UserImage user={rent?.driver} size="25" goToUser={true} />}
              </div>
            </div>

            {rent?.secondDriver && (
              <div className="font-semibold min-w-[11rem]">
                <div className="text-sm">Secondo conducente</div>
                <div className="flex text-gray-600">
                  <div className="mr-2">
                    <div>
                      {rent?.secondDriver?.name} {rent?.secondDriver?.surname}
                    </div>
                    <div className="text-sm">{rent?.secondDriver?.phone}</div>
                  </div>

                  {rent?.secondDriver && (
                    <UserImage user={rent?.secondDriver} size="25" goToUser={true} />
                  )}
                </div>
              </div>
            )}

            <div className="font-semibold w-44">
              <div className="text-sm">Listino</div>
              {pathname === 'corporate' || isAdmin ? (
                <span className="block text-gray-600">{rent?.priceList?.name}</span>
              ) : (
                <Link
                  className="block text-gray-600"
                  to={`/settings/listini/${rent?.priceList?._id}`}
                >
                  {rent?.priceList?.name} <FaToolbox className="inline mb-1 text-blue-600" />
                </Link>
              )}
            </div>

            <div className="font-semibold w-44">
              <div className="text-sm">Flusso</div>
              {pathname === 'corporate' || isAdmin ? (
                <span className="block text-gray-600">{rent?.workflow?.name}</span>
              ) : (
                <Link
                  className="block text-gray-600"
                  to={`/settings/flussi/${rent?.workflow?._id}`}
                >
                  {rent?.workflow?.name} <FaToolbox className="inline mb-1 text-blue-600" />
                </Link>
              )}
            </div>
            <div className="font-semibold w-44">
              <div className="text-sm">Tariffa</div>
              {pathname === 'corporate' || isAdmin ? (
                <span className="block text-gray-600">
                  {convertPrice(rent?.fare?.baseFare)}
                  <br />
                  <span className="">
                    {rent?.fare?.calculation === 'range' ? '(Fissa)' : 'Giornaliera'}
                  </span>
                </span>
              ) : (
                <Link
                  className="block text-gray-600"
                  to={`/settings/listini/tariffe/${rent?.fare?._id}`}
                >
                  {convertPrice(rent?.fare?.baseFare)}{' '}
                  <span className="pr-1">
                    {rent?.fare?.calculation === 'range' ? '(Fissa)' : 'Giornaliera'}
                  </span>
                  <FaToolbox className="inline mb-1 text-blue-600" />
                </Link>
              )}
            </div>
            {rent.fare?.range && (
              <div className="font-semibold w-44">
                <div className="text-sm">Fascia</div>
                <span className="block text-gray-600">
                  <span className="">{rent?.fare?.range?.name}</span>
                </span>
              </div>
            )}
            {rent.assignedGroup && (
              <div className="font-semibold w-44">
                <div className="text-sm">Gruppo Assegnato</div>
                <span className="block text-gray-600">
                  <span className="">
                    {rent?.assignedGroup?.mnemonic} - {rent?.assignedGroup?.description}
                  </span>
                </span>
              </div>
            )}

            <div className="basis-full"></div>

            <div className="font-semibold min-w-[11rem]">
              <div className="text-sm">Inizio</div>
              <DisplayDateTime date={rent.pickUpDate} displayType={'flat'} />
              <div className="text-xs">
                {pathname === 'corporate' || isAdmin ? (
                  <span className="font-semibold">{rent?.pickUpLocation?.name}</span>
                ) : (
                  <Link
                    className="font-semibold"
                    to={`/settings/puntinolo/${rent?.pickUpLocation?._id}`}
                  >
                    {rent?.pickUpLocation?.name} <MdGarage className="inline mb-1 text-blue-600" />
                  </Link>
                )}
              </div>
            </div>

            {rentStateIsEqualOrAfter(rent, 'chiuso') ? (
              <>
                <div className="font-semibold min-w-[11rem]">
                  <div className="text-sm">Fine Prevista</div>
                  <DisplayDateTime date={rent.expectedDropOffDate} displayType={'flat'} />
                  <div className="text-xs">
                    <Link
                      className="font-semibold"
                      to={`/settings/puntinolo/${rent?.dropOffLocation?._id}`}
                    >
                      {rent?.dropOffLocation?.name}{' '}
                      <MdGarage className="inline mb-1 text-blue-600" />
                    </Link>
                  </div>
                </div>

                <div className="font-semibold min-w-[11rem]">
                  <div className="text-sm">Fine</div>
                  <DisplayDateTime date={rent.dropOffDate} displayType={'flat'} />
                  <div className="text-xs">
                    {pathname === 'corporate' || isAdmin ? (
                      <span className="font-semibold">{rent?.dropOffLocation?.name}</span>
                    ) : (
                      <Link
                        className="font-semibold"
                        to={`/settings/puntinolo/${rent?.dropOffLocation?._id}`}
                      >
                        {rent?.dropOffLocation?.name}{' '}
                        <MdGarage className="inline mb-1 text-blue-600" />
                      </Link>
                    )}
                  </div>
                </div>
                {rent.totalDays !== undefined && (
                  <div className="font-semibold min-w-12">
                    <div className="text-sm">Giorni</div>
                    <div className="font-semibold text-gray-600">{rent.totalDays}</div>
                  </div>
                )}

                {rent.fare?.freeDailyKm !== undefined && (
                  <div className="font-semibold">
                    <div className="text-sm">KM inclusi</div>
                    <div className="font-semibold text-gray-600">{rent?.fare?.freeDailyKm}</div>
                  </div>
                )}

                {rent.extraDays !== undefined && (
                  <>
                    {rent.extraDays > 0 ? (
                      <div className="font-semibold">
                        <div className="text-sm">Giorni Extra</div>
                        <div className="font-semibold text-gray-600">{rent.extraDays}</div>
                      </div>
                    ) : null}
                  </>
                )}
              </>
            ) : (
              <>
                <div className="font-semibold min-w-[11rem]">
                  <div className="text-sm">Fine Prevista</div>
                  <DisplayDateTime date={rent.expectedDropOffDate} displayType={'flat'} />
                  <div className="text-xs">
                    {pathname === 'corporate' || isAdmin ? (
                      <span className="font-semibold">{rent?.dropOffLocation?.name}</span>
                    ) : (
                      <Link
                        className="font-semibold"
                        to={`/settings/puntinolo/${rent?.dropOffLocation?._id}`}
                      >
                        {rent?.dropOffLocation?.name}{' '}
                        <MdGarage className="inline mb-1 text-blue-600" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="font-semibold min-w-12">
                  <div className="text-sm">Giorni</div>
                  <div className="font-semibold text-gray-600">
                    {countDays(rent.pickUpDate, rent.expectedDropOffDate)}
                  </div>
                </div>

                {rent.fare?.freeDailyKm !== undefined && (
                  <div className="font-semibold min-w-12">
                    <div className="text-sm">KM inclusi</div>
                    <div className="font-semibold text-gray-600">{rent?.fare?.freeDailyKm}</div>
                  </div>
                )}

                {rentStateIsEqualOrAfter(rent, 'aperto') &&
                  countDays(rent.expectedDropOffDate, moment()) > 1 && (
                    <div className="font-semibold">
                      <div className="text-sm">Giorni Extra</div>
                      <div className="font-semibold text-gray-600">
                        {countDays(rent.expectedDropOffDate, moment()) - 1}
                      </div>
                    </div>
                  )}
              </>
            )}

            <div className="basis-full"></div>

            {frachisesLabels?.kasko ? (
              <div>
                <ElementLabel bgColor="bg-gray-600">
                  Kasko <strong className="font-bold">{frachisesLabels.kasko.type}</strong>
                </ElementLabel>
              </div>
            ) : null}

            {frachisesLabels?.rca ? (
              <div>
                <ElementLabel bgColor="bg-orange-600">
                  RCA <strong className="font-bold">{frachisesLabels.rca.type}</strong>
                </ElementLabel>
              </div>
            ) : null}

            {frachisesLabels?.if ? (
              <div>
                <ElementLabel bgColor="bg-yellow-600">
                  I/F <strong className="font-bold">{frachisesLabels.if.type}</strong>
                </ElementLabel>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col mt-1">
          <div className="text-right">
            <span className="border-2 rounded-full py-1 px-6">
              <strong className="font-bold">{rent?.group?.mnemonic}</strong> (
              {rent?.group?.description})
            </span>
          </div>

          <div className="text-right mt-2 mr-4">
            {pathname === 'corporate' || isAdmin ? (
              <span className="font-semibold">
                {rent?.vehicle?.plate ? rent?.vehicle.plate.toUpperCase() : ''}
              </span>
            ) : (
              <Link to={`/dashboard/veicoli/flotta/${rent?.vehicle?._id}`}>
                <span className="font-semibold">
                  {rent?.vehicle?.plate ? rent?.vehicle.plate.toUpperCase() : ''}
                </span>
                <FaLink className="inline ml-1 mb-1 text-sm text-blue-600" />
              </Link>
            )}
          </div>

          <div className="flex justify-end">
            {rent?.vehicle?.version?.imageUrl ? (
              <img
                src={rent?.vehicle?.version?.imageUrl}
                className="max-h-32 min-h-24 align-right"
                alt={`Immagine veicolo noleggio`}
              />
            ) : (
              <></>
            )}
          </div>
          <div className="flex justify-end">
            <div className="text-sm font-semibold">
              {rent?.vehicle?.brand?.brandName} {rent?.vehicle?.model?.modelName}
            </div>
          </div>
          <div className="flex justify-end">
            <div className="text-xs font-semibold text-gray-600">
              {rent?.vehicle?.version?.versionName}
            </div>
          </div>
          {expandFn ? (
            <div className="flex flex-1 justify-end items-end selection:pt-2">
              <button className="text-xs opacity-70 hover:opacity-100" onClick={expandFn}>
                {isExpanded ? 'Chiudi' : 'Espandi'} tutti{' '}
                <FaAngleDown className={`inline mb-1 ${isExpanded && 'transform rotate-180'}`} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </WhiteBox>
  );
};

export default RentRecap;
