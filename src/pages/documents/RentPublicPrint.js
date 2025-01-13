import React, { useEffect, useState } from 'react';
import DocumentEmptyPage from '../../components/Documents/DocumentEmptyPage';
import WhiteBox from '../../components/UI/WhiteBox';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { http } from '../../utils/Utils';
import SignAgreement from '../../components/Documents/SignAgreement';
import CardsHeader from '../../components/UI/CardsHeader';
import PriceCalculation from '../../components/Rents/rentElements/PriceCalculation';
import RentPrintRecap from '../../components/Documents/RentPrintRecap';
import FranchisesBox from '../../components/UI/FranchisesBox';
import { FuelLevel, findFuelType } from '../../components/Rents/rentElements/Fuel';
import { mapDamageLevel, mapDamageVehiclePart } from '../../components/Damages/Damage';
import ElementLabel from '../../components/UI/ElementLabel';
import DamagesImage from '../../components/Damages/DamagesImage';
import Payments from '../../components/Payments/Payments';

const RentPublicPrint = () => {
  const params = useParams();
  const [rent, setRent] = useState(null);
  const [fuel, setFuel] = useState(null);
  const phase = params.phase === 'dropOff' ? 'dropOff' : 'pickUp';

  useEffect(() => {
    fetchRent();
    fetchFuelLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRent = async () => {
    try {
      const response = await http({ url: `/public/rents/${params.id}` });
      setRent(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchFuelLevel = async () => {
    const response = await http({
      url: `/rents/fuel/${params.id}?phase=${phase}`,
      method: 'GET',
    });

    if (response) {
      if (response?.dropOffFuel !== undefined) {
        setFuel(response.dropOffFuel);
      } else if (response?.pickUpFuel !== undefined) {
        setFuel(response.pickUpFuel);
      }
    }
  };

  const fuelType = rent?.vehicle?.version?.powerSupply;
  const fuelTypeInfos = findFuelType(fuelType);

  const vehicleDamages = rent?.vehicle?.damages ?? [];

  const showDamages =
    phase === 'pickUp'
      ? vehicleDamages
      : vehicleDamages.filter((damage) => damage.rentId === rent?._id);

  return (
    <DocumentEmptyPage bodyClassName="p-0">
      <CardsHeader className="print:hidden" title="Firma documento di noleggio" />
      <WhiteBox className="mx-2 print:mx-0 print:shadow-none print:w-[150vw] print:scale-[66.666%] print:translate-x-[-16.666%] print:translate-y-[-17%]">
        {rent ? (
          <>
            <div className="flex">
              <div className="w-full">
                <RentPrintRecap
                  rent={rent}
                  phase={phase}
                  className="border-gray-500 border-2 !shadow-none !m-2"
                />

                <div className="border-gray-500 border-2 rounded-2xl m-2 py-2 px-6 flex justify-between items-center">
                  <h3 className="text-lg font-semibold mr-3">
                    {fuelType === 'elettrico' ? 'Batteria' : 'Carburante'}
                  </h3>
                  <FuelLevel level={fuel} bgColor={fuelTypeInfos.color} />
                </div>

                <div className="w-full">
                  <div className="border-gray-500 border-2 rounded-2xl m-2 overflow-hidden">
                    <div className="pt-2 px-6">
                      <h3 className="w-full text-lg font-semibold">Franchigie</h3>
                    </div>
                    <FranchisesBox rentResevation={rent} className="px-4 py-3 flex-wrap" />
                  </div>
                </div>
                <div className="w-full">
                  <div className="border-gray-500 border-2 rounded-2xl m-2 overflow-hidden">
                    <div className="flex flex-wrap">
                      <div className="flex flex-wrap py-2 px-4">
                        <h3 className="w-full text-lg font-semibold">
                          Danni {phase === 'pickUp' ? 'già presenti' : 'dal movo'}
                        </h3>

                        {showDamages.map((damage, index) => (
                          <div className="w-full" key={index}>
                            {index < 3 ? (
                              <div className="text-sm font-semibold py-1">
                                Danno su {mapDamageVehiclePart(damage.vehiclePart ?? 'other')}
                                {damage.damageLevel !== undefined && (
                                  <span className="ml-2">
                                    <ElementLabel
                                      className="ml-3"
                                      bgColor={
                                        damage.damageLevel === 'low'
                                          ? 'bg-green-700'
                                          : damage.damageLevel === 'medium'
                                          ? 'bg-yellow-700'
                                          : 'bg-red-700'
                                      }
                                    >
                                      {mapDamageLevel(damage.damageLevel)}
                                    </ElementLabel>
                                  </span>
                                )}
                              </div>
                            ) : index < 4 ? (
                              <span className="text-xs">
                                Altri {showDamages.length - 3} danni...
                              </span>
                            ) : null}
                          </div>
                        ))}
                        {showDamages.length === 0 && (
                          <strong>
                            Il veicolo non presenta alcun danno{' '}
                            {phase === 'pickUp' ? 'pregresso' : 'dal movo'}
                          </strong>
                        )}
                        {/*phase === 'pickUp' ? (<span className="text-xs">
                            Il veicolo prensenta {vehicleDamages.length - showDamages.length} danni...
                          </span>) : null*/}
                      </div>
                      <div className="mt-2 w-full md:w-auto">
                        <DamagesImage
                          vehicleId={rent?.vehicle._id}
                          rentId={rent?._id}
                          phase={phase}
                          className="!p-0 !my-0 !mx-auto"
                          imgClassName="!w-[250px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full">
              <PriceCalculation
                rent={rent}
                mode="full"
                className="border-gray-500 border-2 !shadow-none !m-2"
                isCollapsible={false}
                innerClassName="p-6"
              >
                <div className="py-3 px-6 bg-slate-100">
                  <h3 className="w-full text-lg font-semibold">Calcolo prezzo</h3>
                </div>
              </PriceCalculation>
              <Payments
                elem={rent}
                className="border-gray-500 border-2 !shadow-none !m-2"
                innerClassName="!border-none"
                isCollapsible={false}
                isPrint={true}
              />
            </div>

            <SignAgreement
              rentId={rent._id}
              phase={phase}
              signatureData={rent?.signature}
              isPrint={false}
              movoType={rent?.movementType}
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
export default RentPublicPrint;
