import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { MdGarage } from 'react-icons/md';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import UserImage from '../Users/UserImage';
import UserCompanyImage from '../UserCompanies/UserCompanyImage';
import WhiteBox from '../UI/WhiteBox';
import ElementLabel from '../UI/ElementLabel';
import { UserContext } from '../../store/UserContext';

const ReservationPrintRecap = ({ reservation, className = '' }) => {
  const userContext = useContext(UserContext);

  return (
    <WhiteBox className={`mx-0 mt-0 ${className}`}>
      <div className="py-3 px-6 bg-slate-100 flex flex-wrap gap-y-2">
        <div className="w-24 mr-2">
          {userContext?.data?.client?.imageUrl !== undefined &&
          userContext?.data?.client?.imageUrl !== '' ? (
            <div
              className="w-full h-full cursor-pointer"
              style={{
                backgroundImage: `url(${userContext?.data?.client?.imageUrl})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left center',
                backgroundSize: 'contain',
                /* backgroundColor: '#e5e7eb',
                  borderRadius: '5em',
                  border: '1px solid #e5e7eb',
                  width: '60px',
                  margin: 'auto',
                  marginBottom: '0.2em',*/
              }}
            ></div>
          ) : (
            <img className="h-12 w-auto rounded-full" src="/logo192.png" alt="Movolab" />
          )}
        </div>

        <h3 className="w-full text-lg font-semibold text-center flex-1">{reservation?.code}</h3>
        <div>
          <ElementLabel className="uppercase" bgColor="bg-orange-500">
            Prenotazione
          </ElementLabel>
        </div>
      </div>

      <div className="flex flex-wrap xxl:flex-nowrap p-4">
        <div className="w-full sm:flex-1">
          <div className="flex flex-wrap sm:flex-nowrap sm:gap-x-2 sm:gap-y-4">
            <div className="w-1/2 pr-2 sm:pr-0 sm:w-1/3">
              {/* Cliente */}
              {reservation?.customerCompany && (
                <div className="font-semibold text-sm mt-3">
                  <div className="text-sm">Azienda cliente</div>
                  <div className="flex text-gray-600">
                    <div className="mr-2">
                      <div>{reservation?.customerCompany?.ragioneSociale}</div>
                      <div className="text-sm">{reservation?.customerCompany?.phone}</div>
                    </div>

                    {reservation?.customerCompany && (
                      <UserCompanyImage
                        user={reservation?.customerCompany}
                        size="25"
                        goToUser={true}
                      />
                    )}
                  </div>
                </div>
              )}

              {reservation?.customer && !reservation?.customerCompany && (
                <div className="font-semibold text-sm mt-3">
                  <div className="text-sm">Cliente</div>
                  <div className="flex text-gray-600">
                    <div className="mr-2">
                      <div>
                        {reservation?.customer?.name} {reservation?.customer?.surname}
                      </div>
                      <div className="text-sm">{reservation?.customer?.phone}</div>
                      <div className="text-xs">CF: {reservation?.customer?.fiscalCode}</div>
                      <div className="text-xs">
                        {reservation?.customer?.residency.address}{' '}
                        {reservation?.customer?.residency.houseNumber},{' '}
                        {reservation?.customer?.residency.zipCode}{' '}
                        {reservation?.customer?.residency.city} (
                        {reservation?.customer?.residency.province})
                      </div>
                    </div>

                    {reservation?.customer && (
                      <UserImage user={reservation?.customer} size="25" goToUser={true} />
                    )}
                  </div>
                </div>
              )}

              {/* Inizio */}
              <div className="font-semibold text-sm mt-3">
                <div className="text-sm">Inizio</div>
                <DisplayDateTime date={reservation.pickUpDate} displayType={'flat'} />
                <div className="text-xs">
                  <Link
                    className="font-semibold text-xs mt-2"
                    to={`/settings/puntinolo/${reservation?.pickUpLocation?._id}`}
                  >
                    {reservation?.pickUpLocation?.name}{' '}
                    <MdGarage className="inline mb-1 text-blue-600" />
                  </Link>
                </div>
                <div className="text-xs text-gray-600">
                  {reservation?.pickUpLocation?.email}
                  <br />
                  {reservation?.pickUpLocation?.address}
                </div>
              </div>
            </div>

            <div className="w-1/2 sm:w-1/3">
              {/* Conducente */}
              <div className="font-semibold text-sm mt-3">
                <div className="text-sm">Conducente</div>
                <div className="flex text-gray-600">
                  <div className="mr-2">
                    <div>
                      {reservation?.driver?.name} {reservation?.driver?.surname}
                    </div>
                    <div className="text-sm">{reservation?.driver?.phone}</div>
                    <div className="text-xs text-gray-600">
                      Patente: {reservation?.driver?.drivingLicense.number}
                      <br />
                      Rilasciata da: {reservation?.driver?.drivingLicense.releasedBy}
                      <br />
                      Scadenza:{' '}
                      {new Date(
                        reservation?.driver?.drivingLicense.expirationDate,
                      ).toLocaleDateString()}
                    </div>
                  </div>

                  {reservation?.driver && (
                    <UserImage user={reservation?.driver} size="25" goToUser={true} />
                  )}
                </div>
              </div>

              {reservation?.secondDriver && (
                <div className="font-semibold text-sm mt-3">
                  <div className="text-sm">Secondo conducente</div>
                  <div className="flex text-gray-600">
                    <div className="mr-2">
                      <div>
                        {reservation?.secondDriver?.name} {reservation?.secondDriver?.surname}
                      </div>
                      <div className="text-sm">{reservation?.secondDriver?.phone}</div>
                    </div>

                    {reservation?.secondDriver && (
                      <UserImage user={reservation?.secondDriver} size="25" goToUser={true} />
                    )}
                  </div>
                </div>
              )}

              {/* Fine prevista */}
              <div className="font-semibold text-sm mt-3">
                <div className="text-sm">Fine prevista</div>
                <DisplayDateTime date={reservation.dropOffDate} displayType={'flat'} />
                <div className="text-xs">
                  <Link
                    className="font-semibold text-xs mt-2"
                    to={`/settings/puntinolo/${reservation?.dropOffLocation?._id}`}
                  >
                    {reservation?.dropOffLocation?.name}{' '}
                    <MdGarage className="inline mb-1 text-blue-600" />
                  </Link>
                </div>
                <div className="text-xs text-gray-600">
                  {reservation?.dropOffLocation?.email}
                  <br />
                  {reservation?.dropOffLocation?.address}
                </div>
              </div>

              {reservation.expectedDropOffDate !== undefined &&
                reservation.expectedDropOffDate !== reservation.dropOffDate && (
                  <div className="font-semibold text-sm mt-3">
                    <div className="text-sm">Fine prevista</div>
                    <DisplayDateTime date={reservation.expectedDropOffDate} displayType={'flat'} />
                    <div className="text-xs">
                      <Link
                        className="font-semibold text-xs mt-2"
                        to={`/settings/puntinolo/${reservation?.dropOffLocation?._id}`}
                      >
                        {reservation?.dropOffLocation?.name}{' '}
                        <MdGarage className="inline mb-1 text-blue-600" />
                      </Link>
                    </div>
                  </div>
                )}
            </div>

            <div className="w-1/2 sm:w-1/3">
              {/* Listino */}
              <div className="font-semibold text-sm mt-3 w-44">
                <div className="text-sm">Listino</div>
                <Link
                  className="block text-gray-600"
                  to={`/settings/listini/${reservation?.priceList?._id}`}
                >
                  {reservation?.priceList?.name}
                </Link>
              </div>

              {/* Flusso */}
              <div className="font-semibold text-sm mt-3 w-44">
                <div className="text-sm">Flusso</div>
                <Link
                  className="block text-gray-600"
                  to={`/settings/flussi/${reservation?.workflow?._id}`}
                >
                  {reservation?.workflow?.name}
                </Link>
              </div>

              {/* Giorni */}
              {reservation.totalDays !== undefined && (
                <div className="font-semibold text-sm mt-3 min-w-12">
                  <div className="text-sm">Giorni</div>
                  <div className="font-semibold text-sm text-gray-600">
                    {reservation.totalDays !== undefined && reservation.totalDays}
                  </div>
                </div>
              )}

              {reservation.fare?.freeDailyKm !== undefined && (
                <div className="font-semibold text-sm mt-3">
                  <div className="text-sm">KM inclusi</div>
                  <div className="font-semibold text-gray-600">
                    {reservation?.fare?.freeDailyKm}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-1 flex-1 xxl:max-w-[14rem]">
          <div className="text-right">
            <span className="border-2 rounded-full py-1 px-6 text-nowrap">
              <strong className="font-bold">{reservation?.group?.mnemonic}</strong> (
              {reservation?.group?.description})
            </span>
          </div>

          <div className="text-right mt-2 mr-4">
            <Link to={`/dashboard/veicoli/flotta/${reservation?.vehicle?._id}`}>
              <span className="font-semibold text-sm mt-3">
                {reservation?.vehicle?.plate ? reservation?.vehicle.plate.toUpperCase() : ''}
              </span>
            </Link>
          </div>

          <div className="flex justify-end">
            {reservation?.vehicle?.version?.imageUrl ? (
              <img
                src={reservation?.vehicle?.version?.imageUrl}
                className="max-h-32 min-h-24 align-right"
                alt={`Immagine veicolo noleggio`}
              />
            ) : (
              <></>
            )}
          </div>
          <div className="flex flex-col text-end flex-1 xxl:max-w-[14rem]">
            <div className="text-sm font-semibold">
              {reservation?.vehicle?.brand?.brandName} {reservation?.vehicle?.model?.modelName}
            </div>

            <div className="text-xs font-semibold text-gray-600">
              {reservation?.vehicle?.version?.versionName}
            </div>
          </div>
        </div>
      </div>
    </WhiteBox>
  );
};

export default ReservationPrintRecap;
