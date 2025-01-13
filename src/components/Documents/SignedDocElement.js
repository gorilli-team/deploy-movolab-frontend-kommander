import React from 'react';
import ElementLabel from '../UI/ElementLabel';
import Button from '../UI/buttons/Button';

const SignedDocElement = ({ signature, phase = 'pickUp', rentId, reservationId }) =>
  signature?.verified ? (
    <div className="bg-slate-100 rounded-lg mt-3 p-3 px-4 relative overflow-hidden">
      <div className="flex content-between">
        <div className="flex-1 flex flex-col">
          <div className="text-md font-semibold py-1">
            Contratto di{' '}
            {reservationId ? 'prenotazione' : phase === 'pickUp' ? 'apertura' : 'chiusura'}
          </div>
          <div className="text-sm mt-1 break-all flex-1">
            Documento di{' '}
            {reservationId ? 'prenotazione' : phase === 'pickUp' ? 'apertura' : 'chiusura'} firmato
            con OTP
          </div>
          <h6 className="text-sm mt-2 text-gray-600">
            <ElementLabel className="py-0.5 px-2 mr-1.5" bgColor="bg-gray-400">
              Contratto
            </ElementLabel>
            Firmato il: {new Date(signature.signedAt).toLocaleDateString()}
          </h6>
        </div>
        <div>
          <Button
            to={
              reservationId
                ? `/dashboard/prenotazioni/${reservationId}/stampa/`
                : `/dashboard/movimenti/${rentId}/stampa/${phase}`
            }
            className="!py-1.5 block"
            btnStyle="white"
          >
            Vai al documento
          </Button>
        </div>
      </div>
    </div>
  ) : null;

export default SignedDocElement;
