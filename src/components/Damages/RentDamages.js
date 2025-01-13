import React from 'react';
import DamageCostElement from './DamageCostElement';
import { convertPrice } from '../../utils/Prices';

const RentDamages = ({ rentDamages, rentId, vehicleId, groupId, updateDamages, updatePrice }) => {
  return (
    <div>
      {rentDamages.length === 0 ? null : (
        <div className="mt-2">
          <div className="font-semibold">
            Lista Danni ({rentDamages.length}{' '}
            {rentDamages.length === 1 ? 'danno segnalato' : 'danni segnalati'})
          </div>
          {rentDamages?.length === 0 ? (
            <div>
              <div className="p-3">Nessun danno segnalato</div>
            </div>
          ) : (
            <div>
              {rentDamages.map((damage) => {
                return (
                  <DamageCostElement
                    key={damage._id}
                    damage={damage}
                    rentId={rentId}
                    vehicleId={vehicleId}
                    groupId={groupId}
                    returnDamage={updateDamages}
                    updatePrice={updatePrice}
                  />
                );
              })}
            </div>
          )}
          <div className="flex mt-3">
            <div className="grow"></div>
            <div className="flex space-x-2">
              <div>Totale addebito danni: </div>
              <div className="font-semibold">
                {convertPrice(rentDamages.reduce((acc, curr) => acc + curr.damageCost, 0))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentDamages;
