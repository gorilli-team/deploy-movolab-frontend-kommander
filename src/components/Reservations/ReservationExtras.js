import React, { useEffect, useState } from 'react';
import { http } from '../../utils/Utils';
import Button from '../UI/buttons/Button';
import ElementLabelXS from '../UI/ElementLabelXS';
import { mapCostCalculation } from '../../utils/Extras';
import WhiteBox from '../UI/WhiteBox';
import ElementLabel from '../UI/ElementLabel';

const ReservationExtras = ({ reservationData, phase, disabled, updatePrice, ...props }) => {
  const [extraServices, setExtraServices] = useState([]); //eslint-disable-line
  const [reservation, setReservation] = useState(reservationData); //eslint-disable-line

  useEffect(() => {
    setReservation(reservationData);
  }, [reservationData]);

  const reservationId = reservation?._id;

  const shouldBeShown = (extraService) => {
    if (extraService.selected === true) {
      return true;
    }
    return !disabled;
  };

  useEffect(() => {
    fetchExtraServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservation]);

  const fetchExtraServices = async () => {
    if (!reservation?.priceList?.extras?.length) return;
    const extraServicesIdsString = await reservation?.priceList?.extras
      ?.map((extra) => extra)
      .join(',');
    const url = `/pricing/extras/list?ids=${extraServicesIdsString}&applicability=manual&insertionPhase=${phase}`;
    const response = await http({ url: url });

    //get an array with the reservationExtraServices ids
    const reservationExtraServicesIds = reservation?.reservationExtraServices?.map(
      (extraService) => extraService._id,
    );

    response.extras.forEach((extraService) => {
      if (reservationExtraServicesIds?.includes(extraService._id)) extraService.selected = true;
    });
    setExtraServices(response.extras);
  };

  const selectExtraService = async (extraService) => {
    extraService.selected = !extraService.selected;

    if (extraService.selected) {
      if (extraService.manualRule?.parameter === 'furto') {
        extraServices.forEach((extra) => {
          if (extra.manualRule?.parameter === 'furto' && extra._id !== extraService._id) {
            extra.selected = false;
          }
        });
      }
      if (extraService.manualRule?.parameter === 'kasko') {
        extraServices.forEach((extra) => {
          if (extra.manualRule?.parameter === 'kasko' && extra._id !== extraService._id) {
            extra.selected = false;
          }
        });
      }
      if (extraService.manualRule?.parameter === 'rca') {
        extraServices.forEach((extra) => {
          if (extra.manualRule?.parameter === 'rca' && extra._id !== extraService._id) {
            extra.selected = false;
          }
        });
      }
    }
    setExtraServices([...extraServices]);

    const retrievedExtraServices = extraServices.map((extraService) => {
      if (extraService.selected) {
        return extraService._id;
      }
      return null;
    });

    let data = {};
    if (phase === 'pickUp') {
      data = {
        reservationExtraServices: retrievedExtraServices.filter(
          (extraService) => extraService !== null,
        ),
      };
    }

    if (extraService?.manualRule?.parameter === 'furto') {
      data.ifFranchiseReduction = extraService.selected ? extraService.manualRule?.reduction : 0;
    }
    if (extraService?.manualRule?.parameter === 'kasko') {
      data.kaskoFranchiseReduction = extraService.selected ? extraService.manualRule?.reduction : 0;
    }
    if (extraService?.manualRule?.parameter === 'rca') {
      data.rcaFranchiseReduction = extraService.selected ? extraService.manualRule?.reduction : 0;
    }

    const updatedReservation = await http({
      url: `/reservations/extraServices/${reservationId}?phase=${phase}`,
      method: 'PUT',
      form: data,
    });

    setReservation(updatedReservation?.reservation);
    if (updatePrice) {
      updatePrice(updatedReservation?.reservation);
    }
  };

  if (disabled && reservation?.reservationExtraServices?.length === 0) return null;

  const boxLabels = extraServices.map((extra) =>
    extra.selected ? (
      <ElementLabel className="ml-2" bgColor="bg-gray-100 !text-black" key={extra._id}>
        {extra.name}
      </ElementLabel>
    ) : null,
  );

  return (
    <WhiteBox
      className="mx-0"
      innerClassName="px-6 py-5"
      isCollapsible="true"
      headerChildren={
        <div className="font-bold text-lg">
          Extra ({reservation?.reservationExtraServices?.length}) {boxLabels}
        </div>
      }
      {...props}
    >
      <div className="transition-all duration-1000">
        {extraServices?.length === 0 ? (
          <div className="mt-5 flex space-x-5">
            <div className="flex flex-col">
              <div className="">Nessun Servizio Extra</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {extraServices?.map((extraService) =>
              shouldBeShown(extraService) ? (
                <div
                  className={`flex border border-gray-100 rounded-lg py-3 px-4 ${
                    extraService.selected ? 'bg-gray-100' : 'bg-white'
                  }`}
                  key={extraService._id}
                >
                  <div className="grow">
                    {extraService.manualRule?.parameter === 'furto' && (
                      <ElementLabelXS
                        bgColor="bg-yellow-600"
                        text={`Riduzione Franchigia I/F -${extraService.manualRule?.reduction}%`}
                      />
                    )}
                    {extraService.manualRule?.parameter === 'kasko' && (
                      <ElementLabelXS
                        bgColor="bg-gray-600"
                        text={`Riduzione Franchigia Kasko -${extraService.manualRule?.reduction}%`}
                      />
                    )}
                    {extraService.manualRule?.parameter === 'rca' && (
                      <ElementLabelXS
                        bgColor="bg-orange-600"
                        text={`Riduzione Franchigia RCA -${extraService.manualRule?.reduction}%`}
                      />
                    )}
                    <div className="font-bold">{extraService.name}</div>
                    <div className="text-xs">{extraService.description}</div>
                  </div>
                  <div className="flex m-auto items-center">
                    <div>
                      {extraService?.cost?.amount} € (
                      {mapCostCalculation(extraService?.cost?.calculation)})
                    </div>
                    {updatePrice && reservation.state === 'draft' && (
                      <div className="ml-3">
                        <Button btnStyle="white" onClick={() => selectExtraService(extraService)}>
                          {extraService.selected ? 'Rimuovi' : 'Aggiungi'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>
    </WhiteBox>
  );
};

export default ReservationExtras;
