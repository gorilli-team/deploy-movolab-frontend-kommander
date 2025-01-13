import React from 'react';
import { useController, Controller } from 'react-hook-form';
import FormLabel from '../UI/FormLabel';

export function SelectField({
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
  value = '',
  labelColor = 'text-gray-800'
}) {
  //const error = form.formState.errors[name];
  const {
    fieldState: { error: innerError },
  } = useController({ name, control: form.control, rules: validation });

  const error = innerError;

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
            <FormLabel className={labelColor}>
              {label}
              {validation?.required?.value && <span className="text-red-600 ml-1">*</span>}
            </FormLabel>
          )}
          {disabled ? (
            <select
              ref={field.ref}
              name={field.name}
              className={`form-select text-gray-800 w-full rounded border-slate-700 pl-3 pr-8 py-1 ${inputClassName} ${
                error && 'is-invalid'
              } ${disabled ? 'bg-gray-50' : error ? 'bg-red-50' : 'bg-white'}`}
              value={field.value || value}
              disabled
              onBlur={field.onBlur}
              onChange={(e) => {
                field.onChange(e);
                onChange(e);
              }}
              autoFocus={!!autofocus}
            >
              {placeholder && (
                <option value="" hidden>
                  {placeholder}
                </option>
              )}
              {options.map((option, key) => (
                <option key={key} value={option.value}>
                  {option.label || option.value}
                </option>
              ))}
            </select>
          ) : (
            <select
              ref={field.ref}
              name={field.name}
              className={`form-select text-gray-800 w-full rounded pl-3 pr-8 py-1 border-slate-700 ${inputClassName} ${
                error && 'is-invalid'
              } ${disabled ? 'bg-gray-50' : error ? 'bg-red-50' : 'bg-white'}`}
              value={field.value || ''}
              onBlur={field.onBlur}
              onChange={(e) => {
                field.onChange(e);
                onChange(e);
              }}
              autoFocus={!!autofocus}
            >
              {placeholder && (
                <option value="" hidden>
                  {placeholder}
                </option>
              )}
              {options.map((option, key) => (
                <option key={key} value={option.value}>
                  {option.label || option.value}
                </option>
              ))}
            </select>
          )}
          {error && (
            <div className="text-red-600 text-xs font-semibold">
              {error.message || 'Dato non valido'}
            </div>
          )}
        </div>
      )}
    />
  );
}
