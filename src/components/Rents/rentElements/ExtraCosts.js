import React from 'react';
import { mapCostCalculation } from '../../../utils/Extras';
import WhiteBox from '../../../components/UI/WhiteBox';
import ElementLabel from '../../UI/ElementLabel';

const ExtraCosts = ({ rentData, ...props }) => {
  const boxLabels = rentData.extraCosts.map((extra) => (
    <ElementLabel className="ml-2" bgColor="bg-red-200 !text-black" key={extra._id}>
      {extra.name}
    </ElementLabel>
  ));

  return (
    <>
      {rentData && rentData.extraCosts?.length > 0 ? (
        <WhiteBox
          className="mx-0"
          innerClassName="px-6 py-5 bg-red-100 hover:bg-red-50 rounded-b"
          collapsibleClassName="px-6 py-5"
          isCollapsible="true"
          headerChildren={
            <div className="font-bold text-lg">
              Extra Automatici ({rentData?.extraCosts?.length}) {boxLabels}
            </div>
          }
          {...props}
        >
          <div className="flex flex-col gap-2">
            {rentData.extraCosts?.map((extraCost) => (
              <div
                className="flex border border-gray-100 rounded-lg py-3 px-4 bg-gray-100"
                key={extraCost._id}
              >
                <div className="grow">
                  <div className="font-bold">{extraCost.name}</div>
                  <div className="text-xs">{extraCost.description}</div>
                </div>
                <div className="m-auto">
                  {extraCost?.cost?.amount} € ({mapCostCalculation(extraCost?.cost?.calculation)})
                </div>
              </div>
            ))}
          </div>
        </WhiteBox>
      ) : null}
    </>
  );
};

export default ExtraCosts;
