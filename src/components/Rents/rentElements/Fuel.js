import React, { useEffect, useState } from 'react';
import { http } from '../../../utils/Utils';
import { convertPrice } from '../../../utils/Prices';
import { getVehicleGroup } from '../../../utils/Vehicles';
import WhiteBox from '../../../components/UI/WhiteBox';

const fuelTypes = [
  { value: 'benzina', label: 'Benzina', color: 'bg-[#ff0000]' },
  { value: 'diesel', label: 'Diesel', color: 'bg-[#ffd302]' },
  { value: 'gpl', label: 'GPL', color: 'bg-[#008ef0]' },
  { value: 'metano', label: 'Metano', color: 'bg-[#008ef0]' },
  { value: 'elettrico', label: 'Elettrico', color: 'bg-[#61d140]' },
  { value: 'ibrida', label: 'Ibrida', color: 'bg-[#61d140]' },
  { value: 'ibrido_plug-in', label: 'Ibrida Plug-in', color: 'bg-[#61d140]' },
  { value: 'mild_hybrid', label: 'Mild Hybrid', color: 'bg-[#61d140]' },
  { value: 'altro', label: 'Altro', color: 'bg-slate-100' },
];

export const findFuelType = (fuelType) => fuelTypes.find((ft) => ft.value === fuelType);

export const FuelLevel = ({
  level = 0,
  max = 9,
  className = '',
  elemsClassName = 'px-6 py-1',
  onSelect = null,
  bgColor = 'bg-slate-300',
}) => (
  <div className={`flex flex-wrap gap-2 text-sm text-slate-400 font-semibold ${className}`}>
    {Array(max)
      .fill()
      .map((_, i) => (
        <button
          className={`border border-slate-300 rounded-lg ${
            onSelect && 'hover:bg-slate-100 hover:text-slate-400 active:bg-slate-200 cursor-pointer'
          } 
          ${level >= i && `${bgColor} text-white`} ${elemsClassName}`}
          onClick={() => onSelect && onSelect(i)}
          key={i}
        >
          {i === 0 ? 'R' : i}
        </button>
      ))}
  </div>
);

const Fuel = ({ rent, phase, updatePrice, viewMode = false, ...props }) => {
  // const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const [selected, setSelected] = useState();

  const vehicle = rent?.vehicle;
  const fuelCapacity = rent?.vehicle?.version?.fuelCapacity;
  const fuelType = rent?.vehicle?.version?.powerSupply;
  const vehicleGroup = getVehicleGroup(vehicle).group;
  const [fuelPrice, setFuelPrice] = useState(undefined);
  const [calculatedFuelCost, setCalculatedFuelCost] = useState(0);
  const [finalFuelCost, setFinalFuelCost] = useState(rent.price.fuelExtraAmount || 0);

  useEffect(() => {
    fetchFuelExtraServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFuelExtraServices = async () => {
    if (!rent?.priceList?.extras?.length) return;
    const extraServicesIdsString = await rent?.priceList?.extras?.map((extra) => extra).join(',');
    const url = `/pricing/extras/list?ids=${extraServicesIdsString}&applicability=automatic&ruleType=fuel`;
    const response = await http({ url: url });
    const fuelCost = response.extras.find((extra) => {
      return (
        extra.groups.includes(vehicleGroup?._id) && extra?.automaticRule?.fuelCategory === fuelType
      );
    });

    setFuelPrice(fuelCost?.cost?.amount || 2);
  };

  const calculateConsumption = () => {
    const capacity = fuelCapacity || 50;
    const consumption = rent?.pickUpState.fuelLevel - selected;
    if (consumption > 0) {
      const fuelConsumption = (consumption * capacity) / 8;
      return fuelConsumption;
    }
    return 0;
  };

  const calculateExtraPrice = (level) => {
    if (!fuelPrice) return;
    const capacity = fuelCapacity || 50;
    const consumption = rent?.pickUpState.fuelLevel - level;

    if (consumption > 0) {
      const fuelConsumption = (consumption * capacity) / 8;

      const fuelCost = fuelConsumption * fuelPrice;
      return fuelCost;
    }
    return 0;
  };

  useEffect(() => {
    fetchFuelLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fuelPrice]);

  const fetchFuelLevel = async () => {
    const response = await http({
      url: `/rents/fuel/${rent._id}?phase=${phase}`,
      method: 'GET',
    });

    if (response) {
      let calculatedExtraPrice;

      if (response?.dropOffFuel !== undefined) {
        setSelected(response.dropOffFuel);
        calculatedExtraPrice = calculateExtraPrice(response.fuelLevel);
        setCalculatedFuelCost(calculatedExtraPrice);
      } else if (response?.pickUpFuel !== undefined) {
        setSelected(response.pickUpFuel);
        calculatedExtraPrice = calculateExtraPrice(response.fuelLevel);
        setCalculatedFuelCost(calculatedExtraPrice);
      }
    }
  };

  const updateFinalFuelCost = async (fuelCost, fuelLevel) => {
    setFinalFuelCost(fuelCost);

    const data = {
      fuelLevel: fuelLevel,
      fuelExtraAmount: fuelCost,
    };

    const updatedRent = await http({
      url: `/rents/fuel/${vehicle._id}?rentId=${rent?._id}&phase=${phase}`,
      method: 'PUT',
      form: data,
    });

    updatePrice(updatedRent?.updatedRent);
  };

  const updateFuel = (level) => {
    try {
      setSelected(level);

      const data = {
        fuelLevel: level,
      };

      if (phase === 'pickUp') {
        http({
          url: `/rents/fuel/${vehicle._id}?rentId=${rent?._id}&phase=${phase}`,
          method: 'PUT',
          form: data,
        });
      }
      if (phase === 'dropOff') {
        const calculatedExtraPrice = calculateExtraPrice(level);
        setCalculatedFuelCost(calculatedExtraPrice);
        updateFinalFuelCost(calculatedExtraPrice, level);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const updateCustomFuelCost = (cost) => {
    setFinalFuelCost(cost);
    updateFinalFuelCost(cost, selected);
  };

  const fuelTypeInfos = findFuelType(fuelType.toLowerCase());

  return (
    <WhiteBox
      className="mx-0"
      innerClassName="px-6 py-5"
      isCollapsible="true"
      headerChildren={(expanded) => (
        <div className="flex gap-x-4 items-center flex-wrap font-bold text-lg min-h-[32px]">
          {fuelType === 'elettrico' ? 'Batteria' : 'Carburante'}
          {!expanded && <FuelLevel level={selected} bgColor={fuelTypeInfos.color} />}
        </div>
      )}
      {...props}
    >
      <div className="transition-all duration-1000">
        <div className="flex space-x-5">
          <div className="flex flex-col">
            <div className="font-semibold text-sm">Tipo Alimentazione</div>
            <p className="text-left font-semibold text-gray-600">{fuelTypeInfos?.label}</p>
          </div>
          <div className="flex flex-col">
            <div className="font-semibold text-sm">Capacità (lt/kw)</div>
            <p className="text-left font-semibold text-gray-600">
              {fuelCapacity ? fuelCapacity : 'Valore mancante. Default 50.'}
            </p>
          </div>
        </div>
        <div className="mt-5 flex space-x-5">
          <div className="flex flex-col">
            <div className="font-semibold text-sm">Livello Carburante</div>
            <FuelLevel
              level={selected}
              className="gap-x-3 mt-2"
              elemsClassName="px-8 py-2"
              bgColor={fuelTypeInfos?.color || 'bg-slate-300'}
              onSelect={viewMode ? null : (lvl) => updateFuel(lvl)}
            />
          </div>
        </div>
        {phase !== 'pickUp' ? (
          <>
            <div className="mt-5 flex space-x-5">
              <div className="flex flex-col">
                <div className="font-semibold text-sm">Livello Iniziale</div>
                <p className="text-left font-semibold text-gray-600">
                  {rent?.pickUpState.fuelLevel}/8
                </p>
              </div>
              <div className="flex flex-col">
                <div className="font-semibold text-sm">Livello Attuale</div>
                <p className="text-left font-semibold text-gray-600">{selected}/8</p>
              </div>
              <div className="flex flex-col">
                <div className="font-semibold text-sm">Consumo (lt/kw)</div>
                <p className="text-left font-semibold text-gray-600">{calculateConsumption()}</p>
              </div>
              <div className="flex flex-col">
                <div className="font-semibold text-sm">Costo unitario</div>
                <p className="text-left font-semibold text-gray-600">{convertPrice(fuelPrice)}</p>
              </div>
              <div className="flex flex-col">
                <div className="font-semibold text-sm">Stima costo extra</div>
                <p className="text-left font-semibold text-gray-600">
                  {convertPrice(calculatedFuelCost)}
                </p>
              </div>
              <div className="flex flex-col">
                <div className="font-semibold text-sm">Costo extra addebitato</div>
                <p className="text-left font-semibold text-gray-600">
                  {convertPrice(finalFuelCost)}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </WhiteBox>
  );
};

export default Fuel;
