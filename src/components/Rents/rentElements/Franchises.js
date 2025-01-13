import React, { useEffect, useState } from 'react';
import { http } from '../../../utils/Utils';
import ElementLabel from '../../UI/ElementLabel';
import { convertPrice } from '../../../utils/Prices';
import WhiteBox from '../../../components/UI/WhiteBox';
import Button from '../../UI/buttons/Button';

const retrieveFranchise = async (franchiseId) => {
  const franchise = await http({
    url: `/vehicles/franchise/${franchiseId}`,
  });
  return franchise;
};

const fetchKaskoFranchise = async (priority, franchisesList, rent) => {
  let vehicleKaskoFranchise = {};

  if (priority === 'vehicle' && rent?.vehicle?.franchises?.kaskoFranchise) {
    vehicleKaskoFranchise = await http({
      url: `/vehicles/franchise/${rent?.vehicle?.franchises?.kaskoFranchise}`,
    });
    if (vehicleKaskoFranchise !== undefined) vehicleKaskoFranchise.selected = true;
    return vehicleKaskoFranchise;
  } else {
    if (!franchisesList) return;
    const kaskoFranchiseId = franchisesList.filter(
      (franchise) => franchise?.category === 'kasko',
    )[0]?.franchise;

    if (!kaskoFranchiseId) return;
    vehicleKaskoFranchise = await http({
      url: `/vehicles/franchise/${kaskoFranchiseId}`,
    });
    vehicleKaskoFranchise.selected = true;
    return vehicleKaskoFranchise;
  }
};

const fetchRcaFranchise = async (priority, franchisesList, rent) => {
  let vehicleRcaFranchise = {};
  if (priority === 'vehicle' && rent?.vehicle?.franchises?.rcaFranchise) {
    vehicleRcaFranchise = await http({
      url: `/vehicles/franchise/${rent?.vehicle?.franchises?.rcaFranchise}`,
    });
    return vehicleRcaFranchise;
  } else {
    if (!franchisesList) return;
    const rcaFranchiseId = franchisesList.filter((franchise) => franchise?.category === 'rca')[0]
      ?.franchise;

    if (!rcaFranchiseId) return;
    vehicleRcaFranchise = await http({
      url: `/vehicles/franchise/${rcaFranchiseId}`,
    });
    return vehicleRcaFranchise;
  }
};

const fetchIfFranchise = async (priority, franchisesList, rent) => {
  let vehicleIfFranchise = {};

  if (priority === 'vehicle' && rent?.vehicle?.franchises?.ifFranchise) {
    vehicleIfFranchise = await http({
      url: `/vehicles/franchise/${rent?.vehicle?.franchises?.ifFranchise}`,
    });
    return vehicleIfFranchise;
  } else {
    if (!franchisesList) return;
    const ifFranchiseId = franchisesList.filter((franchise) => franchise?.category === 'if')[0]
      ?.franchise;

    if (!ifFranchiseId) return;
    vehicleIfFranchise = await http({
      url: `/vehicles/franchise/${ifFranchiseId}`,
    });
    return vehicleIfFranchise;
  }
};

export const fetchFranchises = async (rent, phase) => {
  const franchises = {};

  try {
    const franchisePriority = rent?.priceList?.franchisePriority;

    const group = rent.group?._id;

    const franchisesList = rent.priceList?.franchises?.filter((franchise) => {
      return franchise.group === group;
    });

    if (phase !== 'pickUp') {
      const kasko = rent?.kaskoFranchise?.franchise;
      if (kasko) kasko.selected = true;

      franchises.kasko = kasko;
    } else {
      franchises.kasko = await fetchKaskoFranchise(franchisePriority, franchisesList, rent);
    }

    if (rent?.rcaFranchise?.franchise) {
      const rcaFranchiseData = await retrieveFranchise(rent?.rcaFranchise?.franchise);
      rcaFranchiseData.selected = rent?.rcaFranchise?.selected;

      franchises.rca = rcaFranchiseData;
    } else {
      franchises.rca = await fetchRcaFranchise(franchisePriority, franchisesList, rent);
    }

    if (rent?.ifFranchise?.franchise) {
      const ifFranchiseData = await retrieveFranchise(rent?.ifFranchise?.franchise);
      ifFranchiseData.selected = rent?.ifFranchise?.selected;

      franchises.if = ifFranchiseData;
    } else {
      franchises.if = await fetchIfFranchise(franchisePriority, franchisesList, rent);
    }
  } catch (err) {
    console.error(err);
  }

  return franchises;
};

const Franchises = ({ rentData, updatePrice, phase, ...props }) => {
  const [kaskoFranchise, setKaskoFranchise] = useState({});
  const [ifFranchise, setIfFranchise] = useState({});
  const [rcaFranchise, setRcaFranchise] = useState({});

  const rent = rentData;
  const rentId = rent?._id;

  const franchisesType = rent?.priceList?.franchisePriority;

  const getFranchises = async (...props) => {
    const frs = await fetchFranchises(...props);

    setKaskoFranchise(frs.kasko);
    setIfFranchise(frs.if);
    setRcaFranchise(frs.rca);

    updateKaskoFranchise(frs.kasko);
  };

  useEffect(() => {
    getFranchises(rent, phase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateKaskoFranchise = async (franchise) => {
    if (phase !== 'pickUp') return;
    if (!franchise) return;

    const data = {
      kaskoFranchise: {
        franchise: franchise._id,
        maxAmount: franchise.value,
        selected: true,
      },
      price: {
        ...rent.price,
        kaskoFranchiseAmount: franchise.value,
      },
    };
    const rentResponse = await http({
      url: `/rents/franchises/kasko/${rentId}`,
      method: 'PUT',
      form: data,
    });

    if (updatePrice) updatePrice(rentResponse);
  };

  const addFranchise = async (franchiseName, selected) => {
    const getRent = await http({
      url: `/rents/${rentId}`,
    });
    if (franchiseName === 'if') {
      const data = {
        ...getRent,
        ifFranchise: {
          ...getRent.ifFranchise,
          franchise: ifFranchise._id,
          maxAmount: ifFranchise.value,
          selected,
        },
        price: {
          ...getRent.price,
          ifFranchiseAmount: !ifFranchise.selected ? ifFranchise.value : 0,
        },
      };

      const updatedRent = await http({
        url: `/rents/franchises/${rentId}`,
        method: 'PUT',
        form: data,
      });
      setIfFranchise({
        ...ifFranchise,
        selected,
      });
      updatePrice(updatedRent);
    }
    if (franchiseName === 'rca') {
      const data = {
        ...getRent,
        rcaFranchise: {
          ...getRent.rcaFranchise,
          franchise: rcaFranchise._id,
          maxAmount: rcaFranchise.value,
          selected,
        },
        price: {
          ...getRent.price,
          rcaFranchiseAmount: !rcaFranchise.selected ? rcaFranchise.value : 0,
        },
      };

      const updatedRent = await http({
        url: `/rents/franchises/${rentId}`,
        method: 'PUT',
        form: data,
      });
      setRcaFranchise({
        ...rcaFranchise,
        selected,
      });
      updatePrice(updatedRent);
    }
  };

  const showFranchises = [
    { franchise: kaskoFranchise, name: 'Franchigia Kasko', selectable: false },
    { franchise: rcaFranchise, name: 'Franchigia RCA', selectable: 'rca' },
    { franchise: ifFranchise, name: 'Franchigia Incendio/Furto', selectable: 'if' },
  ];

  return (
    <WhiteBox
      className="mx-0"
      innerClassName="px-6 py-5"
      isCollapsible="true"
      headerChildren={
        <div className="font-bold text-lg">
          Franchigie
          {kaskoFranchise?.selected && (
            <ElementLabel bgColor="bg-gray-600" className="ml-2">
              KASKO
            </ElementLabel>
          )}
          {rcaFranchise?.selected && (
            <ElementLabel bgColor="bg-orange-600" className="ml-2">
              RCA
            </ElementLabel>
          )}
          {ifFranchise?.selected && (
            <ElementLabel bgColor="bg-yellow-600" className="ml-2">
              I/F
            </ElementLabel>
          )}
        </div>
      }
      {...props}
    >
      <div className="grow">
        {/*<strong className="font-bold">Preferenza Franchigie</strong>*/}
        <strong className="font-bold">
          {franchisesType === 'vehicle'
            ? 'Franchigie del Veicolo'
            : franchisesType === 'priceList'
            ? 'Franchigie del Listino'
            : ''}
        </strong>
      </div>

      <div className="flex flex-col mt-2 gap-2">
        {showFranchises.map((f, index) =>
          f.franchise?._id ? (
            <div
              className={`flex border items-center border-gray-100 rounded-lg py-3 px-4 ${
                f.franchise.selected ? 'bg-gray-100' : 'bg-white'
              }`}
              key={index}
            >
              <div className="grow">
                <span className="font-bold">{f.name}</span>
                {/*f.franchise.selected && (
                  <ElementLabel bgColor="bg-green-600" className="ml-3" children="Abilitata" />
                )*/}
                <div className="text-xs">{f.franchise.description}</div>
              </div>
              <div className="flex items-center">
                <div className="text-xs">
                  <span className="font-semibold">Valore:</span> {convertPrice(f.franchise.value)}
                  {' - '}
                  <span className="font-semibold">Percentuale:</span> {f.franchise.percent}%
                </div>
                {phase === 'dropOff' &&
                  rent?.state !== 'chiuso' &&
                  rent?.state !== 'fatturato' &&
                  rent?.state !== 'incassato' &&
                  rent?.state !== 'parz incassato' &&
                  rent?.state !== 'parz fatturato' &&
                  rent?.state !== 'stornato' &&
                  (f.selectable ? (
                    <Button
                      btnStyle="white"
                      className="ml-3"
                      onClick={() => addFranchise(f.selectable, !f.franchise.selected)}
                    >
                      {f.franchise.selected ? 'Rimuovi' : 'Aggiungi'}
                    </Button>
                  ) : (
                    <Button btnStyle="white" className="ml-3" disabled>
                      Abilitata
                    </Button>
                  ))}
              </div>
            </div>
          ) : (
            <div
              className={`flex border items-center border-gray-100 rounded-lg py-3 px-4 bg-white`}
              key={index}
            >
              <div className="grow">
                <div className="font-bold">{f.name}</div>
              </div>
              <div className="ml-2 flex">
                <div className="mr-2 mt-1">
                  <div className="text-xs">Nessuna franchigia disponibile</div>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </WhiteBox>
  );
};

export default Franchises;
