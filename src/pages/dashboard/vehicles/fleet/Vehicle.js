import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useParams, useHistory } from 'react-router-dom';

import Page from '../../../../components/Dashboard/Page';
import { http } from '../../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../../utils/Utils';
import ShowVehicle from '../../../../components/Vehicles/Vehicles/ShowVehicle';
import CardsHeader from '../../../../components/UI/CardsHeader';

const Vehicle = () => {
  const form = useForm();
  const params = useParams();
  const history = useHistory();
  const [vehicle, setVehicle] = useState({});

  const fetchVehicle = async () => {
    try {
      const response = await http({ url: `/vehicles/vehicle/${params.id}` });

      if (!response) {
        toast.error('Veicolo non trovato');
        history.push('/dashboard/veicoli/flotta');
        return <>Redirecting...</>;
      }

      if (response?.creationStep !== 0 && response?.creationStep !== 6) {
        history.push(`/dashboard/veicoli/crea?id=${response?._id}`);
        toast.error('Completa le informazioni del veicolo');
        return <>Redirecting...</>;
      }

      setVehicle(response);
      form.setValue('ownerName', response.owner.ragioneSociale);
      form.setValue('plate', response.plate);
      form.setValue('brand', response.brand?._id);
      form.setValue('model', response.model?._id);
      form.setValue('version', response.version?._id);
      form.setValue('registrationDate', new Date().toISOString().split('T')[0]);

      form.setValue('color', response.color);
      form.setValue('internalFeatures', response.internalFeatures);
      form.setValue('optionals', response.optionals);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchVehicle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enableVehicle = async (value, message, fleetOffReason = null) => {
    try {
      if (!vehicle?.rentalLocation && value) {
        toast.error(
          'Il veicolo non ha un punto nolo associato. Impossibile abilitarlo. Vai su Aggiorna > Punto Nolo.',
        );
        return;
      }

      await http({
        method: 'POST',
        url: value
          ? `/vehicles/vehicle/enable/${params.id}`
          : `/vehicles/vehicle/disable/${params.id}`,
        form: {
          declarations: {
            enabledDeclarationMessage: message,
          },
          fleetOffReason,
        },
      });
      toast.success('Veicolo aggiornato');
      fetchVehicle();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName={'pb-4'}>
      <CardsHeader
        title="Dettagli veicolo"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => {
              history.goBack();
            },
          },
          /*{
          btnStyle: 'lightSlateTransparent',
          children: 'Attività',
          to: `/dashboard/veicoli/flotta/${vehicle._id}/attivita`,
          },
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Aggiornamenti',
            to: `/dashboard/veicoli/flotta/${vehicle._id}/aggiornamenti`,
          },*/
          {
            children: 'Modifica',
            to: `/dashboard/veicoli/flotta/${vehicle._id}/aggiorna`,
          },
        ]}
      />

      {vehicle?._id && <ShowVehicle vehicle={vehicle} enableVehicle={enableVehicle} />}
    </Page>
  );
};

export default Vehicle;
