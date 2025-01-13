import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useController, useForm } from 'react-hook-form';

export const FileField = forwardRef(({
    form,
    name,
    label,
    placeholder,
    placeholderOpacity,
    validation,
    autofocus,
    className,
    style,
    progress,
    accept,
    onChange,
    iconRight,
    inputClassName,
    size = 'md',
}, ref) => {
    form = form || useForm();
    const inputRef = useRef();
    const { field, fieldState: { error } } = useController({ name, control: form.control, rules: validation });
    const clearIconRef = useRef(null);
    const iconRightRef = useRef(null);
    const [paddingRight, setPaddingRight] = useState();
    const textValue = field.value?.name || field.value;

    const onInputChange = (e) => {
        const input = e.target;
        const files = input.files || [];
        const file = files[0];
        field.onChange(file);
        if (onChange) onChange(file);
    };
    const clearInput = () => {
        form.setValue(name, undefined);
        inputRef.current.value = '';
    };

    useImperativeHandle(ref, () => ({
        clearInput,
    }));

    useEffect(() => {
        if (iconRight || textValue) {
            const ref = iconRightRef.current || clearIconRef.current;
            setPaddingRight(ref ? ref.offsetWidth + parseInt(getComputedStyle(ref).marginRight) : undefined);
        }
    }, [iconRight, iconRightRef, textValue, clearIconRef, error]);

    // reset field from outside
    useEffect(() => {
        const inputValue = typeof inputRef?.current?.value !== 'undefined'
            ? `${inputRef.current.value}`.replace(/^.+(\\|\/)/, '')
            : undefined;
        if (textValue !== inputValue) {
            form.setValue(name, textValue);
        }
    }, [inputRef?.current?.value]);

    return (
        <div className={`position-relative ${className}`} style={style}>
            {label && (
                <label className="d-block text-label small mb-1">
                    {label}
                    {validation?.required && <span className="text-red-600 ml-1">*</span>}
                </label>
            )}
            <div className="form-floating">
                <input
                    ref={inputRef}
                    type="file"
                    className="btn-check position-absolute top-0 bottom-0 start-0 end-0 cursor-pointer w-100 h-100 z-index-1"
                    onChange={onInputChange}
                    onBlur={field.onBlur}
                    autoFocus={!!autofocus}
                    accept={accept}
                    disabled={progress > 0}
                    style={{ fontSize: 0 }}
                />
                <div
                    className={`form-control d-flex align-items-center oveflow-hidden ${inputClassName}
                        ${size === 'sm' ? 'form-control-sm' : ''} ${error ? 'is-invalid' : ''}`}
                    style={{ paddingRight }}
                >
                    <div className="text-truncate">{textValue}</div>
                </div>
                {iconRight && (
                    <div
                        ref={iconRightRef}
                        className={`icon-right position-absolute top-0 bottom-0 end-0 h-100 d-flex align-items-center ps-2 pt-0
                            ${size === 'sm' ? 'pe-2' : 'pe-3'} ${error && 'me-4'}`}
                    >
                        {iconRight}
                    </div>
                )}
                {!iconRight && textValue && (
                    <div
                        ref={clearIconRef}
                        className={`icon-right position-absolute top-0 bottom-0 end-0 h-100 d-flex align-items-center ms-2 z-index-2
                            cursor-pointer ${size === 'sm' ? 'me-2' : 'me-3'} ${error && 'me-4'}`}
                        onClick={clearInput}
                    >
                        <span className="material-icons">close</span>
                    </div>
                )}
                <label
                    className={`text-truncate mw-100 ${!textValue ? 'placeholder-shown' : ''}`}
                    style={{ paddingRight, opacity: placeholderOpacity }}
                >
                    {(label || placeholder)}
                    {validation?.required?.value && <span className="text-red-600 ml-1">*</span>}
                </label>
                {progress && (
                    <div
                        className="progress-bar rounded position-absolute start-0 bottom-0"
                        style={{ height: 3, width: progress + '%' }}
                    />
                )}
                {error && (
                    <div className="text-red-600 small">
                        {error?.message || 'Invalid input'}
                    </div>
                )}
            </div>
        </div>
    );
});