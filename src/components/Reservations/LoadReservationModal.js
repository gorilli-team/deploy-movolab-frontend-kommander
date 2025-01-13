import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { http } from '../../utils/Utils';

import { TextField } from '../Form/TextField';
import FormLabel from '../UI/FormLabel';
import Button from '../UI/buttons/Button';
import { FaExclamationCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Modal from '../UI/Modal';

const LoadReservationModal = ({ returnReservationId, closeModal }) => {
  const form = useForm();
  const [showReservations, setShowReservations] = useState(false);
  const [reservations, setReservations] = useState([]);

  const searchReservations = async (data) => {
    if (!data.code) {
      toast.error('Inserisci un codice prenotazione');
    }
    const response = await http({ url: `/reservations/code/${encodeURIComponent(data.code)}` });
    setReservations(response);
    setShowReservations(true);
  };

  const fetchReservation = async (id) => {
    if (!id) {
      toast.error('Inserisci un codice prenotazione');
    }
    returnReservationId(id);
  };

  return (
    <Modal
      isVisible={true}
      size="xs"
      onClose={closeModal}
      innerClassName="px-6 py-4 relative"
      headerChildren="Carica prenotazione"
    >
      {/*body*/}
      <div className="relative flex-auto">
        <form onSubmit={form.handleSubmit(searchReservations)}>
          <fieldset disabled={form.formState.isSubmitting} className="w-full">
            {!showReservations ? (
              <>
                <div className="w-full">
                  <FormLabel>Codice Prenotazione</FormLabel>
                  <TextField form={form} name="code" placeholder="Codice Prenotazione" />
                </div>
                <div className="flex flex-wrap justify-end mt-2">
                  <Button btnStyle="white" className="!py-1">
                    Cerca
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap -mx-3 mt-2 ">
                <div className="w-full px-3">
                  <div className="w-full">
                    <div className="font-semibold">
                      Prenotazioni trovate ({reservations.length})
                    </div>
                    <div className="text-sm">Valore inserito: {form.getValues('code')}</div>
                    <div className="overflow-y-auto max-h-80">
                      {reservations.map((reservation) => {
                        return (
                          <div
                            key={reservation._id}
                            className="bg-slate-100 rounded-lg hover:bg-slate-50 mt-2 p-4 cursor-pointer"
                            onClick={() => {
                              fetchReservation(reservation._id);
                            }}
                          >
                            <div className="flex">
                              <div className="text-md font-semibold">Codice:</div>
                              <div className="text-sm pl-3 pt-0.5">{reservation?.code}</div>
                            </div>
                            <div className="flex">
                              <div className="text-md font-semibold">Targa:</div>
                              <div className="text-sm pl-3 pt-0.5">
                                {reservation?.vehicle?.plate
                                  ? reservation?.vehicle.plate.toUpperCase()
                                  : ''}
                              </div>
                            </div>
                            <div className="flex">
                              <div className="text-md font-semibold">Cliente:</div>
                              <div className="text-sm pl-3 pt-0.5">
                                {reservation?.customerFullName}
                              </div>
                            </div>
                            <div className="flex">
                              <div className="text-md font-semibold">Conducente:</div>
                              <div className="text-sm pl-3 pt-0.5">
                                {reservation?.driverFullName}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {reservations.length === 0 && (
                      <div className="bg-white font-semibold text-sm rounded-lg border mt-2 p-4">
                        <FaExclamationCircle className="inline" /> Codice prenotazione inesistente o
                        già utilizzato.
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-end mt-3">
                    <Button
                      btnStyle="white"
                      className="!py-1"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowReservations(false);
                      }}
                    >
                      Cerca Altro
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </fieldset>
        </form>
      </div>
    </Modal>
  );
};

export default LoadReservationModal;
