import React, { useEffect, useRef, useState } from 'react';
import useMouse from '@react-hook/mouse-position';
import { http } from '../../utils/Utils';
import DamageModal from './DamageModal';

const DAMAGE_PLACEHOLDER_SIZE = 12;

const DamagesImage = ({
  vehicleId,
  phase,
  rentId,
  groupId,
  updateDamages,
  updatePrice,
  className,
  imgClassName,
  onModalClose = () => {},
  insertMode,
  editable = false
}) => {
  const target = useRef(null);
  const [openModal, setOpenModal] = useState(false);
  const [vehiclePart, setVehiclePart] = useState('');
  const [vehicleOpenDamages, setVehicleOpenDamages] = useState([]);
  const [damagesType, setDamagesType] = useState('all'); //eslint-disable-line
  const [filteredDamages, setFilteredDamages] = useState([]); //eslint-disable-line
  const [damageModalData, setDamageModalData] = useState({});
  const [countOpenDamages, setCountOpenDamages] = useState(0); //eslint-disable-line
  // const [insertMode, setInsertMode] = useState(false);
  const [imageWidth, setImageWidth] = useState(0);
  const [mode, setMode] = useState('new');

  useEffect(() => {
    fetchVehicleOpenDamages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVehicleOpenDamages = async () => {
    const response = await http({ url: `/vehicles/vehicle/damages/${vehicleId}` });
    setVehicleOpenDamages(response);
    filterDamages(response, 'open');
    setCountOpenDamages(response.filter((damage) => damage.status === 'open').length);
  };

  const filterDamages = (damages, status) => {
    setDamagesType(status);
    if (status === 'all') {
      setFilteredDamages(damages);
      return;
    }
    setFilteredDamages(damages.filter((damage) => damage.status === status));
  };

  let drawPts = useRef([]);
  const mouse = useMouse(target, {
    fps: Infinity,
    enterDelay: 100,
    leaveDelay: 100,
  });

  useEffect(() => {
    setImageWidth(target.current?.offsetWidth);
  }, [target]);

  const calculateRelativePosition = (x, y) => {
    const elementWidth = mouse.elementWidth;
    const elementHeight = mouse.elementHeight;
    const relativeX = x / elementWidth;
    const relativeY = y / elementHeight;
    return { relativeX, relativeY, elementWidth, elementHeight };
  };

  const identifyImageRegion = (x, y) => {
    const { relativeX, relativeY } = calculateRelativePosition(x, y);

    if (relativeX < 0.25 && relativeY < 0.34) return;
    if (relativeX < 0.25 && relativeY > 0.66) return;
    if (relativeX > 0.75 && relativeY < 0.34) return;
    if (relativeX > 0.75 && relativeY > 0.66) return;

    if (relativeX > 0.046 && relativeX < 0.194 && relativeY > 0.377 && relativeY < 0.442) {
      setVehiclePart('windshield');
    } else if (relativeX > 0.616 && relativeX < 0.699 && relativeY > 0.39 && relativeY < 0.59) {
      setVehiclePart('rear windowshield');
    } else {
      setVehiclePart('body');
    }

    if (insertMode) {
      setMode('new');
      setOpenModal(true);
    }
  };

  useEffect(() => {
    if (mouse.isDown) {
      identifyImageRegion(mouse.x, mouse.y);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mouse.isDown]);

  const closeModal = () => {
    setOpenModal(false);
    onModalClose();
    fetchVehicleOpenDamages();
  };

  const drawing = [];

  for (let i = 0; i < drawPts.current.length; i++) {
    const { x, y, elementWidth, elementHeight } = drawPts.current[i];

    drawing.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          left: Math.min(x, elementWidth - DAMAGE_PLACEHOLDER_SIZE / 2),
          top: Math.min(y, elementHeight - DAMAGE_PLACEHOLDER_SIZE / 2),
          width: DAMAGE_PLACEHOLDER_SIZE,
          height: DAMAGE_PLACEHOLDER_SIZE,
          backgroundColor: '#ff0000',
          borderRadius: 1000,
        }}
      />,
    );
  }

  return (
    <div>
      <div className="flex flex-wrap">
        <div
          className={`mt-4 relative p-2 ${
            insertMode ? 'bg-slate-100 rounded-lg cursor-pointer' : ''
          } ${className || ''}`}
        >
          {insertMode ? (
            <h4 className="text-sm mx-2 mb-4 mt-1 italic text-center">
              Cliccare sull'immagine per inserire un danno nella posizione indicata
            </h4>
          ) : (
            ''
          )}
          <div className={`w-[500px] max-w-[500px] relative ${imgClassName || ''}`} ref={target}>
            <img src="/car_blueprint_outside.png" alt="Vehicle" className="mt-0" />
            {drawing}
            {vehicleOpenDamages.map((damage, index) => {
              if (!damage.xPosition || !damage.yPosition) return null;
              if (damage.status === 'closed') return null;

              let backgr = '#1a1a1a';
              if (damage?.rentId !== undefined && damage?.rentId === rentId) {
                backgr = '#ff0000';
              }

              return (
                <div
                  key={index}
                  className="absolute hover:opacity-70 cursor-pointer"
                  style={{
                    left: damage.xPosition * imageWidth - DAMAGE_PLACEHOLDER_SIZE / 2,
                    top: damage.yPosition * imageWidth * 0.576 - DAMAGE_PLACEHOLDER_SIZE / 2,
                    width: DAMAGE_PLACEHOLDER_SIZE,
                    height: DAMAGE_PLACEHOLDER_SIZE,
                    backgroundColor: backgr,
                    borderRadius: 1000,
                  }}
                  onClick={() => {
                    setMode('existing');
                    setDamageModalData(damage);
                    setOpenModal(true);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
      {/* <div>{JSON.stringify(mouse, null, 2)}</div> */}
      {openModal ? (
        <DamageModal
          vehicleId={vehicleId}
          vehiclePart={vehiclePart}
          damage={mode === 'existing' ? damageModalData : undefined}
          groupId={groupId}
          isViewMode={!editable && mode === 'existing'}
          phase={phase}
          rentId={rentId}
          relativeX={mouse.x / mouse.elementWidth}
          relativeY={mouse.y / mouse.elementHeight}
          closeModal={closeModal}
          returnDamage={updateDamages}
          updatePrice={updatePrice}
        />
      ) : null}
    </div>
  );
};

export default DamagesImage;
