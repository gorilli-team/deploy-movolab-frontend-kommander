import React from 'react';
import { useForm } from 'react-hook-form';
import { http } from '../../utils/Utils';
import { capitalizeString } from '../../utils/Strings';
import ExtraFields from '../Workflows/ExtraFields';
import ElementLabel from '../UI/ElementLabel';
import WhiteBox from '../UI/WhiteBox';

const ReservationExtraFields = ({ reservation, ...props }) => {
  const form = useForm();

  const extraFields = reservation?.workflow?.extraFields || [];
  const values = reservation?.extraFields || [];

  const onSubmit = async (data) => {
    const extra = data.extraFields.map((field, index) => {
      const key = Object.keys(field)[0];
      const value = Object.values(field)[0];
      return {
        id: extraFields[index]._id,
        name: key,
        value: value,
      };
    });

    const updatedReservation = {
      extraFields: extra,
    };

    await http({
      method: 'PUT',
      url: `/reservations/${reservation._id}`,
      form: updatedReservation,
    });
  };

  if (extraFields.length === 0) return null;

  return (
    <WhiteBox
      className="mx-0"
      innerClassName="px-6 py-5"
      isCollapsible="true"
      headerChildren={
        <div className="font-bold text-lg">
          <div className="flex">
            <div className="mr-2">Dati Extra</div>

            {extraFields.map((extra, index) => {
              return (
                <div key={index} className="mr-1">
                  <ElementLabel bgColor={`${extra.requiredField ? 'bg-gray-600' : 'bg-gray-400'}`}>
                    {capitalizeString(extra.field)}
                  </ElementLabel>
                </div>
              );
            })}
          </div>
        </div>
      }
      {...props}
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ExtraFields
          form={form}
          extraFields={extraFields}
          values={values}
          onSubmit={onSubmit}
          disabled={reservation?.state === 'chiuso'}
          className="mt-0"
        />
      </form>
    </WhiteBox>
  );
};

export default ReservationExtraFields;
