import React, { useEffect, useState } from 'react';
import { http } from '../../utils/Utils';
import Damage from './Damage';
import DamageModal from './DamageModal';
import DamagesImage from './DamagesImage';
import RentDamages from './RentDamages';
import WhiteBox from '../../components/UI/WhiteBox';
import Button from '../UI/buttons/Button';
import PlusOutlineCircle from '../../assets/icons/PlusOutlineCircle';
import ToggleSwitch from '../UI/ToggleSwitch';
import ElementLabel from '../UI/ElementLabel';
import { mapDamageVehiclePart, mapDamageLevel, mapDamageLevelColor } from './Damage';

const Damages = ({
  rent,
  vehicle,
  expanded,
  phase,
  doNotShrink,
  noCollapsible,
  viewMode,
  updatePrice,
  ...props
}) => {
  const [vehicleDamages, setVehicleDamages] = useState([]); //eslint-disable-line
  const [openModal, setOpenModal] = useState(false);
  const [damagesType, setDamagesType] = useState('all'); //eslint-disable-line
  const [showDamageImage, setShowDamageImage] = useState(true);
  const [countOpenDamages, setCountOpenDamages] = useState(0);
  const [rentDamages, setRentDamages] = useState([]);
  const [insertMode, setInsertMode] = useState(false);

  const vehicleId = vehicle?._id || rent?.vehicle?._id;
  const rentId = rent?._id;
  const groupId = rent?.group?._id;

  useEffect(() => {
    fetchVehicleDamages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVehicleDamages = async () => {
    const response = await http({ url: `/vehicles/vehicle/damages/${vehicleId}` });
    setVehicleDamages(response);
    setCountOpenDamages(response.filter((damage) => damage.status === 'open').length);

    if (rentId) {
      const damagesRent = response.filter((damage) => damage.rentId === rentId);
      setRentDamages(damagesRent);
    }
  };

  const filterDamages = (damages, status) =>
    status === 'all' ? damages : damages.filter((damage) => damage.status === status);

  const filteredDamages = filterDamages(vehicleDamages, damagesType);

  const updateDamages = () => {
    fetchVehicleDamages();
  };

  const closeModal = () => {
    setOpenModal(false);
    setInsertMode(false);
    fetchVehicleDamages();
  };

  const canAddDamage = ![
    'chiuso',
    'fatturato',
    'annullato',
    'incassato',
    'parz fatturato',
    'parz incassato',
    'stornato',
  ].includes(rent?.state);

  const damagesTitle = rentDamages.map((damage) => (
    <ElementLabel
      key={damage._id} // Add the key prop here
      className="ml-2"
      bgColor={mapDamageLevelColor(damage.damageLevel)}
    >
      {mapDamageVehiclePart(damage.vehiclePart)}, {mapDamageLevel(damage.damageLevel)}
    </ElementLabel>
  ));

  return (
    <WhiteBox
      className={noCollapsible ? 'mx-0 my-0 px-6 py-5' : 'mx-0'}
      innerClassName="px-6 py-5"
      isCollapsible={!(noCollapsible || false)}
      isExpanded={expanded || props.isExpanded}
      headerChildren={
        <div className="flex items-center">
          <div className="font-bold text-lg">
            {rentId
              ? `Danni noleggio (${rentDamages.length})`
              : `Danni (${countOpenDamages} 
              ${countOpenDamages === 1 ? 'danno aperto' : 'danni aperti'})`}
          </div>
          {damagesTitle}
        </div>
      }
      {...props}
    >
      {viewMode === true ? (
        <DamagesImage
          vehicleId={vehicleId}
          closeModal={closeModal}
          phase={phase}
          groupId={groupId}
          rentId={rentId}
          updateDamages={updateDamages}
          updatePrice={updatePrice}
          viewMode={viewMode}
        />
      ) : (
        <>
          <div className="flex justify-between">
            <div>
              {noCollapsible === true ? (
                <span className="font-bold text-lg mr-3">
                  {rentId
                    ? `${rentDamages.length} danni inseriti`
                    : `${countOpenDamages} ${
                        countOpenDamages === 1 ? 'danno aperto' : 'danni aperti'
                      }`}
                </span>
              ) : (
                ''
              )}

              {canAddDamage ? (
                <Button
                  btnStyle="whiteLightButton"
                  onClick={(e) => {
                    e.preventDefault();
                    setInsertMode(true);
                    setShowDamageImage(true);
                  }}
                >
                  <PlusOutlineCircle /> Inserisci danno
                </Button>
              ) : null}
            </div>

            <ToggleSwitch
              switches={[
                {
                  label: 'Mappa danni',
                  selected: showDamageImage,
                  onClick: () => {
                    setShowDamageImage(true);
                  },
                },
                {
                  label: 'Elenco danni',
                  selected: !showDamageImage && damagesType !== 'closed',
                  onClick: () => {
                    setShowDamageImage(false);
                    setDamagesType('open');
                  },
                },
                {
                  label: 'Danni chiusi',
                  selected: !showDamageImage && damagesType === 'closed',
                  onClick: () => {
                    setShowDamageImage(false);
                    setDamagesType('closed');
                  },
                },
              ]}
            />
          </div>

          <div className="transition-all duration-1000">
            {showDamageImage ? (
              <>
                <DamagesImage
                  vehicleId={vehicleId}
                  closeModal={closeModal}
                  phase={phase}
                  groupId={groupId}
                  rentId={rentId}
                  updateDamages={updateDamages}
                  updatePrice={updatePrice}
                  onModalClose={closeModal}
                  insertMode={insertMode}
                  editable
                />
                {rentId ? (
                  <RentDamages
                    rentDamages={rentDamages}
                    vehicleId={vehicleId}
                    rentId={rentId}
                    groupId={groupId}
                    phase={phase}
                    updateDamages={updateDamages}
                    updatePrice={updatePrice}
                  />
                ) : null}
              </>
            ) : (
              <div className="mt-2">
                {/*<div className="flex">
                      <div>{mapType(damagesType)}</div>
                    </div>*/}
                {filteredDamages.length === 0 ? (
                  <h3 className="pt-3 italic text-center text-gray-500">Nessun danno inserito</h3>
                ) : null}
                {filteredDamages.map((damage) => (
                  <Damage
                    key={damage._id}
                    rentId={rentId}
                    vehicleId={vehicleId}
                    groupId={groupId}
                    damage={damage}
                    phase={phase}
                    closeModal={closeModal}
                  />
                ))}
              </div>
            )}
          </div>
          {openModal ? (
            <DamageModal
              vehicleId={vehicleId}
              closeModal={closeModal}
              phase={phase}
              groupId={groupId}
              rentId={rentId}
              updateDamages={updateDamages}
              updatePrice={updatePrice}
            />
          ) : null}
        </>
      )}
    </WhiteBox>
  );
};

export default Damages;
