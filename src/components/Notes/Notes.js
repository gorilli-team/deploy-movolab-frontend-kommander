import React, { useEffect, useState } from 'react';
import { http } from '../../utils/Utils';
import Note from './Note';
import NoteModal from './NoteModal';
import Button from '../UI/buttons/Button';
import WhiteBox from '../../components/UI/WhiteBox';
import ToggleSwitch from '../UI/ToggleSwitch';
import PlusOutlineCircle from '../../assets/icons/PlusOutlineCircle';

const Notes = ({ rent, reservation, vehicle, expanded, noCollapsible, ...props }) => {
  const [openModal, setOpenModal] = useState(false);
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [notesType, setNotesType] = useState('all');
  const [countOpenNotes, setCountOpenNotes] = useState(0);

  const vehicleId = vehicle?._id;
  const reservationId = reservation?._id;
  const rentId = rent?._id;
  const collection = rentId ? 'rent' : reservationId ? 'reservation' : 'vehicle';

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotes = async () => {
    if (collection === 'vehicle') {
      const response = await http({ url: `/vehicles/vehicle/notes/${vehicleId}` });
      setNotes(response);
      filterNotes(response, 'open');
      setCountOpenNotes(response.filter((note) => note.status === 'open').length);
    }
    if (collection === 'reservation') {
      const response = await http({ url: `/reservations/notes/${reservationId}` });

      setNotes(response);
      filterNotes(response, 'open');
      setCountOpenNotes(response.filter((note) => note.status === 'open').length);
    }
    if (collection === 'rent') {
      const response = await http({ url: `/rents/notes/${rentId}` });

      if (rent?.reservation?._id) {
        const originalReservationNotes = await http({ url: `/reservations/notes/${rent?.reservation?._id}` });

        originalReservationNotes.forEach(note => {
          response.push({ fromReservation: rent?.reservation?._id, ...note });
        });
      }

      setNotes(response);
      filterNotes(response, 'open');
      setCountOpenNotes(response.filter((note) => note.status === 'open').length);
    }
  };

  const filterNotes = (notes, status) => {
    setNotesType(status);
    if (status === 'all') {
      setFilteredNotes(notes);
      return;
    }
    setFilteredNotes(notes.filter((note) => note.status === status));
  };

  const closeModal = () => {
    setOpenModal(false);
    fetchNotes();
  };

  return (
    <WhiteBox 
    className={noCollapsible ? 'mx-0 my-0 px-6 py-5' : 'mx-0'} 
    innerClassName="px-6 py-5" 
    isCollapsible={!(noCollapsible || false)} 
    isExpanded={expanded || props.isExpanded}
    headerChildren={(
      <div className="font-bold text-lg">
        Note ({countOpenNotes} {countOpenNotes === 1 ? 'nota aperta' : 'note aperte'})
      </div>
    )} {...props}>
          <div className="transition-all duration-1000">
            <div className="flex justify-between">
              <Button
                btnStyle="whiteLightButton"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenModal(true);
                }}
              >
                <PlusOutlineCircle /> Nuova Nota
              </Button>

              <ToggleSwitch switches={[
                {
                  label: 'Aperte',
                  onClick: () => {
                    filterNotes(notes, 'open');
                  }
                },
                {
                  label: 'Chiuse',
                  onClick: () => {
                    filterNotes(notes, 'closed');
                  }
                },
                {
                  label: 'Tutte',
                  onClick: () => {
                    filterNotes(notes, 'all');
                  }
                }
              ]} />
            </div>

            <div className="mt-2 mb-1">
              {/*<div>{mapType(notesType)}</div>*/}
              {filteredNotes.length === 0 ? (
                <h3 className="pt-3 italic text-center text-gray-500">Nessuna nota inserita</h3>
              ) : null}
              {filteredNotes.map((note) => (
                <Note
                  key={note._id}
                  vehicleId={vehicleId}
                  reservationId={reservationId}
                  rentId={rentId}
                  note={note}
                  closeModal={closeModal}
                />
              ))}
            </div>
          </div>
        {openModal ? (
          <NoteModal
            vehicleId={vehicleId}
            reservationId={reservationId}
            rentId={rentId}
            closeModal={closeModal}
          />
        ) : null}
    </WhiteBox>
  );
};

export default Notes;
