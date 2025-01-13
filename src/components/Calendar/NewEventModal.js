import React, { useEffect, useState } from 'react';
import Modal from '../UI/Modal';
import ModalConfirmDialog from '../UI/ModalConfirmDialog';
import Button from '../UI/buttons/Button';
import NewEventForm from './NewEventForm';
import { FaChevronRight } from 'react-icons/fa6';
import ElementLabel from '../UI/ElementLabel';
import { http } from '../../utils/Utils';

const NewEventModal = ({
  eventData,
  dateTimeStart,
  dateTimeEnd,
  calendarFilters,
  canOpenMovo,
  onClose,
  ...props
}) => {
  const mode = window.location.pathname.split('/')[1];
  if (mode === 'corporate') {
    canOpenMovo = false;
  }

  const [showCloseModalMessage, setShowCloseModalMessage] = useState(false);
  const [isVehicleLocked, setIsVehicleLocked] = useState(false);
  const [showSection, setShowSection] = useState(false);
  const [lockingInfo, setLockingInfo] = useState(null);
  const [eventType, setEventType] = useState(canOpenMovo === false ? 'reservation' : false);

  useEffect(() => {
    updateVehicleLock();
  }, []);

  const updateVehicleLock = async () => {
    try {
      const data = {
        rentalLocation: eventData.rental._id,
        vehicle: eventData.vehicle._id,
        plate: eventData.vehicle.plate,
        isLocked: true,
        lockReason: eventType === 'rent' ? 'movo' : 'reservation',
      };

      await http({
        url: `/vehicles/vehiclelock/add`,
        method: 'PUT',
        form: data,
      });

      setShowSection(true);
    } catch (e) {
      setShowSection(true);
      setIsVehicleLocked(true);
      setLockingInfo({
        operator: e?.lockingOperator,
        lockDate: e?.lockDate,
      });
    }
  };

  const removeVehicleLock = async () => {
    try {
      if (lockingInfo !== null) {
        return;
      }

      const data = {
        rentalLocation: eventData.rental._id,
        vehicle: eventData.vehicle._id,
        plate: eventData.vehicle.plate,
      };

      await http({
        url: `/vehicles/vehiclelock/remove`,
        method: 'PUT',
        form: data,
      });

      setIsVehicleLocked(false);
    } catch (e) {
      console.error('REMOVE VEHICLE LOCK ERROR', e);
    }
  };

  const forceVehicleLock = async () => {
    try {
      const data = {
        rentalLocation: eventData.rental._id,
        vehicle: eventData.vehicle._id,
        plate: eventData.vehicle.plate,
      };

      await http({
        url: `/vehicles/vehiclelock/remove`,
        method: 'PUT',
        form: data,
      });

      await updateVehicleLock();

      setLockingInfo(null);
      setIsVehicleLocked(false);
    } catch (e) {
      console.error('FORCE VEHICLE LOCK ERROR', e);
    }
  };

  if (!showSection) {
    return null;
  }

  const pathname = window.location.pathname.split('/')[1];

  return (
    <>
      <Modal
        isVisible={true}
        size={eventType === false ? 'sm' : 'md'}
        className="md:mt-28"
        bgClassName="items-start"
        headerChildren={
          <>
            {eventType === 'rent' && <ElementLabel bgColor="bg-sky-700 mr-2">Movo</ElementLabel>}
            {eventType === 'reservation' && (
              <ElementLabel bgColor="bg-orange-500 mr-2">Prenotazione</ElementLabel>
            )}
            <span className="hidden md:inline">Veicolo</span>{' '}
            {eventData.vehicle.plate ? eventData.vehicle.plate.toUpperCase() : ''}
          </>
        }
        onClose={() => {
          setShowCloseModalMessage(true);
        }}
        {...props}
      >
        {isVehicleLocked ? (
          <div className="flex flex-wrap justify-between my-5 bg-red-50 px-5 py-3 rounded-md">
            <div>
              <div className="font-semibold">Questo veicolo è già in uso</div>
              {lockingInfo && pathname === 'dashboard' && (
                <div className="flex flex-wrap text-sm gap-x-2 mt-1">
                  <div>
                    <span className="font-semibold">Operatore:</span> {lockingInfo.operator}
                  </div>
                  <div>
                    <span className="font-semibold">Data blocco:</span>{' '}
                    {new Date(lockingInfo.lockDate).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            {pathname === 'dashboard' && (
              <Button
                btnStyle="white"
                className="!text-red-500 mt-2 md:mt-0"
                onClick={forceVehicleLock}
              >
                Sblocca veicolo
              </Button>
            )}
          </div>
        ) : (
          <>
            {eventType === false ? (
              <>
                <div className="text-center mb-4 py-4">
                  <span className="py-2 px-4 bg-slate-100 mx-2 rounded-lg block md:inline">
                    <span className="md:hidden">Inizio:</span>{' '}
                    {dateTimeStart.format('DD/MM/YYYY, HH:mm')}
                  </span>
                  <FaChevronRight className="mb-1 text-sm hidden md:inline" />
                  <span className="py-2 px-4 bg-slate-100 mx-2 rounded-lg block md:inline mt-2 md:mt-0">
                    <span className="md:hidden">Fine:</span>{' '}
                    {dateTimeEnd.format('DD/MM/YYYY, HH:mm')}
                  </span>
                </div>
                <div className="flex flex-wrap md:flex-nowrap gap-2">
                  <Button
                    btnStyle="stitchedArea"
                    className="py-6 font-semibold"
                    onClick={() => {
                      setEventType('reservation');
                    }}
                  >
                    Nuova prenotazione
                  </Button>
                  <Button
                    btnStyle="stitchedArea"
                    className="py-6 font-semibold"
                    onClick={() => {
                      setEventType('rent');
                    }}
                  >
                    Nuovo movo
                  </Button>
                </div>
              </>
            ) : (
              <NewEventForm
                type={eventType}
                onSave={onClose}
                onBackButton={() => setEventType(false)}
                {...{ eventData, dateTimeStart, dateTimeEnd, calendarFilters, canOpenMovo }}
              />
            )}
          </>
        )}
      </Modal>

      <ModalConfirmDialog
        isVisible={showCloseModalMessage}
        handleCancel={() => {
          setShowCloseModalMessage(false);
        }}
        handleOk={() => {
          removeVehicleLock();
          onClose();
        }}
      />
    </>
  );
};

export default NewEventModal;
