import React from 'react';
import { TextField } from '../Form/TextField';
import { useForm } from 'react-hook-form';

const FilterContainer = ({ onSubmit }) => {
  const form = useForm();
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <TextField
        form={form}
        name="query"
        type="string"
        className="mb-0"
        placeholder="..."
        inputClassName="!border-slate-300 rounded-l-lg rounded-r-none"
        buttonRight={
          <button
            type="submit"
            className="rounded-r-lg border-r border-t border-b !border-slate-300 whitespace-nowrap text-sm mb-1 sm:w-auto xs:w-auto enabled:hover:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed sm:mb-0 px-3 py-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 mb-1 mr-1 inline"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            Cerca
          </button>
        }
        inputGroupClassName="flex"
      />
    </form>
  );
};

export default FilterContainer;
