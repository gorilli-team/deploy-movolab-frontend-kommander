import React, { useRef } from 'react';
import { Controller } from 'react-hook-form';
import Datetime from 'react-datetime';
import moment from 'moment';

export function DatetimeField({ form, name, label, format, placeholder, validation, className, inputClassName }) {
    const ref = useRef();
    const error = form.formState.errors[name];
    const disabled = form.formState.isSubmitting;

    const focusInput = () => {
        if (ref) ref.current.focus();
    };
    const setValue = value => {
        form.setValue(name, value, { shouldValidate: form.formState.isSubmitted });
    };

    return (
        <Controller
            name={name}
            control={form.control}
            rules={validation}
            render={({ field }) => (
                <div className={className || 'mb-2'}>
                    {label && (
                        <label className="form-text">
                            {label}
                            {validation?.required?.value && <span className="text-red-600 ml-1">*</span>}
                        </label>
                    )}
                    <Datetime
                        className={error ? 'is-invalid' : ''}
                        value={field.value}
                        onChange={value => setValue(value.toDate())}
                        renderInput={(props, openCalendar) => (
                            <div
                                ref={ref}
                                type="button"
                                className={`form-control d-flex align-items-center ${inputClassName || 'py-3 px-3'}
                                    ${error ? 'is-invalid' : ''}`}
                                onClick={() => !disabled && openCalendar()}
                                tabIndex="0"
                                readOnly={disabled}
                            >
                                <span className="flex-grow-1 text-truncate">
                                    {field.value
                                        ? moment(field.value).format(format)
                                        : <span className="text-muted">{placeholder}</span>
                                    }
                                </span>
                                {field.value && !disabled && (
                                    <span className="material-icons fs-regular ms-1 flex-shrink-0" onClick={() => setValue(undefined)}>
                                        cancel
                                    </span>
                                )}
                            </div>
                        )}
                        closeOnSelect
                        onClose={focusInput}
                    />
                    {error && (
                        <div className="text-red-600 small">
                            {error?.message || 'Invalid input'}
                        </div>
                    )}
                </div>
            )}
        />
    );
}