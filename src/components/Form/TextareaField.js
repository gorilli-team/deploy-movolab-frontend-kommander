import React from 'react';
import { Controller } from 'react-hook-form';
import FormLabel from '../UI/FormLabel';

export function TextareaField({
  form,
  name,
  label,
  validation,
  inputClassName,
  rows,
  cols,
  disabled,
  className,
}) {
  const error = form.formState.errors[name];

  return (
    <Controller
      name={name}
      control={form.control}
      rules={validation}
      render={({ field }) => (
        <div className={className || 'mb-2'}>
          {label && (
            <FormLabel className="form-text">
              {label}
              {validation?.required?.value && <span className="text-red-600 ml-1">*</span>}
            </FormLabel>
          )}
          <textarea
            ref={field.ref}
            name={field.name}
            className={`form-control block p-2.5 w-full text-gray-900 bg-white rounded border ${inputClassName} ${
              disabled ? '!bg-gray-50' : error ? 'bg-red-50' : 'bg-white'
            } ${error && 'is-invalid'}`}
            value={field.value || ''}
            disabled={disabled}
            onBlur={field.onBlur}
            onChange={field.onChange}
            rows={rows}
            cols={cols}
          />
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
