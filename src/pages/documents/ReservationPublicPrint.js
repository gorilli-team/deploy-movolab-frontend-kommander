import React, { useEffect, useState } from 'react';
import DocumentEmptyPage from '../../components/Documents/DocumentEmptyPage';
import WhiteBox from '../../components/UI/WhiteBox';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { http } from '../../utils/Utils';
import SignAgreement from '../../components/Documents/SignAgreement';
import CardsHeader from '../../components/UI/CardsHeader';
import ReservationPriceCalculation from '../../components/Reservations/ReservationPriceCalculation';
import ReservationPrintRecap from '../../components/Reservations/ReservationPrintRecap';
import FranchisesBox from '../../components/UI/FranchisesBox';

const ReservationPublicPrint = () => {
  const params = useParams();
  const [reservation, setReservation] = useState(null);
  const phase = params.phase === 'dropOff' ? 'dropOff' : 'pickUp';

  useEffect(() => {
    fetchReservation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReservation = async () => {
    try {
      const response = await http({ url: `/public/reservations/${params.id}` });
      setReservation(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <DocumentEmptyPage bodyClassName="p-0">
      <CardsHeader className="print:hidden" title="Firma documento di prenotazione noleggio" />
      <WhiteBox className="mx-2 print:mx-0 print:shadow-none print:w-[150vw] print:scale-[66.666%] print:translate-x-[-16.666%] print:translate-y-[-17%]">
        {reservation ? (
          <>
            <div className="flex">
              <div className="w-full">
                <ReservationPrintRecap
                  reservation={reservation}
                  phase={phase}
                  className="border-gray-500 border-2 !shadow-none !m-2"
                />

                <div className="w-full">
                  <div className="border-gray-500 border-2 rounded-2xl m-2 overflow-hidden">
                    <div className="pt-2 px-6">
                      <h3 className="w-full text-lg font-semibold">Franchigie</h3>
                    </div>
                    <FranchisesBox rentResevation={reservation} className="px-4 py-3 flex-wrap" />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full">
              <ReservationPriceCalculation
                reservation={reservation}
                mode="full"
                className="border-gray-500 border-2 !shadow-none !m-2"
                isCollapsible={false}
                innerClassName="p-6"
              >
                <div className="py-3 px-6 bg-slate-100">
                  <h3 className="w-full text-lg font-semibold">Calcolo prezzo</h3>
                </div>
              </ReservationPriceCalculation>
            </div>

            <SignAgreement
              reservationId={reservation._id}
              // phase={phase}
              signatureData={reservation?.signature}
              isPrint={false}
              movoType={reservation?.movementType}
              consentsCol1={
                phase === 'pickUp'
                  ? [
                      `Il sottoscritto, sopra identificato come Conducente o Altro Conducente, prende in consegna il veicolo sopra 
                      indicato nello stato d’uso ed alle condizioni riportate nel presente documento che dichiara di aver letto e 
                      accettato. Dichiara inoltre di avere letto l'informativa privacy ai sensi del Regolamento UE 2016/679 (GDPR) 
                      ed acconsento ai trattamenti ivi descritti, compresa la comunicazione dei dati personali ai terzi ivi  elencati.`,
                    ]
                  : [
                      `Il sottoscritto, sopra identificato come Conducente o Altro Conducente, riconsegna il veicolo sopra indicato 
                      nello stato d’uso ed alle condizioni riportate nel presente documento che dichiara di aver letto e accettato. 
                      Dichiara inoltre di avere letto l'informativa privacy ai sensi del Regolamento UE 2016/679 (GDPR) ed acconsento 
                      ai trattamenti ivi descritti, compresa la comunicazione dei dati personali ai terzi ivi  elencati.`,
                    ]
              }
            />
          </>
        ) : null}
      </WhiteBox>
    </DocumentEmptyPage>
  );
};
export default ReservationPublicPrint;
