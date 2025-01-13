import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SelectField } from '../../../Form/SelectField';
import FormLabel from '../../../UI/FormLabel';
import RenderMap from '../../../UI/RenderMap';
import { http } from '../../../../utils/Utils';
import toast from 'react-hot-toast';

const Management = ({ vehicle, fetchVehicle, updateStepDone, isWizard = false }) => {
  const form = useForm();

  const [rentalLocations, setRentalLocations] = useState([]);
  if (vehicle) {
    form.setValue('clientId', vehicle.owner?._id);
    form.setValue('ownerName', vehicle.owner?.ragioneSociale);
    form.setValue('rentalLocation', vehicle.rentalLocation?._id);
  }

  useEffect(() => {
    getRentalLocations();
  }, []);

  const getRentalLocations = async () => {
    try {
      const response = await http({ url: `/clients/rentalLocation` });
      setRentalLocations(
        response.rentalLocations.map((rentalLocation) => {
          return {
            value: rentalLocation._id,
            label: `${rentalLocation.name} - ${rentalLocation.city}`,
          };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (vehicle && vehicle._id !== undefined) {
        await http({
          method: 'PUT',
          url: `/vehicles/vehicle/${vehicle._id}`,
          form: data,
        });
        if (!isWizard) toast.success('Veicolo aggiornato');
        fetchVehicle(vehicle._id);
        if (updateStepDone) updateStepDone(4);
      } else {
        toast.error('Inserisci prima i Dati Veicolo');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };
  return (
    <div className="flex">
      <div className="w-2/5">
        <div className="flex">
          <div className="grid grid-cols-1 gap-2">
            <div className="max-w-sm">
              <div style={{ width: '350px' }}>
                <form id="saveVehicle" onSubmit={form.handleSubmit(onSubmit)}>
                  <fieldset disabled={form.formState.isSubmitting}>
                    <FormLabel>Seleziona punto nolo</FormLabel>

                    <SelectField
                      form={form}
                      name="rentalLocation"
                      placeholder="Punto Nolo"
                      options={rentalLocations}
                      validation={{
                        required: { value: true, message: 'Seleziona il punto nolo del veicolo' },
                      }}
                    />
                  </fieldset>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-3/5">
        {vehicle?.rentalLocation?.lat && vehicle?.rentalLocation?.lng && (
          <RenderMap
            location={{ lat: vehicle?.rentalLocation?.lat, lng: vehicle?.rentalLocation?.lng }}
            markers={[
              {
                lat: vehicle?.rentalLocation?.lat,
                lng: vehicle?.rentalLocation?.lng,
                name: `${vehicle?.plate ? vehicle?.plate?.toUpperCase() : ''} - ${
                  vehicle?.rentalLocation?.name
                }`,
                address: vehicle?.rentalLocation?.address,
              },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default Management;
