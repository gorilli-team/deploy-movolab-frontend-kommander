import React, { useState } from 'react';
import RentRecap from './RentRecap';
import PickupDropoffInfo from './rentElements/PickupDropoffInfo';
import Fuel from './rentElements/Fuel';
import Damages from '../Damages/Damages';
import Franchises from './rentElements/Franchises';
import ExtraServices from './rentElements/ExtraServices';
import ExtraCosts from './rentElements/ExtraCosts';
import Notes from '../Notes/Notes';
import Documents from '../Documents/Documents';
import PriceCalculation from './rentElements/PriceCalculation';
import RentExtraFields from '../ExtraFields/RentExtraFields';
import Payments from '../Payments/Payments';
import Invoices from '../Invoices/Invoices';
import Deposit from './rentElements/Deposit';

const RentDetails = ({ rent, phase, updateRent, fromCorporate = false, type = 'client' }) => {
  const [expandAll, setExpandAll] = useState(false);

  if (!rent._id) return null;

  return (
    <>
      <RentRecap
        rent={rent}
        phase={phase}
        expandFn={() => {
          setExpandAll(!expandAll);
        }}
        isExpanded={expandAll}
        type={type}
      />
      <PickupDropoffInfo
        rent={rent}
        phase={phase}
        expanded={true}
        viewMode={true}
        fromCorporate={fromCorporate}
        isExpanded={expandAll}
        updatePrice={() => {
          updateRent();
        }}
      />
      <RentExtraFields rent={rent} isExpanded={expandAll} />
      <Fuel
        rent={rent}
        vehicle={rent.vehicle?._id}
        phase={phase}
        viewMode={true}
        isExpanded={expandAll}
      />
      <Damages
        rent={rent}
        vehicle={rent.vehicle?._id}
        phase={phase}
        viewMode={true}
        isExpanded={expandAll}
      />
      <ExtraServices rentData={rent} phase={phase} isExpanded={expandAll} />
      <ExtraCosts rentData={rent} phase={phase} isExpanded={expandAll} />
      <Franchises rentData={rent} phase={phase} isExpanded={expandAll} />
      <Notes rent={rent} isExpanded={expandAll} />
      <Documents rent={rent} phase={phase} isExpanded={expandAll} onUpdate={updateRent} />
      <PriceCalculation rent={rent} phase={phase} isExpanded={expandAll} />
      <Payments elem={rent} isExpanded={expandAll} />
      <Invoices invoices={rent?.invoices} isExpanded={expandAll} />
      {rent?.paidDeposit?.amount > 0 && (
        <Deposit
          rent={rent}
          deposit={rent?.workflow?.administration?.deposit}
          invoicingType={rent?.priceList?.configuration?.deposits?.invoicingType || 'customer'}
          updatePayments={updateRent}
          fromCorporate={fromCorporate}
          className="mt-0"
          mode={'small'}
          modality={'returnDeposit'}
          isExpanded={expandAll}
        />
      )}
    </>
  );
};

export default RentDetails;
