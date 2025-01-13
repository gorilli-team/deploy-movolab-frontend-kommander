import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { MOVOLAB_ROLE_ADMIN } from '../../utils/Utils';
import { UserContext } from '../../store/UserContext';
import { FaToolbox, FaLink, FaArrowRightArrowLeft, FaCar } from 'react-icons/fa';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import UserImage from '../Users/UserImage';
import UserCompanyImage from '../UserCompanies/UserCompanyImage';
import ElementLabel from '../UI/ElementLabel';
import { MdGarage } from 'react-icons/md';
import WhiteBox from '../UI/WhiteBox';
import { FaAngleDown } from 'react-icons/fa6';
import FranchisesBox from '../UI/FranchisesBox';
import ModalReservationUpdateCar from './ModalReservationUpdateCar';

const ReservationRecap = ({
  reservationData,
  expandFn = false,
  isExpanded = false,
  updatePrice,
  className = '',
}) => {
  const pathname = window.location.pathname.split('/')[1];
  const [showModal, setShowModal] = useState(false);

  const showModalFunction = (value) => {
    setShowModal(value);
  };

  const closeShowModal = () => {
    setShowModal(false);
  };

  const closeShowModalAndUpdate = () => {
    setShowModal(false);
    updatePrice();
  };

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN; // eslint-disable-line no-unused-vars

  return (
    <WhiteBox className={`mx-0 mt-0 p-6 ${className}`}>
      <div className="flex flex-wrap">
        <div className="flex-1">
          <div className="flex flex-wrap gap-x-6">
            <div>
              <h1 className="text-2xl font-semibold">
                <strong className="font-medium">{reservationData?.code}</strong>
              </h1>
              {reservationData.rent ? (
                <div className="font-medium text-xs text-gray-500">
                  <span className="font-semibold">Movo associato: {''}</span>
                  {!isAdmin ? (
                    <Link
                      className="text-gray-500"
                      to={`${pathname === 'corporate' ? '/corporate' : '/dashboard'}/movimenti/${
                        reservationData?.rent?._id
                      }`}
                    >
                      {reservationData?.rent?.code} <FaLink className="inline mb-1 text-blue-600" />
                    </Link>
                  ) : (
                    <span className="text-gray-500">{reservationData?.rent?.code}</span>
                  )}
                </div>
              ) : null}
            </div>
            <div className="pt-1 uppercase font-semibold">
              {reservationData?.movementType !== undefined && (
                <>
                  {reservationData?.movementType === 'NOL' ? (
                    <ElementLabel bgColor="bg-blue-500">NOLEGGIO</ElementLabel>
                  ) : reservationData?.movementType === 'COM' ? (
                    <ElementLabel bgColor="bg-orange-600">COMODATO</ElementLabel>
                  ) : reservationData?.movementType === 'MNP' ? (
                    <ElementLabel bgColor="bg-gray-600">MOV NON PRODUTTIVO</ElementLabel>
                  ) : (
                    <ElementLabel>{reservationData?.movementType}</ElementLabel>
                  )}
                </>
              )}
            </div>
            <div className="pt-1 uppercase font-semibold">
              {reservationData?.state !== undefined && (
                <>
                  {reservationData?.state === 'aperto' ? (
                    <ElementLabel bgColor="bg-green-500">{reservationData?.state}</ElementLabel>
                  ) : reservationData?.state === 'attivo' ? (
                    <ElementLabel bgColor="bg-green-600">{reservationData?.state}</ElementLabel>
                  ) : reservationData?.state === 'no show' ? (
                    <ElementLabel bgColor="bg-red-600">{reservationData?.state}</ElementLabel>
                  ) : reservationData?.state === 'chiuso' ? (
                    <ElementLabel bgColor="bg-yellow-600">{reservationData?.state}</ElementLabel>
                  ) : reservationData?.state === 'fatturato' ? (
                    <ElementLabel bgColor="bg-purple-700">{reservationData?.state}</ElementLabel>
                  ) : reservationData?.state === 'parz fatturato' ? (
                    <ElementLabel bgColor="bg-purple-500">{reservationData?.state}</ElementLabel>
                  ) : reservationData?.state === 'incassato' ? (
                    <ElementLabel bgColor="bg-sky-700">{reservationData?.state}</ElementLabel>
                  ) : reservationData?.state === 'annullato' ? (
                    <ElementLabel bgColor="bg-red-400">{reservationData?.state}</ElementLabel>
                  ) : reservationData?.state === 'parz incassato' ? (
                    <ElementLabel bgColor="bg-sky-500">{reservationData?.state}</ElementLabel>
                  ) : reservationData?.state === 'stornato' ? (
                    <ElementLabel bgColor="bg-purple-600">{reservationData?.state}</ElementLabel>
                  ) : reservationData?.state === 'draft' && pathname.includes('corporate') ? (
                    <ElementLabel bgColor="bg-yellow-500">IN APPROVAZIONE</ElementLabel>
                  ) : reservationData?.state === 'draft' && !pathname.includes('corporate') ? (
                    <ElementLabel>BOZZA</ElementLabel>
                  ) : (
                    <ElementLabel>{reservationData?.state}</ElementLabel>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-2 gap-y-4">
            {reservationData?.customerCompany && (
              <div className="font-semibold min-w-[11rem]">
                <div className="text-sm">Cliente</div>
                <div className="flex text-gray-600">
                  <div className="mr-2">
                    <div>{reservationData?.customerCompany?.ragioneSociale}</div>
                    <div className="text-sm">{reservationData?.customerCompany?.phone}</div>
                  </div>

                  {reservationData?.customerCompany && (
                    <UserCompanyImage
                      user={reservationData?.customerCompany}
                      size="25"
                      goToUser={true}
                    />
                  )}
                </div>
              </div>
            )}

            {!reservationData?.customerCompany ? (
              reservationData?.customer ? (
                /* Cliente selezionato */
                <div className="font-semibold min-w-[11rem]">
                  <div className="text-sm">Cliente</div>
                  <div className="flex text-gray-600">
                    <div className="mr-2">
                      <div>
                        {reservationData?.customer?.name} {reservationData?.customer?.surname}
                      </div>
                      <div className="text-sm">{reservationData?.customer?.phone}</div>
                    </div>

                    {reservationData?.customer && (
                      <UserImage user={reservationData?.customer} size="25" goToUser={true} />
                    )}
                  </div>
                </div>
              ) : (
                /* Cliente "light" */
                <div className="font-semibold min-w-[11rem]">
                  <div className="text-sm">Cliente</div>
                  <div className="flex text-gray-600">
                    <div className="mr-2">
                      <div>{reservationData?.customerFullName}</div>
                      <div className="text-sm">{reservationData?.customerPhone}</div>
                    </div>
                  </div>
                </div>
              )
            ) : null}

            {reservationData?.driver ? (
              /* Conducente selezionato */
              <div className="font-semibold min-w-[11rem]">
                <div className="text-sm">Conducente</div>
                <div className="flex text-gray-600">
                  <div className="mr-2">
                    <div>
                      {reservationData?.driver?.name} {reservationData?.driver?.surname}
                    </div>
                    <div className="text-sm">{reservationData?.driver?.phone}</div>
                  </div>

                  {reservationData?.driver && (
                    <UserImage user={reservationData?.driver} size="25" goToUser={true} />
                  )}
                </div>
              </div>
            ) : (
              /* Conducente "light" */
              <div className="font-semibold min-w-[11rem]">
                <div className="text-sm">Conducente</div>
                <div className="flex text-gray-600">
                  <div className="mr-2">
                    <div>{reservationData?.driverFullName}</div>
                    <div className="text-sm">{reservationData?.driverPhone}</div>
                  </div>
                </div>
              </div>
            )}

            {reservationData?.secondDriver && (
              <div className="font-semibold min-w-[11rem]">
                <div className="text-sm">Secondo conducente</div>
                <div className="flex text-gray-600">
                  <div className="mr-2">
                    <div>
                      {reservationData?.secondDriver?.name} {reservationData?.secondDriver?.surname}
                    </div>
                    <div className="text-sm">{reservationData?.secondDriver?.phone}</div>
                  </div>

                  {reservationData?.secondDriver && (
                    <UserImage user={reservationData?.secondDriver} size="25" goToUser={true} />
                  )}
                </div>
              </div>
            )}

            <div className="font-semibold w-44">
              <div className="text-sm">Listino</div>
              {pathname === 'corporate' || isAdmin ? (
                <span className="block text-gray-600">{reservationData?.priceList?.name}</span>
              ) : (
                <Link
                  className="block text-gray-600"
                  to={`/settings/listini/${reservationData?.priceList?._id}`}
                >
                  {reservationData?.priceList?.name}{' '}
                  <FaToolbox className="inline mb-1 text-blue-600" />
                </Link>
              )}
            </div>

            <div className="font-semibold w-44">
              <div className="text-sm">Flusso</div>
              {pathname === 'corporate' || isAdmin ? (
                <span className="block text-gray-600">{reservationData?.workflow?.name}</span>
              ) : (
                <Link
                  className="block text-gray-600"
                  to={`/settings/flussi/${reservationData?.workflow?._id}`}
                >
                  {reservationData?.workflow?.name}{' '}
                  <FaToolbox className="inline mb-1 text-blue-600" />
                </Link>
              )}
            </div>

            <div className="basis-full"></div>

            <div className="font-semibold min-w-[11rem]">
              <div className="text-sm">Inizio</div>
              <DisplayDateTime date={reservationData?.pickUpDate} displayType={'flat'} />
              <div className="text-xs">
                {pathname === 'corporate' || isAdmin ? (
                  <>
                    <div>{reservationData?.pickUpLocation?.name}</div>
                    <div className="text-xs">
                      {reservationData?.pickUpLocation?.address} -{' '}
                      {reservationData?.pickUpLocation?.city}{' '}
                    </div>
                  </>
                ) : (
                  <Link
                    className="font-semibold"
                    to={`/settings/puntinolo/${reservationData?.pickUpLocation?._id}`}
                  >
                    {reservationData?.pickUpLocation?.name}{' '}
                    <MdGarage className="inline mb-1 text-blue-600" />
                  </Link>
                )}
              </div>
            </div>

            {reservationData?.expectedDropOffDate !== undefined &&
              reservationData?.expectedDropOffDate !== reservationData?.dropOffDate && (
                <div className="font-semibold min-w-[11rem]">
                  <div className="text-sm">Fine prevista</div>
                  <DisplayDateTime
                    date={reservationData?.expectedDropOffDate}
                    displayType={'flat'}
                  />
                  {pathname === 'corporate' || isAdmin ? (
                    <>
                      <div>{reservationData?.dropOffLocation?.name}</div>
                      <div className="text-xs">
                        {reservationData?.dropOffLocation?.address} -{' '}
                        {reservationData?.dropOffLocation?.city}{' '}
                      </div>
                    </>
                  ) : (
                    <Link
                      className="font-semibold"
                      to={`/settings/puntinolo/${reservationData?.dropOffLocation?._id}`}
                    >
                      {reservationData?.dropOffLocation?.name}{' '}
                      <MdGarage className="inline mb-1 text-blue-600" />
                    </Link>
                  )}
                </div>
              )}

            <div className="font-semibold min-w-[11rem]">
              <div className="text-sm">Fine</div>
              <DisplayDateTime date={reservationData?.dropOffDate} displayType={'flat'} />
              <div className="text-xs">
                {pathname === 'corporate' || isAdmin ? (
                  <>
                    <div>{reservationData?.dropOffLocation?.name}</div>
                    <div className="text-xs">
                      {reservationData?.dropOffLocation?.address} -{' '}
                      {reservationData?.dropOffLocation?.city}{' '}
                    </div>
                  </>
                ) : (
                  <Link
                    className="font-semibold"
                    to={`/settings/puntinolo/${reservationData?.dropOffLocation?._id}`}
                  >
                    {reservationData?.dropOffLocation?.name}{' '}
                    <MdGarage className="inline mb-1 text-blue-600" />
                  </Link>
                )}
              </div>
            </div>

            {reservationData?.totalDays !== undefined && (
              <div className="font-semibold min-w-12">
                <div className="text-sm">Giorni</div>
                <div className="font-semibold text-gray-600">
                  {reservationData?.totalDays !== undefined && reservationData?.totalDays}
                </div>
              </div>
            )}

            {reservationData?.fare?.freeDailyKm !== undefined && (
              <div className="font-semibold">
                <div className="text-sm">KM inclusi</div>
                <div className="font-semibold text-gray-600">
                  {reservationData?.fare?.freeDailyKm}
                </div>
              </div>
            )}

            <div className="basis-full"></div>

            <FranchisesBox rentResevation={reservationData} />
          </div>
        </div>
        <div className="flex flex-col mt-1">
          <div className="text-right">
            <span className="border-2 rounded-full py-1 px-6">
              <strong className="font-bold">{reservationData?.group?.mnemonic}</strong> (
              {reservationData?.group?.description})
            </span>
          </div>

          <div className="text-right mt-2 mr-4">
            {pathname === 'corporate' || isAdmin ? (
              <span className="font-semibold">
                {reservationData?.vehicle?.plate
                  ? reservationData?.vehicle.plate.toUpperCase()
                  : ''}
              </span>
            ) : (
              <>
                <Link to={`/dashboard/veicoli/flotta/${reservationData?.vehicle?._id}`}>
                  <span className="font-semibold">
                    {reservationData?.vehicle?.plate
                      ? reservationData?.vehicle.plate.toUpperCase()
                      : ''}
                  </span>
                  <FaLink className="inline ml-1 mb-1 text-sm text-blue-600" />
                </Link>
                <span onClick={() => showModalFunction(true)} style={{ cursor: 'pointer' }}>
                  <FaCar className="inline ml-1 mb-1 text-md text-blue-600" />
                </span>
              </>
            )}
          </div>

          <div className="flex justify-end">
            {reservationData?.vehicle?.version?.imageUrl ? (
              <img
                src={reservationData?.vehicle?.version?.imageUrl}
                className="max-h-32 min-h-24 align-right"
                alt={`Immagine veicolo noleggio`}
              />
            ) : (
              <></>
            )}
          </div>
          <div className="flex flex-col text-end max-w-[14rem]">
            <div className="text-sm font-semibold">
              {reservationData?.vehicle?.brand?.brandName}{' '}
              {reservationData?.vehicle?.model?.modelName}
            </div>

            <div className="text-xs font-semibold text-gray-600">
              {reservationData?.vehicle?.version?.versionName}
            </div>
          </div>
          {expandFn ? (
            <div className="flex flex-1 justify-end items-end pt-2">
              <button className="text-xs opacity-70 hover:opacity-100" onClick={expandFn}>
                {isExpanded ? 'Chiudi' : 'Espandi'} tutti{' '}
                <FaAngleDown className={`inline mb-1 ${isExpanded && 'transform rotate-180'}`} />
              </button>
            </div>
          ) : null}
          {showModal && (
            <ModalReservationUpdateCar
              showModal={showModal}
              updateShowModal={closeShowModal}
              closeShowModalAndUpdate={closeShowModalAndUpdate}
              reservationData={reservationData}
            />
          )}
        </div>
      </div>
    </WhiteBox>
  );
};

export default ReservationRecap;
