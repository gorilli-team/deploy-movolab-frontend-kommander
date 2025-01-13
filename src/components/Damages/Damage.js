import React, { useState } from 'react';
import ElementLabel from '../UI/ElementLabel';
import DamageModal from './DamageModal';
import { FaPen } from 'react-icons/fa';

export const mapDamageVehiclePart = (vehiclePart) => {
  if (vehiclePart === 'body') {
    return 'Carrozzeria';
  }
  if (vehiclePart === 'wheel') {
    return 'Ruota';
  }
  if (vehiclePart === 'windshield') {
    return 'Parabrezza';
  }
  if (vehiclePart === 'rear windowshield') {
    return 'Lunotto posteriore';
  }
  if (vehiclePart === 'glass') {
    return 'Vetro';
  }
  if (vehiclePart === 'mirror') {
    return 'Specchietto';
  }
  if (vehiclePart === 'light') {
    return 'Fanale';
  }
  if (vehiclePart === 'seat') {
    return 'Sedile';
  }
  if (vehiclePart === 'dashboard') {
    return 'Cruscotto';
  }
  if (vehiclePart === 'panel') {
    return 'Plancia';
  }
  if (vehiclePart === 'steering wheel') {
    return 'Volante';
  }
  if (vehiclePart === 'ceiling') {
    return 'Cielo interno';
  }
  if (vehiclePart === 'other') {
    return 'Altro';
  }
};

export const mapDamageStatusLabel = (status) => {
  if (status === 'open') {
    return 'Aperto';
  }
  if (status === 'closed') {
    return 'Chiuso';
  }
};

export const mapDamageLevel = (level) => {
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

export const mapDamageStatusColor = (status) => {
  if (status === 'open') {
    return 'bg-yellow-600';
  }
  if (status === 'closed') {
    return 'bg-green-600';
  }
};

export const mapDamageLevelColor = (lvl) =>
  lvl === 'low' ? 'bg-green-700' : lvl === 'medium' ? 'bg-yellow-700' : 'bg-red-700';

const Damage = ({ rentId, vehicleId, groupId, damage, phase, closeModal }) => {
  const [showDamageModal, setShowDamageModal] = useState(false);

  const closeDamageModal = () => {
    setShowDamageModal(false);
    closeModal();
  };

  return (
    <div key={damage._id} className="bg-gray-100 rounded-lg mt-3 p-3">
      <div className="flex content-end gap-4">
        {damage.imageUrl ? (
          <div
            className="bg-cover bg-center bg-no-repeat h-32 w-52 my-[-0.25em] ml-[-0.25em] rounded-l"
            style={{ backgroundImage: `url(${damage.imageUrl})` }}
          />
        ) : (
          ''
        )}

        <div className="flex-1">
          <div className="text-md font-semibold py-1">
            Danno su {mapDamageVehiclePart(damage.vehiclePart ?? 'other')}
            <FaPen
              className="inline ml-2 mb-1 cursor-pointer hover:opacity-70"
              onClick={() => setShowDamageModal(true)}
              title="Modifica"
            />
            {damage.damageLevel !== undefined && (
              <span className="ml-2">
                <ElementLabel className="ml-3" bgColor={mapDamageLevelColor(damage.damageLevel)}>
                  {mapDamageLevel(damage.damageLevel)}
                </ElementLabel>
              </span>
            )}
          </div>
          <div className="text-sm mt-1 break-all">{damage.description}</div>
          <h6 className="text-sm mt-2 text-gray-600">
            Inserito il: {new Date(damage.date).toLocaleDateString()}
          </h6>
        </div>
        <div>
          <div className="float-right space-x-2">
            <div className="md:flex">
              <div className=" mb-3 float-right md:float-none md:mr-2 md:mt-1">
                {damage?.status !== undefined ? (
                  <ElementLabel bgColor={mapDamageStatusColor(damage?.status)}>
                    {mapDamageStatusLabel(damage?.status)}
                  </ElementLabel>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showDamageModal ? (
        <DamageModal
          vehicleId={vehicleId}
          damage={damage}
          groupId={damage.groupId}
          phase={phase}
          closeModal={closeDamageModal}
        />
      ) : null}
    </div>
  );
};

export default Damage;
