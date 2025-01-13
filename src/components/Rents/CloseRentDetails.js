import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { http } from '../../utils/Utils';
import toast from 'react-hot-toast';
import moment from 'moment';

import RentRecap from '../Rents/RentRecap';
import Fuel from '../Rents/rentElements/Fuel';
import Damages from '../Damages/Damages';
import Notes from '../Notes/Notes';
import Documents from '../Documents/Documents';
import PriceCalculation from '../Rents/rentElements/PriceCalculation';
import RentExtraFields from '../ExtraFields/RentExtraFields';

import ExtraServices from './rentElements/ExtraServices';
import ExtraCosts from './rentElements/ExtraCosts';
import Franchises from './rentElements/Franchises';
import PickupDropoffInfo from './rentElements/PickupDropoffInfo';
import CardsHeader from '../UI/CardsHeader';
import Payments from '../Payments/Payments';
import Invoices from '../Invoices/Invoices';

const CloseRentDetails = ({ rent, closeRent, updateRent }) => {
  const history = useHistory();
  const [closeRentInfo, setCloseRentInfo] = useState({});
  const [updatedRent, setUpdatedRent] = useState(null);
  const [expandAll, setExpandAll] = useState(false);

  rent.dropOffDate = moment().format();

  const phase = 'dropOff';

  const isViewMode =
    rent?.state === 'fatturato' ||
    rent?.state === 'chiuso' ||
    rent?.state === 'incassato' ||
    rent?.state === 'parz incassato' ||
    rent?.state === 'parz fatturato' ||
    rent?.state === 'annullato' ||
    rent?.state === 'stornato';

  useEffect(() => {
    if (rent) {
      const data = {
        km: {
          pickUp: rent?.km?.pickUp || '0',
          dropOff: rent?.km?.dropOff || rent?.km?.pickUp || '0',
        },
        startTime: moment(rent.pickUpDate).format().slice(0, 16),
        closeTime: moment(rent.dropOffDate).format().slice(0, 16),
      };
      setCloseRentInfo(data);
      updatePrice(rent);
    }
  }, [rent]);

  const getCloseRentInfo = (info) => {
    setCloseRentInfo(info);
  };

  const updateCloseRentInfo = async () => {
    try {
      const data = {
        km: {
          pickUp: closeRentInfo.km.pickUp,
          dropOff: closeRentInfo.km.dropOff,
        },
        dropOffState: {
          fuelLevel: closeRentInfo.fuelLevel,
        },
        dropOffDate: closeRentInfo.closeTime,
        state: 'chiuso',
      };

      await http({
        url: `/rents/${rent._id}/close?mode=finalize`,
        method: 'PUT',
        form: data,
      });

      toast.success('Movo chiuso con successo 🎉');
      history.push(`/dashboard/movimenti/${rent._id}/cassa`);
    } catch (error) {
      console.error(error);
      toast.error(error?.error || 'Errore durante la chiusura del movo');
    }
  };

  const updatePrice = (rent) => {
    setUpdatedRent(rent);
  };

  return (
    <>
      <CardsHeader
        title="Chiusura movo"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
          },
          {
            children: 'Chiudi Movo',
            onClick: updateCloseRentInfo,
          },
        ]}
      />
      {rent && rent._id && (
        <div className="flex space-x-4 px-6">
          <div className="w-3/4">
            <RentRecap
              rent={rent}
              phase={phase}
              expandFn={() => {
                setExpandAll(!expandAll);
              }}
              isExpanded={expandAll}
            />
            <PickupDropoffInfo
              rent={rent}
              getCloseRentInfo={getCloseRentInfo}
              phase={phase}
              updatePrice={updatePrice}
              viewMode={isViewMode}
              returnCloseTime={(time) => { 
                closeRentInfo.closeTime = time; 
                setCloseRentInfo(closeRentInfo);
              }}
              isClosingMovo
            />
            <RentExtraFields rent={rent} isExpanded={expandAll} />
            <Fuel
              rent={rent}
              vehicle={rent.vehicle?._id}
              phase={phase}
              updatePrice={updatePrice}
              viewMode={isViewMode}
              isExpanded={expandAll}
            />
            <Damages
              rent={rent}
              vehicle={rent.vehicle?._id}
              phase={phase}
              updatePrice={updatePrice}
              isExpanded={expandAll}
            />
            <ExtraServices
              rentData={rent}
              phase={phase}
              updatePrice={updatePrice}
              isViewMode={isViewMode}
              isExpanded={expandAll}
            />
            <ExtraCosts rentData={rent} phase={phase} isExpanded={expandAll} />
            <Franchises
              rentData={rent}
              phase={phase}
              updatePrice={updatePrice}
              isExpanded={expandAll}
            />
            <Notes rent={rent} isExpanded={expandAll} />
            <Documents rent={rent} phase={phase} isExpanded={expandAll} onUpdate={updateRent} />
            <Payments elem={rent} isExpanded={expandAll} />
            <Invoices invoices={rent?.invoices} isExpanded={expandAll} />
          </div>
          <div className="w-1/4">
            <div className="sticky top-[77px]">
              <PriceCalculation
                rent={updatedRent || rent}
                phase={phase}
                mode={'small'}
                className="mt-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CloseRentDetails;
