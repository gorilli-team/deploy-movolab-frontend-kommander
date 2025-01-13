import formatNumber from 'format-number';
import React, { useEffect, useRef, useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import FormLabel from '../UI/FormLabel';

let incrementalId = 0;

const InputGroupWrapper = ({ children, iconRight, buttonRight, inputGroupClassName }) =>
  buttonRight ? (
    <div className={`input-group ${inputGroupClassName}`}>{children}</div>
  ) : iconRight ? (
    <div className={`position-relative ${inputGroupClassName}`}>{children}</div>
  ) : (
    children
  );

export function TextField({
  form,
  name,
  type = 'text',
  label,
  labelColor,
  placeholder,
  validation,
  autofocus,
  className,
  inputGroupClassName,
  inputClassName,
  inputStyle,
  iconRight,
  buttonRight,
  style,
  readonly,
  inputRef,
  onClick,
  onKeyPress,
  onBlur,
  onChangeFunction,
  error: outerError,
  thousandsSeparator = '.',
  decimalsSeparator = ',',
  disabled,
  bgColor,
  startValue,
  showValue,
  autocomplete,
  min = undefined,
  max = undefined,
  children = null,
  ...props
}) {
  const [id] = useState(++incrementalId);
  const fallbackForm = useForm();
  // use field without form
  name = name || `field_${id}`;
  form = form || fallbackForm;
  inputRef = inputRef || useRef(); // eslint-disable-line

  const onChange = (e) => {
    if (onChangeFunction) {
      onChangeFunction(e);
    }
  };

  const {
    field,
    fieldState: { error: innerError },
  } = useController({ name, control: form.control, rules: validation });
  const iconRightRef = useRef(null);
  const [paddingRight, setPaddingRight] = useState();

  const error = innerError || outerError;
  const formatter =
    type === 'number'
      ? (value) => formatNumber({ integerSeparator: '', decimal: decimalsSeparator })(value)
      : (value) => value;
  const parser =
    type === 'number'
      ? (value) =>
          parseFloat(
            `${value}`
              .trim()
              .replace(new RegExp(`[${thousandsSeparator}]`, 'g'), '')
              .replace(decimalsSeparator, '.'),
          )
      : (value) => value;
  const [inputValue, setInputValue] = useState(formatter(field.value || ''));

  useEffect(() => {
    if (iconRight) {
      setPaddingRight(
        iconRightRef.current
          ? iconRightRef.current.offsetWidth +
              parseInt(getComputedStyle(iconRightRef.current).marginRight)
          : undefined,
      );
    }
  }, [iconRight, iconRightRef, error]);

  return (
    <div className={className || 'mb-1'} style={style}>
      {label && (
        <FormLabel>
          {label}
          {validation?.required?.value && <span className="text-red-600 ml-1">*</span>}
        </FormLabel>
      )}
      <InputGroupWrapper
        iconRight={iconRight}
        buttonRight={buttonRight}
        // inputGroupClassName={inputGroupClassName}
      >
        <div className={placeholder && inputGroupClassName}>
          <input
            ref={(node) => {
              field.ref(node);
              inputRef.current = node;
            }}
            name={field.name}
            type={type === 'number' ? 'number' : type}
            min={min}
            max={max}
            disabled={disabled}
            className={`form-input text-gray-800 w-full border-slate-700 rounded px-3 py-1 ${inputClassName} ${
              disabled ? 'bg-gray-50 cursor-not-allowed' : error ? 'bg-red-50' : 'bg-white'
            } ${bgColor && bgColor} ${error ? 'is-invalid' : ''}`}
            placeholder={placeholder}
            value={showValue || inputValue || formatter(field.value || '') || startValue}
            onBlur={(e) => {
              const originalValue = e.currentTarget.value;
              const value = originalValue ? parser(originalValue) : null;
              field.onBlur(value);
              setInputValue(formatter(value));
              if (onBlur) onBlur(value);
            }}
            onChange={(e) => {
              const originalValue = e.currentTarget.value;
              const value = originalValue ? parser(originalValue) : null;
              field.onChange(value);
              setInputValue(originalValue);
              onChange(e);
            }}
            onClick={onClick}
            onKeyPress={onKeyPress}
            autoFocus={!!autofocus}
            style={{ ...inputStyle, paddingRight }}
            readOnly={readonly}
            autoComplete={autocomplete}
            {...props}
          />
          {buttonRight}
          {iconRight && (
            <div
              ref={iconRightRef}
              className={`icon-right position-absolute top-0 bottom-0 end-0 h-100 d-flex align-items-center ps-2 pe-3
                                ${error && 'me-4'}`}
            >
              {iconRight}
            </div>
          )}
          {error && (
            <div className="text-red-600 text-xs font-semibold">
              {error.message || 'Dato non valido'}
            </div>
          )}
        </div>
      </InputGroupWrapper>

      {children}
    </div>
  );
}
