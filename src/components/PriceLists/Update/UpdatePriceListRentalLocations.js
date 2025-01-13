import React, { useEffect, useState } from 'react';
import { http } from '../../../utils/Utils';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { SelectField } from '../../Form/SelectField';
import GrayButton from '../../UI/buttons/GrayButton';
import LightGrayButton from '../../UI/buttons/LightGrayButton';
import WhiteButton from '../../UI/buttons/WhiteButton';

const UpdatePriceListRentalLocations = (props) => {
  const [rentalLocationsAvailable, setRentalLocationsAvailable] = useState([]);
  const [priceList, setPriceList] = useState({ rentalLocations: [] });
  const form = useForm();
  const params = useParams();

  useEffect(() => {
    fetchPriceList();
    fetchRentalLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPriceList = async () => {
    try {
      const response = await http({ url: `/pricing/priceLists/${params.id}?mode=flat` });
      setPriceList(response);
      form.setValue('rentalLocations', response.rentalLocations);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchRentalLocations = async () => {
    try {
      const response = await http({ url: '/clients/rentalLocation' });
      setRentalLocationsAvailable(
        response.rentalLocations.map((rentalLocation) => {
          return {
            value: rentalLocation._id,
            label: `${rentalLocation.name} - ${rentalLocation.address}`,
          };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onSubmit = async (input) => {
    const data = {
      rentalLocations: input.rentalLocations.filter((rentalLocation) => rentalLocation !== ''),
    };

    try {
      await http({
        method: 'PUT',
        url: `/pricing/priceLists/${params.id}`,
        form: data,
      });
      toast.success('Listino aggiornato');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <div className="mb-4">
      <div className="text-xl font-bold">Punti Nolo</div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={form.formState.isSubmitting}>
          {rentalLocationsAvailable.length > 0 &&
            priceList?.rentalLocations.map((rentalLocation, index) => {
              return (
                <div className="flex" key={index}>
                  <div style={{ width: '400px' }} key={index}>
                    <SelectField
                      form={form}
                      name={`rentalLocations[${index}]`}
                      placeholder="Seleziona un punto nolo"
                      options={rentalLocationsAvailable}
                    />
                  </div>
                  <div className="ml-2">
                    <LightGrayButton
                      type="button"
                      onClick={() => {
                        const updatedPriceList = {
                          ...priceList,
                          rentalLocations: priceList.rentalLocations.splice(1, index),
                        };
                        setPriceList(updatedPriceList);
                        form.setValue('rentalLocations', updatedPriceList.rentalLocations);
                      }}
                    >
                      Rimuovi
                    </LightGrayButton>
                  </div>
                </div>
              );
            })}

          <div>
            <WhiteButton
              type="button"
              onClick={() => {
                const updatedPriceList = {
                  ...priceList,
                  rentalLocations: [...priceList.rentalLocations, ''],
                };
                setPriceList(updatedPriceList);
                form.setValue('rentalLocations', updatedPriceList.rentalLocations);
              }}
            >
              Aggiungi uno
            </WhiteButton>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-wrap -mx-3 mt-6 ">
              <div className="w-60 px-3">
                <GrayButton>Salva</GrayButton>
              </div>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default UpdatePriceListRentalLocations;
