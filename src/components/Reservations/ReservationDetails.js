import React, { useContext, useState } from 'react';
import { UserContext } from '../../store/UserContext';
import { MOVOLAB_ROLE_ADMIN } from '../../utils/Utils';
import Notes from '../Notes/Notes';
import ReservationRecap from './ReservationRecap';
import ReservationExtras from './ReservationExtras';
import ReservationPriceCalculation from './ReservationPriceCalculation';
import ReservationExtraCosts from './ReservationExtraCosts';
import ReservationExtraFields from '../ExtraFields/ReservationExtraFields';
import ReservationInvoicing from './ReservationInvoicing';
import Payments from '../Payments/Payments';
import Invoices from '../Invoices/Invoices';
import Documents from '../Documents/Documents';

const ReservationDetails = ({ reservation, fetchReservation, fromCorporate }) => {
  const [expandAll, setExpandAll] = useState(false);

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN; // eslint-disable-line no-unused-vars

  const updatePrice = (reservation) => {
    fetchReservation();
  };

  const updatePayments = () => {
    fetchReservation();
  };

  return (
    <>
      {reservation?._id !== undefined ? (
        <div className="flex space-x-4 px-6">
          <div className="w-3/4">
            <ReservationRecap
              reservationData={reservation}
              expandFn={() => {
                setExpandAll(!expandAll);
              }}
              updatePrice={updatePrice}
              isExpanded={expandAll}
            />
            <ReservationExtraFields reservation={reservation} isExpanded={expandAll} />
            <ReservationExtras
              reservationData={reservation}
              phase={'pickUp'}
              disabled={reservation?.state !== 'draft' || isAdmin}
              updatePrice={updatePrice}
              isExpanded={expandAll}
            />
            <ReservationExtraCosts reservationData={reservation} isExpanded={expandAll} />
            <Notes reservation={reservation} isExpanded={expandAll} />
            <Payments elem={reservation} isExpanded={expandAll} />
            <Invoices invoices={reservation?.invoices} isExpanded={expandAll} />
            <Documents reservation={reservation} isExpanded={expandAll} />
          </div>
          <div className="w-1/4">
            <div className="sticky top-[77px]">
              <ReservationPriceCalculation
                reservation={reservation}
                fromCorporate={fromCorporate}
                updatePrice={updatePrice}
                className={'mt-0'}
                mode={'small'}
                fetchReservation={fetchReservation}
              />
              <ReservationInvoicing
                reservation={reservation}
                updatePayments={updatePayments}
                className="mt-0"
                mode={'small'}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center align-middle h-96">
          <div className="text-2xl font-semibold">Nessuna prenotazione disponibile</div>
        </div>
      )}
    </>
  );
};

export default ReservationDetails;
