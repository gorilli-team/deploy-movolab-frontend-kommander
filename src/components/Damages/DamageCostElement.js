import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { http } from '../../utils/Utils';
import DamageModal from './DamageModal';
import { TextField } from '../Form/TextField';
import { FaExpand } from 'react-icons/fa';
import { FaPencilAlt } from 'react-icons/fa';
import { convertPrice } from '../../utils/Prices';
import ElementLabel from '../UI/ElementLabel';
import Button from '../UI/buttons/Button';
import { mapDamageVehiclePart } from './Damage';

const mapDamageLevel = (level) => {
  if (level === 'low') {
    return 'Lieve';
  }
  if (level === 'medium') {
    return 'Medio';
  }
  if (level === 'high') {
    return 'Grave';
  }
};

const DamageCostElement = ({
  vehicleId,
  groupId,
  rentId,
  damage,
  returnDamage = () => {},
  updatePrice = () => {},
}) => {
  const form = useForm();
  const [damageElement, setDamageElement] = useState(damage);

  const [openModal, setOpenModal] = useState(false);
  const [showPrice, setShowPrice] = useState(true);

  form.setValue('cost', damageElement.damageCost);

  const closeModal = () => {
    setOpenModal(false);
  };

  const modifyPrice = () => {
    setShowPrice(!showPrice);
  };

  const onSubmit = async (data) => {
    const update = {
      ...damageElement,
      damageCost: data.cost,
    };

    const response = await http({
      url: `/vehicles/vehicle/damages/update/${vehicleId}/${damageElement._id}`,
      method: 'POST',
      form: update,
    });
    if (response) {
      setShowPrice(true);
      setDamageElement({
        ...damageElement,
        damageCost: data.cost,
      });
      returnDamage();

      const rent = await http({
        url: `/rents/${rentId}`,
        method: 'GET',
      });

      updatePrice(rent);
    }
  };

  const mapDamageType = (damageType) => {
    if (damageType === 'scratch') {
      return 'Graffio';
    }
    if (damageType === 'dent') {
      return 'Ammaccatura';
    }
    if (damageType === 'crack') {
      return 'Crepa';
    }
    if (damageType === 'break') {
      return 'Rottura';
    }
    if (damageType === 'hole') {
      return 'Foro';
    }
    if (damageType === 'tear') {
      return 'Lacerazione';
    }
    if (damageType === 'other') {
      return 'Altro';
    }
  };

  return (
    <div key={damageElement._id} className="bg-gray-100 rounded-lg mt-3 py-3 px-4">
      <div className="flex space-x-3">
        <div>
          <div className="flex gap-x-3 font-semibold">
            <div>
              Danno su {mapDamageVehiclePart(damageElement.vehiclePart)} (
              {mapDamageType(damageElement.damageType)})
            </div>

            <ElementLabel
              className="mr-2"
              bgColor={
                damage.damageLevel === 'low'
                  ? 'bg-green-700'
                  : damage.damageLevel === 'medium'
                  ? 'bg-yellow-700'
                  : 'bg-red-700'
              }
            >
              {mapDamageLevel(damage.damageLevel)}
            </ElementLabel>
          </div>
          <div className="text-sm">{damageElement.description}</div>
        </div>
        <div className="flex-grow"></div>
        {showPrice ? (
          <div className="text-left font-semibold text-gray-600 mt-1">
            {convertPrice(damageElement.damageCost)}
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex space-x-2">
              <TextField
                form={form}
                name="cost"
                placeholder="Costo"
                className="w-24"
                defaultValue={damageElement.damageCost}
              />
              <Button btnStyle="inFormStyle" type="submit">
                Salva
              </Button>
            </div>
          </form>
        )}

        <div className="flex space-x-1">
          <span
            className="text-sm mt-2 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              modifyPrice();
            }}
          >
            <FaPencilAlt />
          </span>
          <span
            className="text-sm mt-2 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setOpenModal(true);
            }}
          >
            <FaExpand />
          </span>
        </div>
      </div>
      {openModal ? (
        <DamageModal
          vehicleId={vehicleId}
          closeModal={closeModal}
          damage={damageElement}
          phase={'dropOff'}
          groupId={groupId}
          rentId={rentId}
        />
      ) : null}
    </div>
  );
};

export default DamageCostElement;
