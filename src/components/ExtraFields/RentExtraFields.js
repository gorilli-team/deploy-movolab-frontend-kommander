import React from 'react';
import { useForm } from 'react-hook-form';
import { http } from '../../utils/Utils';
import ExtraFields from '../Workflows/ExtraFields';
import ElementLabel from '../UI/ElementLabel';
import WhiteBox from '../../components/UI/WhiteBox';
import { capitalizeString } from '../../utils/Strings';

const RentExtraFields = ({ rent, ...props }) => {
  const form = useForm();

  const extraFields = rent?.workflow?.extraFields || [];
  const values = rent?.extraFields || [];

  const isDisabled =
    rent?.state === 'chiuso' ||
    rent?.state === 'fatturato' ||
    rent?.state === 'incassato' ||
    rent?.state === 'parz incassato' ||
    rent?.state === 'parz fatturato' ||
    rent?.state === 'annullato' ||
    rent?.state === 'stornato';

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

    const updatedRent = {
      extraFields: extra,
    };

    await http({
      method: 'PUT',
      url: `/rents/${rent._id}`,
      form: updatedRent,
    });
  };

  if (extraFields.length === 0) return null;

  return (
    <WhiteBox
      className="mx-0"
      innerClassName="px-6 py-5"
      isCollapsible="true"
      headerChildren={
        <div className="flex items-center gap-2">
          <div className="font-bold text-lg">Dati Extra</div>
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
      }
      {...props}
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ExtraFields
          form={form}
          extraFields={extraFields}
          values={values}
          onSubmit={onSubmit}
          className="mt-0"
          disabled={isDisabled}
        />
      </form>
    </WhiteBox>
  );
};

export default RentExtraFields;
