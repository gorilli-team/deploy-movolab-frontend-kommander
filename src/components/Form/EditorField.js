import React from 'react';
import { Controller } from 'react-hook-form';
import ReactQuill from 'react-quill';

const TOOLBARS = {
    full: [
        ['bold', 'italic', 'underline', { 'header': [2, 3, false] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link'],
    ],
    reduced: [
        ['bold', 'italic', 'underline', { header: [4, false] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ],
    simple: [
        [{ header: [4, false] }],
    ],
};

export function EditorField({ form, label, name, className, editorClassName, validation, toolbar = 'full', placeholder }) {
    const error = form.formState.errors[name];
    const showToolbar = !!toolbar;

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
                    <ReactQuill
                        theme="snow"
                        value={field.value}
                        onChange={value => form.setValue(name, value)}
                        modules={{
                            toolbar: showToolbar ? TOOLBARS[toolbar] || toolbar : [],
                        }}
                        formats={showToolbar ? ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'indent', 'link'] : []}
                        readOnly={form.formState.isSubmitting}
                        className={`${editorClassName} ${!showToolbar && 'no-toolbar'}`}
                        placeholder={placeholder}
                    />
                    <input
                        ref={field.ref}
                        type="hidden"
                        name={field.name}
                        className={`form-control ${error ? 'is-invalid' : ''}`}
                        value={field.value || ''}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
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