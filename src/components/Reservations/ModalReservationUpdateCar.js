import React, { useEffect, useState } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/buttons/Button';
import { FaCheck } from 'react-icons/fa';
import { http } from '../../utils/Utils';
import { getVehicleGroup } from '../../utils/Vehicles';
import { calculatePrice, convertPrice } from '../../utils/Prices';
import LoadingSpinner from '../../assets/icons/LoadingSpinner';
import toast from 'react-hot-toast';

export function ModalReservationUpdateCar({
  showModal,
  updateShowModal,
  closeShowModalAndUpdate,
  reservationData,
  useVehicle = null
}) {
  const [vehicles, setVehicles] = useState([]);
  const [priceList, setPriceList] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (reservationData) {
      if (useVehicle) {
        setVehicles([useVehicle]);
      } else {
        fetchAvailableVehicles();
      }
  
      fetchPriceList();
    }
  }, [useVehicle, reservationData]);

  const strOrObjId = (item) => {
    return (typeof item == 'string') ? item : item?._id;
  }

  const fetchPriceList = async () => 
    setPriceList(await http({ url: `/pricing/priceLists/${strOrObjId(reservationData?.priceList)}` }));

  const fetchAvailableVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await http({
        url: '/rents/availability/getAvailSimple',
        method: 'POST',
        form: {
          workflow: reservationData?.workflow?._id,
          movementType: reservationData?.movementType,
          group: [],
          pickUpLocation: reservationData?.pickUpLocation?._id,
          pickUpDate: reservationData?.pickUpDate,
          dropOffLocation: reservationData?.dropOffLocation?._id,
          dropOffDate: reservationData?.dropOffDate,
        },
      });

      setVehicles(response?.result);
    } catch (error) {
      console.error('error', error);
    }

    setIsLoading(false);
  };

  const updateVehicle = async (vehicleId) => {
    try {
      const updatedReservation = await http({
        url: `/reservations/${reservationData._id}/replaceVehicle`,
        method: 'PUT',
        form: {
          vehicle: vehicleId,
        },
      });

      closeShowModalAndUpdate(updatedReservation);
    } catch (error) {
      console.error('error', error);
      toast.error(error);
    }
  };

  const amountInfo = reservationData?.price?.priceInfo?.amountInfo || 0;
  const vatPercentage = priceList?.configuration?.fares?.vatPercentage || 0;

  const getFare = (group) => priceList?.fares?.find((item) =>
    item?.group?._id === group?._id && item?.range?._id === reservationData?.range
  )?.fare;

  const fetchPrice = (group) => calculatePrice(reservationData?.movementType, getFare(group), reservationData?.totalDays, 0, 0, 2);

  const fetchFinalPrice = (group) => {
    const price = fetchPrice(group) * (1 + vatPercentage / 100);
    return (amountInfo.discountAmount ?
      (price - amountInfo.discountAmount) :
      (amountInfo.discountPercentage ?
        (price - (price * amountInfo.discountPercentage / 100)) : price));
  }

  return (
    <Modal
      headerChildren={`Cambia Veicolo`}
      isVisible={showModal}
      onClose={updateShowModal}
    // innerClassName={'px-3 py-4'}
    >
      {isLoading ? (
        <LoadingSpinner className="px-10" addText />
      ) : (
        <>
          {vehicles.length > 0 ? (
            <>
              <div className="-mx-6 -mt-4 overflow-x-auto">
                <table className="table-auto w-full">
                  {/* Table header */}
                  <thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="first:pl-5 last:pr-5 px-2 py-3 whitespace-nowrap">
                        <div className="font-semibold text-left">Targa</div>
                      </th>
                      <th className="px-2 py-3 whitespace-nowrap">
                        <div className="font-semibold text-left">Km</div>
                      </th>
                      <th className="px-2 py-3 whitespace-nowrap">
                        <div className="font-semibold text-left">Modello</div>
                      </th>
                      <th className="px-2 py-3 whitespace-nowrap">
                        <div className="font-semibold text-left">Gruppo</div>
                      </th>
                      <th className="px-2 py-3 whitespace-nowrap">
                        <div className="font-semibold text-left">Giorni</div>
                      </th>
                      <th className="px-2 py-3 whitespace-nowrap">
                        <div className="font-semibold text-left">Costo</div>
                      </th>
                      <th className="px-2 py-3 whitespace-nowrap">
                        <div className="font-semibold text-left">Iva Incl</div>
                      </th>
                      <th className="px-2 py-3 whitespace-nowrap">
                        <div className="font-semibold text-left">Sconto</div>
                      </th>
                      <th className="px-2 py-3 whitespace-nowrap">
                        <div className="font-semibold text-left">Prezzo finale</div>
                      </th>
                      <th className="first:pl-5 last:pr-5 px-2 py-3 whitespace-nowrap"></th>
                    </tr>
                  </thead>
                  {/* Table body */}
                  <tbody className="text-sm divide-y divide-gray-200">
                    {vehicles.map((vehicle, index) => (
                      <tr
                        key={index}
                        onClick={(e) => { }}
                        className="hover:bg-gray-50"
                      >
                        <td className="first:pl-5 last:pr-5 px-2 py-3 whitespace-nowrap">
                          <p className="text-left font-semibold text-gray-600">
                            {vehicle.plate ? vehicle.plate.toUpperCase() : 'N/A'}
                          </p>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <p className="text-left font-semibold text-gray-600">{vehicle.km}</p>
                        </td>
                        <td className="px-2 py-1 flex items-center gap-2 whitespace-nowrap">
                          <div>
                            <img
                              src={vehicle.imageUrl || vehicle?.version?.imageUrl}
                              className="max-w-12"
                            />
                          </div>
                          <p className="px-2 text-left font-semibold text-gray-600 py-2">
                            {vehicle.brand?.brandName} {vehicle.model?.modelName}
                          </p>
                        </td>
                        <td className="px-2 pr-5 py-3 whitespace-nowrap">
                          <p className="text-left font-semibold text-gray-600">
                            {getVehicleGroup(vehicle).group?.mnemonic !== undefined}
                            {vehicle.version?.group?.mnemonic !== undefined
                              ? `${getVehicleGroup(vehicle).group?.mnemonic}`
                              : 'Nessun Gruppo'}
                          </p>
                        </td>
                        <td className="px-2 pr-5 py-3 whitespace-nowrap">
                          {reservationData?.totalDays}
                        </td>
                        <td className="px-2 pr-5 py-3 whitespace-nowrap">
                          {fetchPrice(getVehicleGroup(vehicle).group) !== undefined ?
                            convertPrice(fetchPrice(getVehicleGroup(vehicle).group)) : 'N/A'}
                        </td>
                        <td className="px-2 pr-5 py-3 whitespace-nowrap">
                          {fetchPrice(getVehicleGroup(vehicle).group) !== undefined ?
                            convertPrice(fetchPrice(getVehicleGroup(vehicle).group) * (1 + vatPercentage / 100)) : 'N/A'}
                        </td>
                        <td className="px-2 pr-5 py-3 whitespace-nowrap">
                          {amountInfo.discountAmount ?
                            convertPrice(amountInfo.discountAmount) :
                            (amountInfo.discountPercentage ?
                              amountInfo.discountPercentage + '%' : '0')}
                        </td>
                        <td className="px-2 pr-5 py-3 whitespace-nowrap">
                          {fetchPrice(getVehicleGroup(vehicle).group) !== undefined ?
                            convertPrice(fetchFinalPrice(getVehicleGroup(vehicle).group)) : 'N/A'}
                        </td>
                        {!useVehicle ? <td>
                          <Button
                            btnStyle="white"
                            className="border border-sky-600 text-sm mr-4"
                            onClick={() => {
                              updateVehicle(vehicle?._id);
                            }}
                          >
                            <FaCheck />
                          </Button>
                        </td> : <td />}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end w-full pt-2">
                <Button type="button" className="!py-1 !text-red-500" btnStyle="white" onClick={updateShowModal}>
                  Annulla
                </Button>
                {useVehicle ? <Button type="button" className="!py-1" btnStyle="white" onClick={() => updateVehicle(useVehicle?._id)}>
                  Conferma
                </Button> : null}
              </div>
            </>
          ) : (
            <div className="p-5 font-semibold">Nessun veicolo disponibile</div>
          )}
        </>
      )
      }
    </Modal >
  );
}

export default ModalReservationUpdateCar;
