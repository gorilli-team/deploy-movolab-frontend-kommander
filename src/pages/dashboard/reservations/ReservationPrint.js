import React, { useEffect, useRef, useState } from 'react';
import Page from '../../../components/Dashboard/Page';
import WhiteBox from '../../../components/UI/WhiteBox';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import ReservationPriceCalculation from '../../../components/Reservations/ReservationPriceCalculation';
import CardsHeader from '../../../components/UI/CardsHeader';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import ReservationPrintRecap from '../../../components/Reservations/ReservationPrintRecap';
import FranchisesBox from '../../../components/UI/FranchisesBox';
import html2pdf from 'html2pdf.js';
import SignAgreement from '../../../components/Documents/SignAgreement';
import ConfirmEmailModal from '../../../components/Documents/ConfirmEmailModal';
import LoadingSpinner from '../../../assets/icons/LoadingSpinner';
import { uploadToS3 } from '../../../components/Form/DocumentUploader';

const checkUploadedDoc = async (reservationId, label) => {
  const curDocs = await http({ url: `/reservations/documents/${reservationId}` });
  return curDocs.find((d) => d.label === label);
};

const createDocumentUpload = async (reservationId, documentUrl = null, docDescription = false) => {
  // Creo documenti da caricare per i contratti di apertura e chiusura, se non esistono
  if (!(await checkUploadedDoc(reservationId, 'contract'))) {
    await http({
      url: `/reservations/documents/add/${reservationId}`,
      method: 'POST',
      form: {
        label: 'contract',
        name: `Contratto di prenotazione`,
        description:
          docDescription ||
          `${documentUrl ? 'Contratto' : 'Caricare il contratto'} firmato di prenotazione`,
        fileUrl: documentUrl,
      },
    });
  }
};

const ReservationPrint = () => {
  const params = useParams();
  const history = useHistory();
  const [reservation, setReservation] = useState(null);
  const [uploadedDoc, setUploadedDoc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSignatureBox, setShowSignatureBox] = useState(false);
  const signatureRef = useRef(null);
  const [customer, setCustomer] = useState(''); // eslint-disable-line
  const [isConfirmEmailModalVisible, setIsConfirmEmailModalVisible] = useState(false);
  const [isSendReservationEmailModalVisible, setIsSendReservationEmailModalVisible] =
    useState(false);

  useEffect(() => {
    fetchReservation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeModal = () => {
    setIsConfirmEmailModalVisible(false);
    history.go(`/dashboard/prenotazioni/${reservation._id}/`);
  };

  const closeSendEmailModal = () => {
    setIsSendReservationEmailModalVisible(false);
    history.go(`/dashboard/prenotazioni/${reservation._id}/`);
  };

  const page2PDF = async (
    element,
    filename = 'dettaglio_prenotazione.pdf',
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
    style.sheet.insertRule('#reservationPrint { width: 2000px; }');
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
                url: `/reservations/documents/update/${reservation._id}/${uploadedDoc._id}`,
                method: 'POST',
                form: {
                  fileUrl: location,
                  description: 'Documento firmato con dispositivo',
                },
              });
            } else {
              await createDocumentUpload(
                reservation._id,
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
        await createDocumentUpload(reservation._id);
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

  useEffect(() => {
    (async () => {
      if (reservation) {
        fetchUploadedDoc();
      }
    })();
  }, [reservation]); // eslint-disable-line

  const fetchUploadedDoc = async () => {
    setUploadedDoc(await checkUploadedDoc(reservation._id, 'contract'));
  };

  const fetchReservation = async () => {
    try {
      const response = await http({ url: `/reservations/${params.id}` });
      setCustomer(response?.driver);
      setReservation(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  //eslint-disable-next-line
  const sendReservationEmail = async (email) => {
    try {
      await http({
        url: `/reservations/emails/${params.id}`,
        method: 'POST',
        form: {
          email,
        },
      });
      toast.success('Email inviata correttamente');
    } catch (err) {
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const signature = reservation?.signature;
  const isSigned = signature?.otp?.verified;
  const isRequested = Boolean(signature?.otp?.code);

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName={'pb-4'}>
      <CardsHeader
        className="print:hidden"
        title="Stampa dettagli prenotazione"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
          },
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Invia Email',
            onClick: () => setIsSendReservationEmailModalVisible(true),
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
                  // page2PDF(document.getElementById('reservationPrint'))
                },
              },
              {
                children: 'Firma su carta',
                onClick: () => {
                  if (!(uploadedDoc && uploadedDoc.fileUrl)) {
                    const printBox = document.getElementById('reservationPrint');
                    const fileName = `documento_prenotazione_movo_${reservation.code.replaceAll(
                      '/',
                      '-',
                    )}.pdf`;
                    page2PDF(printBox, fileName);
                  }
                },
                href: uploadedDoc?.fileUrl ?? null,
              },
            ],
            onClick: isSigned
              ? () => {
                  if (!(uploadedDoc && uploadedDoc.fileUrl)) {
                    const printBox = document.getElementById('reservationPrint');
                    const fileName = `documento_prenotazione_movo_${reservation.code.replaceAll(
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
      <div className="text-gray-800" id="reservationPrint">
        <WhiteBox className="mx-6">
          {reservation ? (
            <>
              <div className="flex flex-wrap">
                <div className="w-full lg:w-1/2">
                  <ReservationPrintRecap
                    reservation={reservation}
                    className="border-gray-500 border-2 !shadow-none !m-2"
                  />
                  <div className="border-gray-500 border-2 rounded-2xl m-2 overflow-hidden">
                    <div className="py-2 px-6 bg-slate-100 flex-1">
                      <h3 className="w-full text-lg font-semibold">Franchigie</h3>
                    </div>
                    <FranchisesBox rentResevation={reservation} className="px-4 py-3" />
                  </div>
                </div>
                <div className="w-full lg:w-1/2">
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
              </div>

              {/*<FinePrints />*/}

              <div ref={signatureRef}>&nbsp;</div>

              <SignAgreement
                reservationId={reservation._id}
                // phase={phase}
                movoType={reservation?.movementType}
                signatureData={reservation?.signature}
                isPrint={true}
                showSignatureBox={showSignatureBox}
                onSignatureSubmit={(e) => {
                  e.preventDefault();
                  const printBox = document.getElementById('reservationPrint');
                  const fileName = `documento_prenotazione_movo_${reservation.code.replaceAll(
                    '/',
                    '-',
                  )}.pdf`;
                  page2PDF(printBox, fileName, true, false);
                }}
                onSignatureAbort={(e) => {
                  e.preventDefault();
                  setShowSignatureBox(false);
                }}
                consentsCol1={[
                  `Ai sensi e per gli effetti dell'artt. 1341 e 1342 del codice civile approvo
                  espressamente gli artt. 3, 4, 6, 7, 9 e 10 delle Condizioni sotto riportate.
                  Il sottoscritto dichiara inoltre di avere letto l'informativa privacy ai sensi del
                  Regolamento UE 2016/679 (GDPR) ed acconsento ai trattamenti ivi descritti, compresa la
                  comunicazione dei dati personali ai terzi ivi elencati.`,
                  // `Acconsento a ricevere materiale informativo o pubblicitario.`,
                ]}
              />
            </>
          ) : null}
        </WhiteBox>
      </div>

      {isConfirmEmailModalVisible && (
        <ConfirmEmailModal
          customer={customer}
          reservationId={reservation?._id}
          closeModal={closeModal}
          mode="sendLink"
          text="Invieremo al cliente una mail per la firma del contratto."
        />
      )}
      {isSendReservationEmailModalVisible && (
        <ConfirmEmailModal
          customer={customer}
          reservationId={reservation?._id}
          closeModal={closeSendEmailModal}
          mode="sendReservationEmail"
          text="Invieremo al cliente il riepilogo della prenotazione."
        />
      )}
    </Page>
  );
};
export default ReservationPrint;
