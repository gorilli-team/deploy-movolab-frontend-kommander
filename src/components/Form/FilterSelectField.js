import React from 'react';
import Select from 'react-select';

export function FilterSelectField({
  className = '',
  minW = 'min-w-[12rem]',
  options = [],
  emptyOption = null,
  altSelect = false,
  ...props
}) {
  const selectOptions = [...options];
  if (altSelect && emptyOption) {
    selectOptions.push(emptyOption);
  }

  return altSelect || props.isMulti ? (
    <Select
      className={`form-select text-gray-800 rounded-lg !pl-0 p-0 text-sm border-slate-300 bg-white ${minW} ${className}`}
      options={selectOptions}
      styles={{
        control: (base) => ({
          ...base,
          border: 'none',
          minHeight: '0px',
          backgroundColor: 'none',
          boxShadow: 'none',
        }),
        indicatorsContainer: (base) => ({ display: 'none' }),
        valueContainer: (base) => ({ ...base, padding: '0 1.75rem 0 0.75rem' }),
        multiValue: (base) => ({ ...base, borderRadius: '20px' }),
        multiValueLabel: (base) => ({ ...base, padding: '0' }),
        input: (base) => ({ ...base, border: 'none' }),
        menu: (base) => ({ ...base, zIndex: '12' }),
        placeholder: (base) => ({ ...base, margin: '0', color: '#25282c' }),
      }}
      placeholder={emptyOption?.label || ''}
      {...props}
    />
  ) : (
    <select
      className={`form-select text-gray-800 w-48 rounded-lg px-3 pr-7 py-1 text-sm border-slate-300 bg-white ${minW} ${className}`}
      {...props}
    >
      {emptyOption ? (
        <option value={emptyOption.value || ''} {...emptyOption}>
          {emptyOption.label}
        </option>
      ) : (
        ''
      )}
      {options.map((option, i) => (
        <option key={i} {...option}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default FilterSelectField;
