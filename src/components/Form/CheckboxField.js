import React from 'react';
import { useController } from 'react-hook-form';

export const CheckboxField = ({
  form,
  name,
  type = 'checkbox',
  value,
  label,
  options,
  validation,
  inline = false,
  toggle = false,
  buttons = false,
  children,
  className,
  buttonGroupClassName,
  buttonWrapperClassName,
  buttonClassName,
  autofocus = false,
  disabled = false,
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control: form.control, rules: validation });

  return (
    <div className={className || 'mb-2'}>
      {label && (
        <label className="form-text">
          {label}
          {validation?.required?.value && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      {(type === 'checkbox' || !type) && (
        <div
          className={
            toggle
              ? `form-toggle-container border-bottom ${inline && 'form-toggle-container-inline'}`
              : ''
          }
        >
          {toggle && !inline && <div className="form-check-label flex-grow-1 me-2">{children}</div>}
          <label
            className={
              toggle
                ? `position-relative align-self-stretch d-flex ${
                    inline ? 'align-items-start' : 'align-items-center'
                  }`
                : `cursor-pointer form-check ${inline && 'form-check-inline'}`
            }
          >
            <input
              ref={field.ref}
              name={field.name}
              type="checkbox"
              disabled={disabled}
              className={`
                ${
                  toggle
                    ? 'position-absolute top-0 start-0 end-0 bottom-0 w-100 h-100 opacity-0 cursor-pointer z-2'
                    : 'form-check-input'
                }
                ${disabled ? 'bg-gray-50' : error ? 'bg-red-50' : 'bg-white'}
                ${error && 'is-invalid'}
            `}
              value={value}
              checked={!!field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
              autoFocus={autofocus}
            />
            {toggle && <div className="form-toggle flex-shrink-0" />}
            {(!toggle || inline) && <div className="form-check-label ms-2">{children}</div>}
            {error && (
              <div className="text-red-600 small">{error?.message || 'Valore non valido'}</div>
            )}
          </label>
        </div>
      )}
      {type === 'radio' && (
        <>
          <div
            className={`${buttons && (buttonGroupClassName || 'row g-1')} ${error && 'is-invalid'}`}
          >
            {options.map((option, key) => (
              <label
                key={key}
                className={
                  buttons
                    ? buttonWrapperClassName || 'col'
                    : `form-check ${inline && 'form-check-inline'} cursor-pointer`
                }
              >
                <input
                  ref={field.ref}
                  name={field.name}
                  type="radio"
                  className={buttons ? 'btn-check' : `form-check-input ${error && 'is-invalid'}`}
                  value={option.value}
                  onBlur={field.onBlur}
                  onChange={() => field.onChange(option.value)}
                  checked={field.value === option.value}
                  disabled={option.disabled}
                  autoFocus={key === 0 && autofocus}
                />
                {option.label ? (
                  <div
                    className={
                      buttons
                        ? `btn btn-outline-primary text-dark py-3 px-1 ${buttonClassName} ${
                            error && 'is-invalid'
                          }`
                        : 'form-check-label'
                    }
                  >
                    {option.label || option.value}
                  </div>
                ) : null}
              </label>
            ))}
          </div>
          {error && (
            <div className="text-red-600 small">{error?.message || 'Valore non valido'}</div>
          )}
        </>
      )}
    </div>
  );
};

export default CheckboxField;