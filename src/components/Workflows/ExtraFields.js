import React from 'react';
import FormLabel from '../UI/FormLabel';
import { TextField as TextInternal } from '../Form/TextField';
import { capitalizeString } from '../../utils/Strings';

const ExtraFields = ({ form, extraFields, values, className, onSubmit, disabled }) => {
  const mapDataTypes = (dataType) => {
    switch (dataType) {
      case 'string':
        return 'Testo';
      case 'number':
        return 'Numero';
      case 'date':
        return 'Data';
      case 'boolean':
        return 'SI/NO';
      default:
        return '';
    }
  };

  const getExtraFieldValue = (field) => {
    const value = values?.find((v) => v?.id === field._id)?.value;
    return value;
  };

  return (
    <div className={className || 'mt-2'}>
      <fieldset disabled={form.formState.isSubmitting}>
        <div className="flex flex-wrap gap-4">
          {extraFields.map((field, index) => {
            form.register(`extraFields[${index}].${field.field}`, {
              value: getExtraFieldValue(field),
            });

            return (
              <div key={index} className="w-60 min-w-60">
                <FormLabel>
                  {capitalizeString(field.field)}
                  {field.requiredField
                    ? ` (${mapDataTypes(field.dataType)} - Richiesto)`
                    : ` (${mapDataTypes(field.dataType)})`}
                </FormLabel>
                <TextInternal
                  className="pr-2"
                  form={form}
                  name={`extraFields[${index}].${field.field}`}
                  onBlur={form.handleSubmit(onSubmit)}
                  type={field.dataType}
                  disabled={disabled}
                  placeholder={capitalizeString(field.field)}
                  validation={{
                    required: {
                      value: field.requiredField,
                      message: `${field.field} è obbligatorio`,
                    },
                  }}
                />
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
};

export default ExtraFields;
