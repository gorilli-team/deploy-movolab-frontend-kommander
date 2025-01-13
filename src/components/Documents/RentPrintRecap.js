import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { MdGarage } from 'react-icons/md';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import UserImage from '../Users/UserImage';
import UserCompanyImage from '../UserCompanies/UserCompanyImage';
import WhiteBox from '../UI/WhiteBox';
import ElementLabel from '../UI/ElementLabel';
import { UserContext } from '../../store/UserContext';

const RentPrintRecap = ({ rent, className = '', phase = 'pickUp' }) => {
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

        <h3 className="w-full text-lg text-center font-semibold flex-1">{rent?.code}</h3>
        <div>
          {rent?.movementType === 'NOL' ? (
            <ElementLabel bgColor="bg-blue-500">NOLEGGIO</ElementLabel>
          ) : rent?.movementType === 'COM' ? (
            <ElementLabel bgColor="bg-orange-600">COMODATO</ElementLabel>
          ) : rent?.movementType === 'MNP' ? (
            <ElementLabel bgColor="bg-gray-600">MOV NON PRODUTTIVO</ElementLabel>
          ) : (
            <ElementLabel>{rent?.movementType}</ElementLabel>
          )}
          <ElementLabel
            bgColor={phase === 'pickUp' ? 'bg-green-500' : 'bg-gray-500'}
            className="ml-3 uppercase"
          >
            {phase === 'pickUp' ? 'Apertura' : 'chiusura'}
          </ElementLabel>
        </div>
      </div>

      <div className="flex flex-wrap xxl:flex-nowrap p-4 gap-y-2">
        <div className="w-full sm:flex-1">
          <div className="flex flex-wrap sm:flex-nowrap sm:gap-x-2 sm:gap-y-4">
            <div className="w-1/2 pr-2 sm:pr-0 sm:w-1/3">
              {/* Cliente */}
              {rent?.customerCompany && (
                <div className="font-semibold text-sm mt-3">
                  <div className="text-sm">Azienda cliente</div>
                  <div className="flex text-gray-600">
                    <div className="mr-2">
                      <div>{rent?.customerCompany?.ragioneSociale}</div>
                      <div className="text-sm">{rent?.customerCompany?.phone}</div>
                      <div className="text-sm">{rent?.customerCompany?.email}</div>
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
                <div className="font-semibold text-sm mt-3">
                  <div className="text-sm">Cliente</div>
                  <div className="flex text-gray-600">
                    <div className="mr-2">
                      <div>
                        {rent?.customer?.name} {rent?.customer?.surname}
                      </div>
                      <div className="text-sm">{rent?.customer?.phone}</div>
                      <div className="text-sm">{rent?.customer?.email}</div>
                      <div className="text-xs">CF: {rent?.customer?.fiscalCode}</div>
                      <div className="text-xs">
                        {rent?.customer?.residency?.address}{' '}
                        {rent?.customer?.residency?.houseNumber},{' '}
                        {rent?.customer?.residency?.zipCode} {rent?.customer?.residency?.city} (
                        {rent?.customer?.residency?.province})
                      </div>
                    </div>

                    {rent?.customer && (
                      <UserImage user={rent?.customer} size="25" goToUser={true} />
                    )}
                  </div>
                </div>
              )}

              {/* Inizio */}
              <div className="font-semibold text-sm mt-3">
                <div className="text-sm">Inizio</div>
                <DisplayDateTime date={rent.pickUpDate} displayType={'flat'} />
                <div className="text-xs">
                  <Link
                    className="font-semibold text-xs mt-2"
                    to={`/settings/puntinolo/${rent?.pickUpLocation?._id}`}
                  >
                    {rent?.pickUpLocation?.name} <MdGarage className="inline mb-1 text-blue-600" />
                  </Link>
                </div>
                <div className="text-xs text-gray-600">
                  {rent?.pickUpLocation?.email}
                  <br />
                  {rent?.pickUpLocation?.address}
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
                      {rent?.driver?.name} {rent?.driver?.surname}
                    </div>
                    <div className="text-sm">{rent?.driver?.phone}</div>
                    <div className="text-sm">{rent?.driver?.email}</div>
                    {rent?.driver?.drivingLicense ? (
                      <div className="text-xs text-gray-600">
                        Patente: {rent?.driver?.drivingLicense.number}
                        <br />
                        Rilasciata da: {rent?.driver?.drivingLicense.releasedBy}
                        <br />
                        Scadenza:{' '}
                        {new Date(rent?.driver?.drivingLicense.expirationDate).toLocaleDateString()}
                      </div>
                    ) : null}
                  </div>

                  {rent?.driver && <UserImage user={rent?.driver} size="25" goToUser={true} />}
                </div>
              </div>

              {rent?.secondDriver && (
                <div className="font-semibold text-sm mt-3">
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

              {/* Fine */}
              {phase === 'dropOff' ? (
                <div className="font-semibold text-sm mt-3">
                  <div className="text-sm">Fine</div>
                  <DisplayDateTime date={rent.dropOffDate} displayType={'flat'} />
                  <div className="text-xs">
                    <Link
                      className="font-semibold text-xs mt-2"
                      to={`/settings/puntinolo/${rent?.dropOffLocation?._id}`}
                    >
                      {rent?.dropOffLocation?.name}{' '}
                      <MdGarage className="inline mb-1 text-blue-600" />
                    </Link>
                  </div>
                  <div className="text-xs text-gray-600">
                    {rent?.dropOffLocation?.email}
                    <br />
                    {rent?.dropOffLocation?.address}
                  </div>
                </div>
              ) : (
                rent.expectedDropOffDate !== undefined &&
                rent.expectedDropOffDate !== rent.dropOffDate && (
                  <div className="font-semibold text-sm mt-3">
                    <div className="text-sm">Fine prevista</div>
                    <DisplayDateTime date={rent.expectedDropOffDate} displayType={'flat'} />
                    <div className="text-xs">
                      <Link
                        className="font-semibold text-xs mt-2"
                        to={`/settings/puntinolo/${rent?.dropOffLocation?._id}`}
                      >
                        {rent?.dropOffLocation?.name}{' '}
                        <MdGarage className="inline mb-1 text-blue-600" />
                      </Link>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="w-full sm:w-1/3">
              {/* Listino */}
              <div className="font-semibold text-sm mt-3 sm:w-44">
                <div className="text-sm">Listino</div>
                <Link
                  className="block text-gray-600"
                  to={`/settings/listini/${rent?.priceList?._id}`}
                >
                  {rent?.priceList?.name}
                </Link>
              </div>

              {/* Flusso */}
              <div className="font-semibold text-sm mt-3 sm:w-44">
                <div className="text-sm">Flusso</div>
                <Link
                  className="block text-gray-600"
                  to={`/settings/flussi/${rent?.workflow?._id}`}
                >
                  {rent?.workflow?.name}
                </Link>
              </div>

              {/* Giorni */}
              {rent.totalDays !== undefined && (
                <div className="font-semibold text-sm mt-3 min-w-12">
                  <div className="text-sm">Giorni</div>
                  <div className="font-semibold text-sm text-gray-600">
                    {rent.totalDays !== undefined && rent.totalDays}
                  </div>
                </div>
              )}

              {rent.fare?.freeDailyKm !== undefined && (
                <div className="font-semibold text-sm mt-3">
                  <div className="text-sm">KM inclusi</div>
                  <div className="font-semibold text-gray-600">
                    {rent?.fare?.freeDailyKm}
                  </div>
                </div>
              )}

              {rent.km?.pickUp !== undefined && (
                <div className="font-semibold text-sm mt-3">
                  <div className="text-sm">KM inizio { rent.km?.dropOff ? ' / fine' : null } </div>
                  <div className="font-semibold text-gray-600">
                    {rent.km?.pickUp} { rent.km?.dropOff ? ` / ${rent.km?.dropOff}` : null }
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full sm:w-auto flex-col mt-1 flex-1 xxl:max-w-[14rem]">
          <div className="text-right">
            <span className="border-2 rounded-full py-1 px-6 text-nowrap">
              <strong className="font-bold">{rent?.group?.mnemonic}</strong> (
              {rent?.group?.description})
            </span>
          </div>

          <div className="text-right mt-2 mr-4">
            <Link to={`/dashboard/veicoli/flotta/${rent?.vehicle?._id}`}>
              <span className="font-semibold text-sm mt-3">
                {rent?.vehicle?.plate ? rent?.vehicle.plate.toUpperCase() : ''}
              </span>
            </Link>
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
          <div className="flex flex-col text-end xxl:max-w-[14rem]">
            <div className="text-sm font-semibold">
              {rent?.vehicle?.brand?.brandName} {rent?.vehicle?.model?.modelName}
            </div>

            <div className="text-xs font-semibold text-gray-600">
              {rent?.vehicle?.version?.versionName}
            </div>
          </div>
        </div>
      </div>
    </WhiteBox>
  );
};

export default RentPrintRecap;
