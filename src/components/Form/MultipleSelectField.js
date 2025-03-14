import React from 'react';
import { Controller } from 'react-hook-form';
import Select from 'react-select';

export function MultipleSelectField({
  form,
  name,
  label,
  validation,
  inputClassName,
  options,
  disabled,
  className,
  placeholder,
  autofocus,
  onChangeFunction,
}) {
  const error = form.formState.errors[name];

  const onChange = (e) => {
    if (onChangeFunction) {
      onChangeFunction(e);
    }
  };
  return (
    <Controller
      name={name}
      control={form.control}
      rules={validation}
      render={({ field }) => (
        <div className={className || 'mb-1'}>
          {label && (
            <label className="block text-sm font-medium mb-1">
              {label}
              {validation?.required?.value && <span className="text-red-600 ml-1">*</span>}
            </label>
          )}
          <Select
            isMulti
            ref={field.ref}
            name={field.name}
            className={`form-select bg-white text-gray-800 w-full p-0 border-none ${inputClassName} ${
              error && 'is-invalid basic-multi-select !bg-red-50'
            }`}
            styles={{
              control: (base) => ({
                ...base,
                borderColor: '#000000',
                minHeight: '0px',
                backgroundColor: 'none',
                '&:hover': {
                  borderColor: '#000000',
                },
              }),
              indicatorsContainer: (base) => ({ display: 'none' }),
              valueContainer: (base) => ({ ...base, padding: '0 1.75rem 0 0.25rem' }),
              multiValue: (base) => ({ ...base, borderRadius: '20px' }),
              multiValueLabel: (base) => ({ ...base, padding: '0' }),
              input: (base) => ({ ...base, border: 'none' }),
              placeholder: (base) => ({ ...base, margin: '0 0.50rem', color: '#25282c' }),
            }}
            value={field.value || ''}
            classNamePrefix="select"
            isDisabled={disabled}
            onBlur={field.onBlur}
            onChange={(e) => {
              field.onChange(e);
              onChange(e);
            }}
            autoFocus={!!autofocus}
            placeholder={placeholder}
            options={options}
          ></Select>
          {error && (
            <div className="text-red-600 text-xs font-semibold">
              {error?.message || 'Invalid input'}
            </div>
          )}
        </div>
      )}
    />
  );
}
