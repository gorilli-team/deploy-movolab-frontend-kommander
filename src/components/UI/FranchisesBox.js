import React, { useEffect, useState } from 'react';
import ElementLabel from './ElementLabel';
import { fetchFranchises } from '../Rents/rentElements/Franchises';

const FranchisesBox = ({ rentResevation, phase, className = '', children = null, ...props }) => {
  const [frachisesLabels, setFranchiseLabels] = useState([]);

  const extras = rentResevation?.pickUpExtraServices;

  const franchisesExtras = {
    kasko: extras?.find((extra) => extra?.manualRule?.parameter === 'kasko'),
    if: extras?.find((extra) => extra?.manualRule?.parameter === 'furto'),
    rca: extras?.find((extra) => extra?.manualRule?.parameter === 'rca'),
  };

  const fetchFranchiseLabels = async () => {
    setFranchiseLabels(await fetchFranchises(rentResevation, phase));
  };

  useEffect(() => {
    fetchFranchiseLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`flex gap-2 ${className}`} {...props}>
      {children}

      {frachisesLabels?.kasko ? (
        <div>
          <ElementLabel bgColor={franchisesExtras?.kasko ? 'bg-gray-400' : 'bg-gray-600'}>
            Kasko <strong className="font-bold">{frachisesLabels.kasko.type}</strong>
          </ElementLabel>

          {franchisesExtras?.kasko ? (
            <ElementLabel bgColor="bg-gray-600" className="block mt-1">
              <strong className="font-bold">{franchisesExtras?.kasko.name}</strong>
              <br />
              {franchisesExtras?.kasko.description}
            </ElementLabel>
          ) : null}
        </div>
      ) : null}

      {frachisesLabels?.rca ? (
        <div>
          <ElementLabel bgColor={franchisesExtras?.rca ? 'bg-orange-400' : 'bg-orange-600'}>
            Franchigia RCA <strong className="font-bold">{frachisesLabels.rca.type}</strong>
          </ElementLabel>

          {franchisesExtras?.rca ? (
            <ElementLabel bgColor="bg-orange-600" className="block mt-1">
              <strong className="font-bold">{franchisesExtras?.rca.name}</strong>
              <br />
              {franchisesExtras?.rca.description}
            </ElementLabel>
          ) : null}
        </div>
      ) : null}

      {frachisesLabels?.if ? (
        <div>
          <ElementLabel bgColor={franchisesExtras?.if ? 'bg-yellow-500' : 'bg-yellow-600'}>
            Franchigia I/F <strong className="font-bold">{frachisesLabels.if.type}</strong>
          </ElementLabel>

          {franchisesExtras?.if ? (
            <ElementLabel bgColor="bg-yellow-600" className="block mt-1">
              <strong className="font-bold">{franchisesExtras?.if.name}</strong>
              <br />
              {franchisesExtras?.if.description}
            </ElementLabel>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default FranchisesBox;
