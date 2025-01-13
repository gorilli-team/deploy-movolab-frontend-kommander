import React, { useContext, useEffect, useState } from 'react';
import { http } from '../../../utils/Utils';
import { Link } from 'react-router-dom/cjs/react-router-dom';
import { FaLink } from 'react-icons/fa';
import moment from 'moment';
import ElementLabel from '../../UI/ElementLabel';
import ToggleSwitch from '../../UI/ToggleSwitch';
import ModalConfirmDialog from '../../UI/ModalConfirmDialog';
import { getVehicleGroup, getVehicleImageUrl } from '../../../utils/Vehicles';
import OffMessageModal from './OffMessageModal';
import { UserContext } from '../../../store/UserContext';

const VehicleBoxesHeader = ({
  vehicle,
  enableVehicle,
  viewMode = true,
  className = '',
  closeModal = () => {},
}) => {
  const [lastRent, setLastRent] = useState(null);
  const [availableStatus, setAvailableStatus] = useState(true);
  const [showCloseModalMessage, setShowCloseModalMessage] = useState(false);
  const [showDeclarationMessage, setShowDeclarationMessage] = useState(false);
  const [showDisableMessage, setShowDisableMessage] = useState(false);
  const groupData = getVehicleGroup(vehicle);
  const imageUrl = getVehicleImageUrl(vehicle)?.imageUrl;
  const { data: currentClient } = useContext(UserContext);

  const getLastRent = async (vehicleId) => {
    try {
      if (vehicleId === undefined) return;
      const response = await http({ url: `/rents/vehicle/${vehicleId}/lastrent` });
      setLastRent(response);
    } catch (error) {
      console.error(error);
    }
  };

  const getVehicleAvailability = async (vehicleId) => {
    try {
      if (vehicleId === undefined) return;
      const response = await http({
        url: `/rents/availability/byVehicle/${vehicleId}`,
        method: 'POST',
        form: {
          pickUpDate: moment(),
          dropOffDate: moment(),
        },
      });

      setAvailableStatus(response?.available);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getLastRent(vehicle._id);
    getVehicleAvailability(vehicle._id);
  }, [vehicle]);

  if (!currentClient) return null;
  const isMovolabLicense = currentClient.client?.license?.licenseOwner === 'movolab';

  const message = isMovolabLicense
    ? "Dichiaro espressamente, assumendomi la responsabilità civile, penale ed economica derivante da tale dichiarazione e manlevando completamente Movolab da qualsiasi rivalsa o danno, che (i) il presente veicolo ha come Destinazione 'Locazione senza conducente' e che (ii), in caso di acquisto in noleggio a lungo termine, il presente veicolo sia abilitato alla Sublocazione da parte del proprietario/compagnia assicurativa"
    : "Attenzione, il presente veicolo deve avere nella carta di circolazione la Destinazione 'Locazione senza conducente' e, in caso di acquisto in noleggio a lungo termine, deve essere abilitato alla Sublocazione da parte del proprietario";

  const exitFromModal = () => {
    setShowCloseModalMessage(true);
  };

  const mapOffFleetReason = (reason) => {
    switch (reason) {
      case 'non_disponibile':
        return 'Non disponibile';
      case 'in_riparazione':
        return 'In riparazione';
      case 'in_manutenzione':
        return 'In manutenzione';
      case 'in_revisione':
        return 'In revisione';
      case 'in_attesa_di_vendita':
        return 'In attesa di vendita';
      case 'in_attesa_di_demolizione':
        return 'In attesa di demolizione';
      case 'in_attesa_di_trasferimento':
        return 'In attesa di trasferimento';
      case 'in_attesa_di_rottamazione':
        return 'In attesa di rottamazione';
      case 'altro':
        return 'Altro';
      default:
        return 'Altro';
    }
  };

  const setOffFleet = async (offFleetMessage) => {
    await enableVehicle(false, null, offFleetMessage.fleetOffReason);
    setShowDisableMessage(false);
  };

  const proceedEnableVehicle = async (enabled, message = '') => {
    if (enabled === true && vehicle?.declarations?.enabledDeclarationDate === undefined) {
      exitFromModal();
      return;
    }

    if (enabled === false) {
      setShowDisableMessage(true);
      return;
    }

    await enableVehicle(enabled, message);
  };

  const doEnableVehicle = async (message) => {
    await enableVehicle(true, message);
  };

  return (
    <div className={`flex flex-wrap md:flex-nowrap ${className}`}>
      {/* 1. Col intestazione */}
      <div className="flex-1 p-4">
        <div className="text-4xl font-semibold">
          {vehicle.plate ? vehicle.plate.toUpperCase() : ''}
        </div>
        <div className="text-xl">
          {vehicle.brand?.brandName} {vehicle.model?.modelName}{' '}
        </div>
        <div>{vehicle.version?.versionName}</div>

        {groupData !== undefined && (
          <div className="mt-5">
            <span
              className="border-2 rounded-full py-2 px-8 text-nowrap"
              style={{ textWrap: 'nowrap' }}
            >
              <strong className="font-bold">{groupData?.group?.mnemonic}</strong> (
              {groupData?.group?.description})
            </span>
          </div>
        )}
      </div>

      {/* 2. Col immagine */}
      <div className="flex-initial w-full md:w-1/3 p-4">
        {imageUrl ? <img src={imageUrl} className="h-auto md:h-40 mx-auto" alt="brand-logo" /> : <></>}
      </div>

      {/* 3. Col stato veicolo */}
      <div className="flex-initial p-4">
        <div className="flex flex-wrap md:flex-nowrap gap-4 py-2">
          <div className="flex flex-col items-end justify-center min-w-[8rem]">
            <div className="font-semibold uppercase">
              {availableStatus ? (
                <ElementLabel bgColor="bg-green-600 whitespace-nowrap">Disponibile</ElementLabel>
              ) : (
                <ElementLabel bgColor="bg-red-600 whitespace-nowrap">Non Disponibile</ElementLabel>
              )}
            </div>
          </div>
          <div className="text-sm">
            <strong>Punto Nolo</strong>{' '}
            <Link to={`/settings/puntinolo/${vehicle.rentalLocation?._id}`}>
              {vehicle.rentalLocation?.name} <FaLink className="inline text-blue-600" />
            </Link>
            <br />
            {lastRent && lastRent?.code !== undefined && (
              <>
                <strong>Ultimo movimento</strong>{' '}
                <Link to={`/dashboard/movimenti/${lastRent?._id}`}>
                  {lastRent?.code} <FaLink className="inline text-blue-600" />
                </Link>
                <br />
              </>
            )}
            <strong>KM percorsi</strong> {vehicle.km !== undefined ? `${vehicle.km} km` : ''}
          </div>
        </div>
        <div className="flex flex-wrap md:flex-nowrap gap-4 py-2">
          <div className="flex flex-col items-end justify-center gap-2 md:min-w-[8rem]">
            <div className="font-semibold uppercase">
              {vehicle?.enabled ? (
                <ElementLabel bgColor="bg-green-600 whitespace-nowrap">Abilitato</ElementLabel>
              ) : (
                <ElementLabel bgColor="bg-red-600 whitespace-nowrap">Disabilitato</ElementLabel>
              )}
            </div>

            {viewMode === false && (
              <ToggleSwitch
                switches={[
                  {
                    label: 'ON',
                    onClick: (e) => {
                      proceedEnableVehicle(true);
                    },
                    selected: vehicle?.enabled,
                  },
                  {
                    label: 'OFF',
                    onClick: (e) => {
                      proceedEnableVehicle(false);
                    },
                    selected: !vehicle?.enabled,
                  },
                ]}
              />
            )}
          </div>
          <div className="text-sm">
            <strong>Dichiarazione:</strong>{' '}
            {vehicle?.declarations?.enabledDeclarationDate
              ? moment(vehicle?.declarations?.enabledDeclarationDate).format('DD/MM/YYYY HH:mm')
              : 'nd'}{' '}
            {vehicle?.declarations?.enabledDeclarationMessage ? (
              <button
                className="text-blue-600 underline"
                onClick={() => {
                  setShowDeclarationMessage(true);
                }}
              >
                Vedi
              </button>
            ) : null}
            <br />
            <strong>Data flotta ON:</strong>{' '}
            {vehicle?.fleetOnDate ? moment(vehicle?.fleetOnDate).format('DD/MM/YYYY HH:mm') : 'nd'}
            <br />
            <strong>Data flotta OFF:</strong>{' '}
            {vehicle?.fleetOffDate
              ? moment(vehicle?.fleetOffDate).format('DD/MM/YYYY HH:mm')
              : 'nd'}
            <br />
            <strong>Motivo flotta OFF:</strong> {mapOffFleetReason(vehicle?.fleetOffReason) || 'nd'}
          </div>
        </div>
      </div>
      <ModalConfirmDialog
        innerClassName="w-96 px-6 py-4"
        isVisible={showCloseModalMessage}
        headerChildren="Abilitazione veicolo"
        title=""
        description={message}
        okText="Accetta"
        handleCancel={() => {
          setShowCloseModalMessage(false);
        }}
        handleOk={() => {
          doEnableVehicle(message);
          setShowCloseModalMessage(false);
        }}
      />
      <ModalConfirmDialog
        innerClassName="w-96 px-6 py-4"
        isVisible={showDeclarationMessage}
        headerChildren={`Dichiarazione abilitazione veicolo ${
          vehicle.plate ? vehicle.plate.toUpperCase() : ''
        } del ${moment(vehicle?.declarations?.enabledDeclarationDate).format('DD/MM/YYYY HH:mm')}`}
        title=""
        description={message}
        okText="Chiudi"
        cancelText=""
        handleOk={() => {
          setShowDeclarationMessage(false);
        }}
        handleCancel={() => {
          setShowDeclarationMessage(false);
        }}
      />
      {showDisableMessage && (
        <OffMessageModal
          closeModal={() => {
            setShowDisableMessage(false);
          }}
          setOffFleet={setOffFleet}
        />
      )}
    </div>
  );
};

export default VehicleBoxesHeader;
