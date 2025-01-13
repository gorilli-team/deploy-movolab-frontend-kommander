import React, { useEffect, useRef, useState } from 'react';
import Page from '../../../components/Dashboard/Page';
import WhiteBox from '../../../components/UI/WhiteBox';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
// import FinePrints from '../../../utils/FinePrints';
import CardsHeader from '../../../components/UI/CardsHeader';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import PriceCalculation from '../../../components/Rents/rentElements/PriceCalculation';
import RentPrintRecap from '../../../components/Documents/RentPrintRecap';
import FranchisesBox from '../../../components/UI/FranchisesBox';
import { FuelLevel, findFuelType } from '../../../components/Rents/rentElements/Fuel';
import { mapDamageLevel, mapDamageVehiclePart } from '../../../components/Damages/Damage';
import ElementLabel from '../../../components/UI/ElementLabel';
import DamagesImage from '../../../components/Damages/DamagesImage';
import Payments from '../../../components/Payments/Payments';
import ConfirmEmailModal from '../../../components/Documents/ConfirmEmailModal';
import SignAgreement from '../../../components/Documents/SignAgreement';
import html2pdf from 'html2pdf.js';
import LoadingSpinner from '../../../assets/icons/LoadingSpinner';
import { uploadToS3 } from '../../../components/Form/DocumentUploader';

const checkUploadedDoc = async (rentId, phase, label) => {
  const curDocs = await http({ url: `/rents/documents/${rentId}?phase=${phase}` });
  return curDocs.find((d) => d.label === label);
};

const createDocumentUpload = async (rentId, phase, documentUrl = null, docDescription = false) => {
  // Creo documenti da caricare per i contratti di apertura e chiusura, se non esistono
  if (!(await checkUploadedDoc(rentId, phase, phase.toLowerCase() + 'contract'))) {
    await http({
      url: `/rents/documents/add/${rentId}?phase=${phase}`,
      method: 'POST',
      form: {
        label: phase.toLowerCase() + 'contract',
        name: `Contratto ${phase === 'pickUp' ? 'apertura' : 'chiusura'} movo`,
        description:
          docDescription ||
          `${documentUrl ? 'Contratto' : 'Caricare il contratto'} firmato di ${
            phase === 'pickUp' ? 'apertura' : 'chiusura'
          } movo`,
        fileUrl: documentUrl,
      },
    });
  }
};

const RentPrint = () => {
  const params = useParams();
  const history = useHistory();
  const [rent, setRent] = useState(null);
  const [fuel, setFuel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(false);
  const [showSignatureBox, setShowSignatureBox] = useState(false);
  const [customer, setCustomer] = useState(''); // eslint-disable-line
  const [isConfirmEmailModalVisible, setIsConfirmEmailModalVisible] = useState(false);
  const signatureRef = useRef(null);
  const phase = params.phase === 'dropOff' ? 'dropOff' : 'pickUp';

  const page2PDF = async (
    element,
    filename = 'dettaglio_movo.pdf',
    forceUpload = false,
    download = true,
  ) => {
    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.65 },
      html2canvas: { scale: 2, width: 2000, allowTaint: true, useCORS: true },
      jsPDF: { orientation: 'landscape' },
    };

    const style = document.createElement('style');
    document.head.appendChild(style);
    style.sheet.insertRule('#rentPrint { width: 2000px; }');
    style.sheet.insertRule('.no-pdf { display: none; }');

    // Html3pdf bugfix with tailwind preflight
    style.sheet.insertRule('body > div:last-child img { display: inline-block; }');

    setIsLoading(true);

    const worker = html2pdf().set(opt).from(element).toPdf();

    // Popolo col documento alla "seconda" volta che lo pigio (alla prima lo crea sempre)
    if (forceUpload) {
      worker.output('blob').then((data) => {
        const file = new File([data], filename);
        style.remove();

        uploadToS3(
          file,
          'movolab-rent-documents',
          async (location) => {
            if (uploadedDoc && !uploadedDoc.fileUrl) {
              await http({
                url: `/rents/documents/update/${rent._id}/${uploadedDoc._id}?phase=${phase}`,
                method: 'POST',
                form: {
                  fileUrl: location,
                  description: 'Documento firmato con dispositivo',
                },
              });
            } else {
              await createDocumentUpload(
                rent._id,
                phase,
                location,
                'Documento firmato con dispositivo',
              );
            }

            await fetchUploadedDoc();
            setShowSignatureBox(false);
            setIsLoading(false);
            toast.success('Documento firmato e salvato correttamente');
          },
          filename,
        );
      });
    } else {
      (async () => {
        await createDocumentUpload(rent._id, phase);
        fetchUploadedDoc();
      })();
    }

    fetchUploadedDoc();

    if (download) {
      worker.save().then((res) => {
        style.remove();
        setIsLoading(false);
        toast.success(
          'Documento scaricato in formato PDF, è ora possibile firmarlo e ricaricarlo nella pagina del movo.',
        );
      });
    }
  };

  const closeModal = () => {
    setIsConfirmEmailModalVisible(false);
    history.go(`/dashboard/movimenti/${rent._id}/`);
  };

  useEffect(() => {
    fetchRent();
    fetchFuelLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      if (rent) {
        fetchUploadedDoc();
      }
    })();
  }, [rent]); // eslint-disable-line

  const fetchUploadedDoc = async () => {
    setUploadedDoc(await checkUploadedDoc(rent._id, phase, phase.toLowerCase() + 'contract'));
  };

  const fetchRent = async () => {
    try {
      const response = await http({ url: `/rents/${params.id}` });
      setCustomer(response?.driver);

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

  const signature = rent?.signature[phase];
  const isSigned = signature?.otp?.verified;
  const isRequested = Boolean(signature?.otp?.code);
  const verificationHasEmail = Boolean(signature?.email); // eslint-disable-line

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName={'pb-4'}>
      <CardsHeader
        className="print:hidden"
        title="Stampa dettagli movo"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
          },
          {
            btnStyle: isSigned || isRequested || uploadedDoc ? 'slate' : 'blue',
            children: isSigned || uploadedDoc?.fileUrl ? 'Scarica documento' : 'Firma documento',
            isDropdown: !isSigned,
            dropdownItems: [
              {
                children: 'Firma online con OTP',
                onClick: () => {
                  setIsConfirmEmailModalVisible(true);
                  // history.push(`/documenti/movimenti/${params.id}/stampa/${phase}`);
                },
                hiddenIf: isSigned || uploadedDoc?.fileUrl,
              },
              {
                children: 'Firma con dispositivo',
                hiddenIf: isSigned || uploadedDoc?.fileUrl,
                onClick: () => {
                  setShowSignatureBox(!showSignatureBox);
                  document.getElementById('bodyPage').scrollTo({
                    top: signatureRef.current.offsetTop,
                    behavior: 'smooth',
                  });
                  // page2PDF(document.getElementById('rentPrint'))
                },
              },
              {
                children: 'Firma su carta',
                onClick: () => {
                  if (!(uploadedDoc && uploadedDoc.fileUrl)) {
                    const printBox = document.getElementById('rentPrint');
                    const fileName = `documento_${
                      phase === 'dropOff' ? 'chiusura' : 'apertura'
                    }_movo_${rent.code.replaceAll('/', '-')}.pdf`;
                    page2PDF(printBox, fileName);
                  }
                },
                href: uploadedDoc?.fileUrl ?? null,
              },
            ],
            onClick: isSigned
              ? () => {
                  if (!(uploadedDoc && uploadedDoc.fileUrl)) {
                    const printBox = document.getElementById('rentPrint');
                    const fileName = `documento_prenotazione_movo_${rent.code.replaceAll(
                      '/',
                      '-',
                    )}.pdf`;
                    page2PDF(printBox, fileName);
                  }
                }
              : null,
            href: uploadedDoc?.fileUrl ?? null,
          },
        ]}
      />
      {isLoading && (
        <div className="w-full h-full absolute top-0 left-0 z-10 bg-slate-800 bg-opacity-10 flex items-center justify-center">
          <div className="w-24 h-24">
            <LoadingSpinner />
            <span className="sr-only">Carico...</span>
          </div>
        </div>
      )}
      <div className="text-gray-800" id="rentPrint">
        <WhiteBox className="mx-6">
          {rent ? (
            <>
              <div className="flex flex-wrap">
                <div className="w-full lg:w-1/2">
                  <RentPrintRecap
                    rent={rent}
                    phase={phase}
                    className="border-gray-500 border-2 !shadow-none !m-2"
                  />

                  <div className="border-gray-500 border-2 rounded-2xl m-2 py-2 px-6 flex flex-wrap gap-y-4 justify-between items-center">
                    <h3 className="text-lg font-semibold mr-3">
                      {fuelType === 'elettrico' ? 'Batteria' : 'Carburante'}
                    </h3>
                    <FuelLevel level={fuel} bgColor={fuelTypeInfos.color} />
                  </div>

                  <div className="flex flex-wrap lg:flex-nowrap">
                    <div className="w-full lg:w-1/3">
                      <div className="border-gray-500 border-2 rounded-2xl m-2 overflow-hidden">
                        <div className="pt-2 px-6 flex-1">
                          <h3 className="w-full text-lg font-semibold">Franchigie</h3>
                        </div>
                        <FranchisesBox
                          rentResevation={rent}
                          phase={phase}
                          className="px-4 py-3 flex-wrap"
                        />
                      </div>
                    </div>
                    <div className="w-full lg:w-2/3">
                      <div className="border-gray-500 border-2 rounded-2xl m-2 overflow-hidden">
                        <div className="flex flex-wrap">
                          <div className="flex flex-1 flex-wrap py-2 px-4">
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
                          <div className="mt-2 w-full lg:w-auto">
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
                <div className="w-full lg:w-1/2">
                  <PriceCalculation
                    rent={rent}
                    mode="full"
                    className="border-gray-500 border-2 !shadow-none !m-2"
                    isCollapsible={false}
                    innerClassName="p-6 py-2"
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
              </div>

              <div ref={signatureRef} className="h-0"></div>

              <SignAgreement
                rentId={rent._id}
                phase={phase}
                signatureData={rent?.signature}
                isPrint={true}
                showSignatureBox={showSignatureBox}
                movoType={rent?.movementType}
                onSignatureSubmit={(e) => {
                  e.preventDefault();
                  const printBox = document.getElementById('rentPrint');
                  const fileName = `documento_${
                    phase === 'dropOff' ? 'chiusura' : 'apertura'
                  }_movo_${rent.code.replaceAll('/', '-')}.pdf`;
                  page2PDF(printBox, fileName, true, false);
                }}
                onSignatureAbort={(e) => {
                  e.preventDefault();
                  setShowSignatureBox(false);
                }}
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
      </div>
      {isConfirmEmailModalVisible && (
        <ConfirmEmailModal
          customer={customer}
          rentId={rent?._id}
          closeModal={closeModal}
          mode="sendLink"
          text="Invieremo al cliente una mail per la firma del contratto"
          phase={phase}
        />
      )}
    </Page>
  );
};
export default RentPrint;
