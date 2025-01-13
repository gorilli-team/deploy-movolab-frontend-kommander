import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import toast from 'react-hot-toast';

import Page from '../../../../components/Dashboard/Page';
import { http } from '../../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../../utils/Utils';
import { RouterPrompt } from '../../../../components/UI/RouterPrompt';
import Fuel from '../../../../components/Rents/rentElements/Fuel';
import Damages from '../../../../components/Damages/Damages';
import RentRecap from '../../../../components/Rents/RentRecap';
import Notes from '../../../../components/Notes/Notes';
import Documents from '../../../../components/Documents/Documents';
import Franchises from '../../../../components/Rents/rentElements/Franchises';
import useFetchRent from '../../../../hooks/useFetchRent';
import ExtraServices from '../../../../components/Rents/rentElements/ExtraServices';
import PriceCalculation from '../../../../components/Rents/rentElements/PriceCalculation';
import PickupDropoffInfo from '../../../../components/Rents/rentElements/PickupDropoffInfo';
import ExtraCosts from '../../../../components/Rents/rentElements/ExtraCosts';
import CardsHeader from '../../../../components/UI/CardsHeader';
import RentExtraFields from '../../../../components/ExtraFields/RentExtraFields';
import Stepper from '../../../../components/UI/Stepper';
import Deposit from '../../../../components/Rents/rentElements/Deposit';
import OpenInvoicing from '../../../../components/Rents/rentElements/OpenInvoicing';
import Payments from '../../../../components/Payments/Payments';
import Invoices from '../../../../components/Invoices/Invoices';
import { calculateRentOpeningTotals } from '../../../../utils/Rent';
import Button from '../../../../components/UI/buttons/Button';
import { FaSearch } from 'react-icons/fa';
import ModalConfirmDialog from '../../../../components/UI/ModalConfirmDialog';

const NewRent2 = () => {
  const history = useHistory();
  const params = useParams();

  const rentId = params.id;
  const phase = 'pickUp';

  const [rentCompleted, setRentCompleted] = useState(false); //eslint-disable-line
  const [isBlocking, setIsBlocking] = useState(false); //eslint-disable-line
  const [updatedRent, setUpdatedRent] = useState(null);
  const [cancelRentConfirm, setCancelRentConfirm] = useState(false);

  const rent = useFetchRent(rentId);

  const updatePrice = (rent) => {
    setUpdatedRent(rent);
  };

  const fetchRent = async () => {
    try {
      const rent = await http({ url: `/rents/${rentId}` });
      setUpdatedRent(rent);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const completeRent = async () => {
    try {
      const updatedRent = await http({
        url: '/rents/' + rent._id,
      });

      if (updatedRent.payments && updatedRent.invoices) {
        const hasUnpaidDeposit = updatedRent.invoices
          .filter((inv) => inv.invoicingMoment === 'deposit')
          .reduce(
            (unpaidDeposit, inv) =>
              (unpaidDeposit =
                unpaidDeposit === false
                  ? !updatedRent.payments.find((p) => p.invoice === inv._id)
                  : false),
            false,
          );

        if (hasUnpaidDeposit) {
          toast.error('Sono presenti dei depositi fatturati da pagare');
          return;
        }
      }

      if (updatedRent?.workflow?.extraFields?.length > 0) {
        const extraFields = updatedRent?.workflow?.extraFields;
        const extraFieldsValues = updatedRent?.extraFields;
        const missingExtraFields = [];
        extraFields.forEach((extraField) => {
          if (extraField.requiredField) {
            if (extraFieldsValues.length === 0) {
              missingExtraFields.push(extraField);
            }
            extraFieldsValues.map((extraFieldValue) => {
              if (extraFieldValue.extraFieldId === extraField._id) {
                if (extraFieldValue.value === '') {
                  missingExtraFields.push(extraField);
                }
              }
              return null;
            });
          }
        });

        if (rent.state === 'chiuso' && missingExtraFields.length > 0) {
          toast.error(
            `Inserire i dati extra: ${missingExtraFields.map((field) => field.field).join(', ')}`,
          );
          return;
        }
      }
      const rentOpeningTotals = calculateRentOpeningTotals(
        updatedRent,
        updatedRent?.workflow?.administration?.prepaidRent,
      );

      const outstandingPayments =
        rentOpeningTotals.missingMovolab + rentOpeningTotals.missingCustomer;

      if (updatedRent?.workflow?.administration?.prepaidRent > 0 && outstandingPayments > 0) {
        toast.error(`Non è possibile aprire il movo con pagamenti in sospeso`);
      } else {
        const data = {
          stepDone: 2,
          state: 'aperto',
        };
        const response = await http({
          url: '/rents/' + rentId,
          method: 'PUT',
          form: data,
        });

        if (response) {
          toast.success('Movo aperto con successo');
          history.push(`/dashboard/movimenti/${rentId}`);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Errore durante il salvataggio del movimento');
    }
  };

  const cancelRent = async (confirm = false) => {
    if (!confirm) {
      setCancelRentConfirm(true);
      return;
    }

    try {
      const data = {
        stepDone: 2,
        state: 'annullato',
      };

      const response = await http({
        url: '/rents/' + rentId,
        method: 'PUT',
        form: data,
      });
      if (response) {
        setCancelRentConfirm(false);
        history.push(`/dashboard/movimenti/${rentId}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Errore durante il salvataggio del movimento');
    }
  };

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName={'pb-4'}>
      <CardsHeader
        title="Apertura movo"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            to: `/dashboard/movimenti/crea/1/${rent?._id}`,
          },
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Annulla movo',
            className: 'text-red-500',
            onClick: () => cancelRent(),
          },
          {
            children: 'Apri movo',
            onClick: completeRent,
          },
        ]}
      >
        <Stepper
          colorScheme="orange"
          steps={[{ content: '1' }, { content: '2', isCurrent: true }]}
        />
      </CardsHeader>
      {rent && rent._id && (
        <div className="flex space-x-4 px-6">
          {rent !== undefined && rent.state !== 'draft' && history.push('/dashboard/movimenti')}
          <div className="w-3/4">
            <RentRecap rent={rent} phase={phase} />
            <div className="mt-4">
              <PickupDropoffInfo
                rent={rent}
                phase={phase}
                updatePrice={updatePrice}
                viewMode={rent?.state === 'fatturato' || rent?.state === 'chiuso'}
              />
            </div>
            <RentExtraFields rent={rent} />
            <Fuel
              rent={rent}
              vehicle={rent.vehicle?._id}
              phase={phase}
              viewMode={rent?.state === 'fatturato' || rent?.state === 'chiuso'}
            />
            <Damages rent={rent} vehicle={rent.vehicle?._id} phase={phase} />
            <ExtraServices rentData={rent} phase={phase} updatePrice={updatePrice} />
            <ExtraCosts rentData={rent} phase={phase} />
            <Franchises rentData={rent} phase={phase} updatePrice={updatePrice} />
            <Documents rent={rent} phase={phase} />
            <Notes rent={rent} />
            <Payments elem={updatedRent || rent} />
            <Invoices invoices={updatedRent?.invoices || rent?.invoices} />
          </div>
          <div className="w-1/4">
            <div className="sticky top-[77px]">
              <PriceCalculation
                rent={updatedRent || rent}
                phase={phase}
                mode={'small'}
                className="mt-0"
              />
              <Deposit
                rent={updatedRent || rent}
                deposit={rent?.workflow?.administration?.deposit}
                invoicingType={
                  rent?.priceList?.configuration?.deposits?.invoicingType || 'customer'
                }
                updatePayments={fetchRent}
                className="mt-0"
                mode={'small'}
                modality={'giveDeposit'}
              />
              <OpenInvoicing
                rent={updatedRent || rent}
                deposit={rent?.workflow?.administration?.deposit}
                prepaidRent={
                  rent?.workflow?.administration?.prepaid
                    ? rent?.workflow?.administration?.prepaidRent
                    : 0
                }
                updatePayments={fetchRent}
                className="mt-0"
                mode={'small'}
              />
            </div>
          </div>
        </div>
      )}

      {rent._id && (
        <div className="text-center">
          <Button
            btnStyle="unstyled"
            className="text-slate-500 underline text-xs"
            to={`/dashboard/movimenti/${rent?._id}/aggiornamenti`}
          >
            <FaSearch className="inline mb-1" /> Log aggiornamenti
          </Button>
        </div>
      )}

      <RouterPrompt
        when={isBlocking && !rentCompleted}
        title="Sei sicuro di voler lasciare la pagina?"
        description="Le modifiche non salvate andranno perse"
        cancelText="Cancella"
        okText="Conferma"
        onOK={() => true}
        onCancel={() => false}
      />

      <ModalConfirmDialog
        isVisible={cancelRentConfirm}
        title="Continuando, questo movo verrà annullato."
        description="Annullare il movo?"
        handleCancel={() => setCancelRentConfirm(false)}
        handleOk={() => cancelRent(true)}
        cancelText="Torna ai dettagli"
        okText="Annulla movo"
      />
    </Page>
  );
};

export default NewRent2;
