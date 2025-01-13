import React from 'react';
import Slider from 'rc-slider';
import { useController } from 'react-hook-form';

export const RangeField = ({
    form,
    name,
    label,
    validation,
    step,
    min,
    max,
    formatNumber = v => v,
}) => {
    const { field, fieldState: { error } } = useController({ name, control: form.control, rules: validation });
    const [start, end] = field.value || [];

    return (
        <div>
            {label && (
                <label className="form-text">
                    {label}
                    {validation?.required?.value && <span className="text-red-600 ml-1">*</span>}
                </label>
            )}
            <div className="d-flex justify-content-between lh-1 mt-1 mb-2">
                <span>{start ? formatNumber(start) : '-'}</span>
                <span className="text-end">{end ? formatNumber(end) : '-'}</span>
            </div>
            <div className="slider-container">
                <Slider
                    range
                    name={name}
                    step={step}
                    min={min}
                    max={max}
                    value={field.value}
                    onChange={field.onChange}
                />
            </div>
            {error && (
                <div className="text-red-600 small">
                    {error?.message || 'Invalid input'}
                </div>
            )}
        </div>
    );
}