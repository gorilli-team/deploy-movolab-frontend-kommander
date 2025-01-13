import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import CloseInvoicing from './rentElements/CloseInvoicing';
import Deposit from './rentElements/Deposit';
import PriceCalculation from './rentElements/PriceCalculation';
import moment from 'moment';
import { http } from '../../utils/Utils';
import toast from 'react-hot-toast';

import RentRecap from '../Rents/RentRecap';
import Fuel from '../Rents/rentElements/Fuel';
import Damages from '../Damages/Damages';
import Notes from '../Notes/Notes';
import Documents from '../Documents/Documents';
import RentExtraFields from '../ExtraFields/RentExtraFields';
import Payments from '../Payments/Payments';

import ExtraServices from './rentElements/ExtraServices';
import ExtraCosts from './rentElements/ExtraCosts';
import Franchises from './rentElements/Franchises';
import PickupDropoffInfo from './rentElements/PickupDropoffInfo';
import CardsHeader from '../UI/CardsHeader';
import { RouterPrompt } from '../UI/RouterPrompt';
import Invoices from '../Invoices/Invoices';
import { calculateRentClosingTotals } from '../../utils/Rent';
import { convertPrice } from '../../utils/Prices';

const PayRentDetails = ({ rent, closeRent, updateRent, fetchRent, isCheckoutPage = false }) => {
  const phase = 'dropOff';
  const history = useHistory();
  const [closeRentInfo, setCloseRentInfo] = useState({}); // eslint-disable-line
  const [promptDescription, setPromptDescription] = useState(''); // eslint-disable-line
  const [isBlocking, setIsBlocking] = useState(false); //eslint-disable-line
  const [updatedRent, setUpdatedRent] = useState(null); // eslint-disable-line
  const [outstandingPayments, setOutstandingPayments] = useState(0); // eslint-disable-line
  const [expandAll, setExpandAll] = useState(false);
  const [isReopeningRent, setIsReopeningRent] = useState(false);

  const isViewMode =
    rent?.state === 'fatturato' ||
    rent?.state === 'chiuso' ||
    rent?.state === 'incassato' ||
    rent?.state === 'parz incassato' ||
    rent?.state === 'parz fatturato' ||
    rent?.state === 'annullato' ||
    rent?.state === 'stornato';

  const isDropOff =
    rent?.state === 'chiuso' ||
    rent?.state === 'fatturato' ||
    rent?.state === 'incassato' ||
    rent?.state === 'parz incassato' ||
    rent?.state === 'parz fatturato' ||
    rent?.state === 'stornato';

  useEffect(() => {
    setUpdatedRent(updateRent());
  }, []);

  useEffect(() => {
    if (rent) {
      setUpdatedRent(rent);
      const data = {
        km: {
          pickUp: rent?.km?.pickUp || '0',
          dropOff: rent?.km?.dropOff || rent?.km?.pickUp || '0',
        },
        startTime: moment(rent.pickUpDate).format().slice(0, 16),
        closeTime: moment(rent.dropOffDate).format().slice(0, 16),
      };
      setCloseRentInfo(data);
    }
  }, [rent]);

  const reopenRent = async () => {
    try {
      await http({
        url: `/rents/${rent._id}`,
        method: 'PUT',
        form: { state: 'aperto' },
      });
      toast.success('Movo riaperto con successo');
      setIsReopeningRent(true);
      history.push(`/dashboard/movimenti/${rent._id}/riepilogo`);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const getMovoOutstandingPayments = (rentData) => {
      const rentClosingTotals = calculateRentClosingTotals(rentData);

      const missingPayments =
        rentClosingTotals?.missingMovolab + rentClosingTotals?.missingCustomer;

      if (missingPayments > 0) {
        setIsBlocking(true);
        setPromptDescription(
          `Ci sono ancora pagamenti da effettuare per un totale di ${convertPrice(
            missingPayments,
          )}`,
        );
      } else {
        setIsBlocking(false);
      }
    };

    getMovoOutstandingPayments(rent);
  }, [rent]);

  useEffect(() => {
    const retrievedDepositPayments = rent?.payments?.filter((item) => {
      return item?.paymentMoment === 'deposit';
    });

    const retrievedReturnDepositPayments = rent?.payments?.filter((item) => {
      return item?.paymentMoment === 'returnDeposit';
    });

    if (retrievedDepositPayments?.length > 0 && retrievedReturnDepositPayments?.length === 0) {
      setIsBlocking(true);
      setPromptDescription('Manca il rimborso del deposito');
    }
  }, [rent]);

  const getCloseRentInfo = (info) => {
    setCloseRentInfo(info);
  };

  const updatePayments = () => {
    fetchRent();
  };

  const returnOutstandingPayments = (length) => {
    setOutstandingPayments(length);
  };

  const updatePrice = (rent) => {
    setUpdatedRent(rent);
  };

  var docsBlocking = false;

  if (
    phase === 'dropOff' &&
    rent?.dropOffState &&
    rent?.signature?.dropOff?.otp &&
    rent.signature.dropOff.otp.verified !== true
  ) {
    const docFound = rent.dropOffState.documents.find((doc) => doc.label === 'dropoffcontract');

    if (!docFound?.fileUrl) {
      docsBlocking = true;
    }
  }

  const movoPrintLink = isDropOff
    ? `/dashboard/movimenti/${rent?._id}/stampa/dropOff`
    : `/dashboard/movimenti/${rent?._id}/stampa/pickUp`;

  return (
    <>
      <CardsHeader
        title="Fatturazione movo"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Firma',
            to: movoPrintLink,
          },
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Modifica Movo',
            onClick: reopenRent,
            hiddenIf: rent?.state !== 'chiuso',
          },
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Torna alla lista',
            onClick: () => history.push('/dashboard/movimenti'),
          },
        ]}
      />
      {rent && rent._id && (
        <div className="flex space-x-4 px-6">
          <div className="w-3/4">
            <RentRecap
              rent={rent}
              phase={phase}
              expandFn={() => {
                setExpandAll(!expandAll);
              }}
              isExpanded={expandAll}
            />
            <PickupDropoffInfo
              rent={rent}
              getCloseRentInfo={getCloseRentInfo}
              phase={phase}
              updatePrice={updatePrice}
              viewMode={isViewMode}
            />
            <RentExtraFields rent={rent} isExpanded={expandAll} />
            <Fuel
              rent={rent}
              vehicle={rent.vehicle?._id}
              phase={phase}
              updatePrice={updatePrice}
              viewMode={isViewMode}
              isExpanded={expandAll}
            />
            <Damages
              rent={rent}
              vehicle={rent.vehicle?._id}
              phase={phase}
              updatePrice={updatePrice}
              isExpanded={expandAll}
            />
            <ExtraServices
              rentData={rent}
              phase={phase}
              isViewMode={isViewMode}
              updatePrice={updatePrice}
              isExpanded={expandAll}
            />
            <ExtraCosts rentData={rent} phase={phase} isExpanded={expandAll} />
            <Franchises
              rentData={rent}
              phase={phase}
              updatePrice={updatePrice}
              isExpanded={expandAll}
            />
            <Notes rent={rent} isExpanded={expandAll} />
            <Documents rent={rent} phase={phase} isExpanded={expandAll} onUpdate={fetchRent} />
            <Payments elem={rent} isExpanded={expandAll} />
            <Invoices invoices={rent?.invoices} isExpanded={expandAll} />
          </div>
          <div className="w-1/4">
            <div className="sticky top-[77px]">
              <PriceCalculation
                rent={updatedRent}
                phase={phase}
                mode={'small'}
                className="mt-0"
                startExpanded={!isCheckoutPage}
              />
              <Deposit
                rent={rent}
                deposit={rent?.workflow?.administration?.deposit}
                invoicingType={
                  rent?.priceList?.configuration?.deposits?.invoicingType || 'customer'
                }
                updatePayments={fetchRent}
                className="mt-0"
                mode={'small'}
                modality={'returnDeposit'}
              />
              <CloseInvoicing
                rent={rent}
                rentId={rent._id}
                updatePayments={updatePayments}
                returnOutstandingPayments={returnOutstandingPayments}
                className="mt-0"
                mode={'small'}
              />
            </div>
          </div>
        </div>
      )}

      {!isReopeningRent &&
        (docsBlocking ? (
          <RouterPrompt
            when={docsBlocking}
            title="Non è stata caricata la lettera movo firmata dal cliente."
            description={'Clicca su "firma" per procedere'}
            cancelText="Firma"
            // okText="Conferma"
            // onOK={() => true}
            onCancel={() => history.push(movoPrintLink)}
            excludedPaths={[movoPrintLink]}
            cannotLeave
          />
        ) : (
          <RouterPrompt
            when={isBlocking}
            title="Sei sicuro di voler lasciare la pagina?"
            description={promptDescription}
            cancelText="Annulla"
            okText="Conferma"
            onOK={() => true}
            onCancel={() => false}
            excludedPaths={[`/dashboard/movimenti/${rent?._id}/stampa/dropOff`]}
          />
        ))}
    </>
  );
};

export default PayRentDetails;
