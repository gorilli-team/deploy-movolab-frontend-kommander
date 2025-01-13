import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../UI/buttons/Button';
import { TextField } from '../Form/TextField';
import toast from 'react-hot-toast';
import { http } from '../../utils/Utils';
import FinePrints, {
  defConsentsCol1,
  defConsentsCol2,
  DefTermsAndConditionsCol1,
  DefTermsAndConditionsCol2,
} from '../../utils/FinePrints';
import DrawingBox from '../UI/DrawingBox';

const SignAgreement = ({
  consentsCol1 = defConsentsCol1,
  consentsCol2 = defConsentsCol2,
  signatureData = null,
  TermsAndConditionsCol1 = DefTermsAndConditionsCol1,
  TermsAndConditionsCol2 = DefTermsAndConditionsCol2,
  rentId = null,
  reservationId = null,
  isPrint = false,
  phase = null,
  showSignatureBox = false,
  onSignatureSubmit = () => {},
  onSignatureAbort = () => {},
  movoType = 'MOV',
  ...props
}) => {
  const signature = phase ? signatureData[phase] ?? null : signatureData;

  const form = useForm();
  const signBox = useRef();
  const [isSigned, setIsSigned] = useState(signature?.otp?.verified);
  const [isRequested, setIsRequested] = useState(Boolean(signature?.otp?.code));
  const [customerPhone, setCustomerPhone] = useState(null);
  const [signedAt, setSignedAt] = useState(signature?.otp?.signedAt);

  useEffect(async () => {
    const rent = await http({
      url: `/rents/${rentId}`,
      method: 'GET',
    });

    setCustomerPhone(rent.customer.phone);
  }, [rentId]);

  const onSubmit = async (data) => {
    try {
      if (rentId) {
        const response = await http({
          url: `/rents/signature/verifyOtp`,
          method: 'POST',
          form: {
            rentId: rentId,
            email: signature.email,
            phase: phase,
            otp: data.signature,
          },
        });
        setSignedAt(response.signedAt);
        toast.success('Firma avvenuta con successo');
        setIsSigned(true);
      }

      if (reservationId) {
        const response = await http({
          url: `/reservations/signature/verifyOtp`,
          method: 'POST',
          form: {
            reservationId: reservationId,
            email: signature.email,
            phase: phase,
            otp: data.signature,
          },
        });
        setSignedAt(response.signedAt);
        toast.success('Firma avvenuta con successo');
        setIsSigned(true);
      }
    } catch (error) {
      console.error('Errore. Impossibile verificare OTP');
      toast.error(error.message);
    }
  };

  const generateOtpSms = async () => {
    try {
      toast.success('Invio OTP in corso...');
      if (rentId) {
        await http({
          url: `/rents/signature/sendOtpSms`,
          method: 'POST',
          form: { rentId: rentId, phone: customerPhone, phase: phase },
        });
        toast.success('SMS inviato');
        setIsRequested(true);
      }

      if (reservationId) {
        await http({
          url: `/reservations/signature/sendOtpSms`,
          method: 'POST',
          form: { reservationId: reservationId, phone: customerPhone, phase: phase },
        });
        toast.success('SMS inviato');
        setIsRequested(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const generateOtpEmail = async () => {
    try {
      toast.success('Invio Email in corso...');
      if (rentId) {
        await http({
          url: `/rents/signature/sendOtpEmail`,
          method: 'POST',
          form: { rentId: rentId, email: signature.email, phase: phase },
        });
        toast.success('Email inviata');
        setIsRequested(true);
      }

      if (reservationId) {
        await http({
          url: `/reservations/signature/sendOtpEmail`,
          method: 'POST',
          form: { reservationId: reservationId, email: signature.email, phase: phase },
        });
        toast.success('Email inviata');
        setIsRequested(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <FinePrints
        customAgreements={true}
        TermsAndConditionsCol1={<TermsAndConditionsCol1 forceClient={movoType === 'COM'} />}
        TermsAndConditionsCol2={<TermsAndConditionsCol2 forceClient={movoType === 'COM'} />}
        {...{ consentsCol1, consentsCol2 }}
        {...props}
      >
        <div className="text-xs leading-3">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-3">
              {consentsCol1.map((text, index) => (
                <div
                  className={
                    isPrint
                      ? `flex items-center gap-x-2 space-y-3 ${
                          showSignatureBox && 'flex-wrap xl:flex-nowrap'
                        }`
                      : ''
                  }
                  key={index}
                >
                  <label
                    className={
                      isPrint
                        ? showSignatureBox
                          ? 'block w-full xl:w-1/2'
                          : 'block w-2/3'
                        : 'block'
                    }
                  >
                    {text}
                  </label>
                  {showSignatureBox ? (
                    <div className="w-full xl:w-1/2 flex justify-center">
                      <div className="overflow-auto">
                        <div className="w-[500px]">
                          <div className="bg-white w-full rounded-lg border">
                            <div className="w-1/3 font-semibold m-2">firma x</div>
                            <DrawingBox
                              className="w-100"
                              height="224px"
                              width="498px"
                              ref={signBox}
                            />
                          </div>
                          <div className="flex flex-wrap justify-center mt-2 no-pdf">
                            <div className="w-5/12">
                              <Button className="w-full py-1" onClick={onSignatureSubmit}>
                                Firma e accetta
                              </Button>
                            </div>
                            <div className="w-5/12 pl-1">
                              <Button
                                btnStyle="white"
                                className="w-full !text-red-600"
                                onClick={onSignatureAbort}
                              >
                                Annulla firma
                              </Button>
                            </div>
                            <div className="w-2/12 pl-1">
                              <Button
                                btnStyle="white"
                                className="w-full"
                                onClick={(e) => {
                                  e.preventDefault();
                                  signBox.current.clearArea();
                                }}
                              >
                                Pulisci
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : isSigned ? (
                    <div className={isPrint ? 'w-1/3' : 'mt-3'}>
                      <h2 className="text-sm font-semibold">
                        Firma digitale con OTP avanzata dal contraente
                      </h2>
                      <p className="leading-4 mt-1">
                        Firmato digitalmente da: {signature.email}
                        <br />
                        Data: {new Date(signedAt).toLocaleString()}
                        <br />
                        Ragione: Dichiaro di voler sottoscrivere il presente contratto
                      </p>
                    </div>
                  ) : !isPrint ? (
                    isRequested ? (
                      <div className="flex flex-wrap justify-center mt-5">
                        <div className="w-full">
                          <TextField
                            form={form}
                            name="signature"
                            placeholder="Inserisci codice"
                            className="w-full mb-2"
                          />
                        </div>
                        <div className="md:w-1/3 w-full pr-1 pb-2">
                          <Button
                            className="w-full"
                            btnStyle="inFormStyle"
                            onClick={(e) => {
                              e.preventDefault();
                              generateOtpSms();
                            }}
                          >
                            Richiedi codice{' '}
                            {customerPhone ? (
                              <>
                                al numero <strong>{customerPhone}</strong>
                              </>
                            ) : (
                              ''
                            )}
                          </Button>
                        </div>
                        <div className="md:w-1/3 w-full pr-1 pb-2">
                          <Button
                            className="w-full"
                            btnStyle="inFormStyle"
                            onClick={(e) => {
                              e.preventDefault();
                              generateOtpEmail();
                            }}
                          >
                            Richiedi via email
                          </Button>
                        </div>
                        <div className="md:w-1/3 w-full pl-1 pb-2">
                          <Button btnStyle="inFormStyleBlue" className="w-full">
                            Conferma OTP
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center mt-5">
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            generateOtpSms();
                          }}
                        >
                          Richiedi Codice{' '}
                          {customerPhone ? <strong>al numero {customerPhone}</strong> : ''}
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="w-1/3 font-semibold">firma x</div>
                  )}
                </div>
              ))}
            </div>
          </form>
        </div>
      </FinePrints>
    </>
  );
};

export default SignAgreement;
