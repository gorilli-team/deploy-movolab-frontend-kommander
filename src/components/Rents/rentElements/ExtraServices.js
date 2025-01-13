import React, { useContext, useEffect, useState } from 'react';
import { http } from '../../../utils/Utils';
import Button from '../../UI/buttons/Button';
import ElementLabelXS from '../../UI/ElementLabelXS';
import { mapCostCalculation } from '../../../utils/Extras';
import WhiteBox from '../../../components/UI/WhiteBox';
import ElementLabel from '../../UI/ElementLabel';
import { UserContext } from '../../../store/UserContext';

const ExtraServices = ({ rentData, phase, updatePrice, isViewMode, ...props }) => {
  const [extraServices, setExtraServices] = useState([]); //eslint-disable-line
  const [rent, setRent] = useState(rentData); //eslint-disable-line
  const rentId = rent?._id;

  const userContext = useContext(UserContext);
  let userData = userContext.data || {};
  const licenseType = userData?.client?.license?.licenseOwner;

  useEffect(() => {
    fetchExtraServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rent]);

  useEffect(() => {
    fetchRent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentId]);

  const fetchRent = async () => {
    const response = await http({ url: `/rents/${rentId}` });
    setRent(response);
    if (updatePrice) updatePrice(response);
  };

  const fetchExtraServices = async () => {
    if (!rent?.priceList?.extras?.length) return;
    // Get the initial extra services as a string
    let extraServicesIdsString = rent?.priceList?.extras?.map((extra) => extra).join(',');

    // Retrieve custom extra services for movolab clients
    if (licenseType === 'movolab') {
      const customExtraServices = await http({ url: `/pricing/extras` });

      // Ensure extras exist before iterating
      if (customExtraServices?.extras) {
        // Filter out extras that are already in the string and map the remaining ones
        const newExtras = customExtraServices.extras
          .filter(
            (extra) =>
              !extraServicesIdsString.includes(extra._id) && extra.licenseType === 'client', // Only include new extras with licenseType = 'client'
          )
          .map((extra) => extra._id); // Map to their ids

        // Join the existing string with new extra services, if any
        if (newExtras.length > 0) {
          extraServicesIdsString += ',' + newExtras.join(',');
        }
      }
    }

    const url = `/pricing/extras/list?ids=${extraServicesIdsString}&applicability=manual&insertionPhase=${phase}`;
    const response = await http({ url: url });

    if (licenseType === 'client') {
      response.extras = response.extras.filter((extra) => extra.licenseType === 'client');
    }

    response.extras.forEach((extraService) => {
      if (rent?.extraServices?.includes(extraService._id)) extraService.selected = true;
    });

    const pickUpExtraServicesIds = rent?.pickUpExtraServices?.map((extra) => extra._id);
    const dropOffExtraServicesIds = rent?.dropOffExtraServices?.map((extra) => extra._id);

    response.extras.forEach((extraService) => {
      if (pickUpExtraServicesIds?.includes(extraService._id)) extraService.selected = true;
      if (dropOffExtraServicesIds?.includes(extraService._id)) extraService.selected = true;
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

    const rentExtraServices = extraServices.map((extraService) => {
      if (extraService.selected) {
        return extraService._id;
      }
      return null;
    });

    let data = {};
    if (phase === 'pickUp') {
      data = {
        pickUpExtraServices: rentExtraServices.filter((extraService) => extraService !== null),
      };
    }
    if (phase === 'dropOff') {
      data = {
        dropOffExtraServices: rentExtraServices.filter((extraService) => extraService !== null),
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

    const updatedRent = await http({
      url: `/rents/extraServices/${rentId}?phase=${phase}`,
      method: 'PUT',
      form: data,
    });

    setRent(updatedRent?.rent);
    if (updatePrice) {
      updatePrice(updatedRent?.rent);
    }
  };

  // const pickUpExtraServices = rentData.pickUpExtraServices.map((extra) => ({
  //   selected: true,
  //   ...extra,
  // }));

  const boxLabels = [...extraServices].map((extra, index) =>
    extra.selected ? (
      <ElementLabel className="ml-2" bgColor="bg-gray-500 text-black" key={index}>
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
          Extra ({rent?.pickUpExtraServices?.length + rent?.dropOffExtraServices?.length}){' '}
          {boxLabels}
        </div>
      }
      {...props}
    >
      <div className="transition-all duration-1000">
        {extraServices?.length === 0 ? (
          <div className="flex flex-col">
            <div className="">Nessun Servizio Extra</div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {phase === 'dropOff' || rent.state === 'chiuso'
                ? rentData.pickUpExtraServices?.map((extraService) => (
                    <div
                      className={`flex border border-gray-100 rounded-lg py-3 px-4 bg-gray-100`}
                      key={extraService._id}
                    >
                      <div className="grow">
                        <div className="text-xs font-semibold">Inserito in apertura movo</div>

                        <div className="font-bold">{extraService.name}</div>
                        <div className="text-xs">{extraService.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
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
                        {extraService?.cost?.amount} € (
                        {mapCostCalculation(extraService?.cost?.calculation)})
                      </div>
                    </div>
                  ))
                : null}

              {true //phase === 'dropOff' || rent.state === 'chiuso'
                ? extraServices?.map((extraService) => (
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
                        {!isViewMode && (
                          <>
                            {updatePrice && (
                              <div className="ml-3">
                                <Button
                                  btnStyle="white"
                                  onClick={() => selectExtraService(extraService)}
                                >
                                  {extraService.selected ? 'Rimuovi' : 'Aggiungi'}
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                : null}
            </div>
          </>
        )}
      </div>
    </WhiteBox>
  );
};

export default ExtraServices;
