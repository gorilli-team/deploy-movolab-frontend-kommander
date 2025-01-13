import React, { useState } from 'react';
import ElementLabel from '../UI/ElementLabel';
import { FaPen } from 'react-icons/fa';
import NoteModal from './NoteModal';

const Note = ({ vehicleId, rentId, reservationId, note, closeModal }) => {
  const [showNoteModal, setShowNoteModal] = useState(false);

  const mapNoteStatusLabel = (status) => {
    if (status === 'open') {
      return 'Aperto';
    }
    if (status === 'closed') {
      return 'Chiuso';
    }
  };

  const mapNoteStatusColor = (status) => {
    if (status === 'open') {
      return 'bg-yellow-600';
    }
    if (status === 'closed') {
      return 'bg-green-600';
    }
  };

  const closeDamageModal = () => {
    setShowNoteModal(false);
    closeModal();
  };

  return (
    <div key={note._id} className="mt-3">
      <div className="flex py-3 px-4 bg-slate-100 rounded-lg">
        <div className="w-3/4">
          <div className="flex">
            <div>
              <div className="text-md font-semibold py-1">{note.name} 
                <FaPen className="inline ml-2 mb-1 cursor-pointer hover:opacity-70" onClick={() => setShowNoteModal(true)} title="Modifica" />
              </div>
              <div className="text-sm mt-1 break-all">{note.description}</div>
              <h6 className="text-sm mt-2 text-gray-600">
                Inserita il: {new Date(note.date).toLocaleDateString()}
              </h6>
            </div>
          </div>
        </div>
        <div className="w-1/4">
          <div className="float-right space-x-2">
            <div className="md:flex">
              <div className="float-right">
                {note?.status !== undefined ? (
                  <ElementLabel bgColor={mapNoteStatusColor(note?.status)}>
                    {mapNoteStatusLabel(note?.status)}
                  </ElementLabel>
                ) : null}
                {note?.fromReservation ?
                  <ElementLabel className="ml-2" bgColor="bg-orange-500">
                    Prenotazione
                  </ElementLabel>
                  : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showNoteModal ? (
        <NoteModal
          vehicleId={vehicleId}
          rentId={rentId}
          reservationId={reservationId}
          note={note}
          closeModal={closeDamageModal}
        />
      ) : null}
    </div>
  );
};

export default Note;
