import React from 'react';
import { useController } from 'react-hook-form';

export const HiddenField = ({
  form,
  name,
  value,
  validation,
}) => {
  const {
    field,
  } = useController({ name, control: form.control, rules: validation });

  return (
    <input
      ref={field.ref}
      name={field.name}
      type="hidden"
      value={value}
      onChange={field.onChange}
    />
  );
};
