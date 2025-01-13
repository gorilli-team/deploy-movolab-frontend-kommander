import React, { useEffect, useState } from 'react';
import { Controller, useController, useForm } from 'react-hook-form';

const INPUT_NAME_PREFIX = 'input_';

export function CheckboxArrayField({
    form,
    name,
    label,
    options,
    validation,
    className,
    autofocus = false,
    buttons = false,
    buttonsContainerClassName,
    buttonWrapperClassName,
    buttonClassName,
    groupButtonFn,
    customEntries,
}) {
    const { field, fieldState: { error } } = useController({ name, control: form.control, rules: validation });
    const innerForm = useForm({
        defaultValues: options.reduce((formValues, option) => {
            const checked = (field.value || []).indexOf(option.value) >= 0;
            formValues[INPUT_NAME_PREFIX + option.value] = checked;
            return formValues;
        }, {}),
    });
    const innerFormValues = innerForm.watch();
    const [prevInnerFormValues, setPrevInnerFormValues] = useState(innerFormValues);
    const jsonInnerFormValues = JSON.stringify(innerFormValues);
    const findOrigValue = value => {
        const strValue = `${value}`.replace(INPUT_NAME_PREFIX, '');
        const origValue = options.filter(option => `${option.value}` === strValue)[0].value;
        return origValue;
    };

    // on outside form change
    useEffect(() => {
        const values = Object.keys(innerFormValues).reduce((values, value) => {
            if (innerFormValues[value] === true) values.push(findOrigValue(value));
            return values;
        }, []);
        if (JSON.stringify(values) !== JSON.stringify(field.value)) {
            options.forEach(option => {
                const name = INPUT_NAME_PREFIX + option.value;
                const value = (field.value || []).indexOf(option.value) >= 0;
                const formValue = innerFormValues[name];
                if (!value && formValue || value && !formValue) {
                    innerForm.setValue(name, value);
                }
            });
        }
    }, [field.value]);

    // on inner form change
    useEffect(() => {
        if (jsonInnerFormValues !== JSON.stringify(prevInnerFormValues)) {
            setPrevInnerFormValues(innerFormValues);
            const values = Object.keys(innerFormValues).reduce((values, value) => {
                if (innerFormValues[value] === true) values.push(findOrigValue(value));
                return values;
            }, []);
            if (JSON.stringify(values) !== JSON.stringify(field.value)) {
                form.setValue(name, values, { shouldDirty: true, shouldValidate: form.formState.submitCount > 0 });
            }
        }
    }, [jsonInnerFormValues]);

    return (
        <div className={className}>
            {label && (
                <label className="form-text">
                    {label}
                    {validation?.required?.value && <span className="text-red-600 ml-1">*</span>}
                </label>
            )}
            <div className={buttons ? `row ${buttonsContainerClassName || 'g-2'}` : ''}>
                {options.map((option, key) => (
                    <React.Fragment key={option.value}>
                        {option.group && (key === 0 || options[key - 1].group !== option.group) && (
                            <div className="small text-secondary col">
                                {option.group} {groupButtonFn && groupButtonFn(option)}
                            </div>
                        )}
                        <Controller
                            innerForm={innerForm}
                            name={INPUT_NAME_PREFIX + option.value}
                            control={innerForm.control}
                            render={({ field }) => (
                                <label className={buttons ? (buttonWrapperClassName || 'col') : 'form-check form-check-inline cursor-pointer'}>
                                    <input
                                        ref={field.ref}
                                        name={field.name}
                                        type="checkbox"
                                        value={`${option.value}`}
                                        checked={!!field.value}
                                        onBlur={field.onBlur}
                                        onChange={field.onChange}
                                        autoFocus={key === 0 && autofocus}
                                        className={buttons ? 'btn-check' : `form-check-input ${error && 'is-invalid'}`}
                                    />
                                    <div className={buttons
                                        ? `btn ${buttonClassName || 'py-3 px-1'} ${error && 'is-invalid'}`
                                        : 'form-check-label'
                                    }>
                                        {option.label || option.value}
                                    </div>
                                </label>
                            )}
                        />
                    </React.Fragment>
                ))}
                {customEntries}
            </div>
        </div>
    );
}
