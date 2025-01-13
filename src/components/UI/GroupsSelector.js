import React, { useState } from 'react';
import { MultipleSelectField } from '../Form/MultipleSelectField';
import Button from './buttons/Button';
import { FaMinusCircle, FaPlusCircle } from 'react-icons/fa';

const GroupsSelector = ({ groups, form, checkFormIsDirty = () => {}, returnParameter, disabled, ...props }) => {
  const [hasSelectedAll, setHasSelectedAll] = useState(false);
  const [formName] = useState(returnParameter || 'group');

  return (
    <div className="flex gap-1">
      <MultipleSelectField
        className="flex-1"
        name={formName}
        form={form}
        options={groups}
        disabled={disabled}
        onChangeFunction={(e) => {
          setHasSelectedAll(form.getValues(formName)?.length > 0);
          checkFormIsDirty();
        }}
        placeholder="Gruppo"
        {...props}
      />

      {!disabled &&
        (hasSelectedAll ? (
          <Button
            btnStyle="inFormStyle"
            type="button"
            onClick={(e) => {
              form.setValue(formName, []);
              setHasSelectedAll(false);
              checkFormIsDirty();
            }}
          >
            <span className="hidden md:inline">Deseleziona tutti</span>
            <FaMinusCircle className="md:hidden" />
          </Button>
        ) : (
          <Button
            btnStyle="inFormStyle"
            type="button"
            onClick={(e) => {
              form.setValue(formName, groups);
              setHasSelectedAll(true);
              checkFormIsDirty();
            }}
          >
            <span className="hidden md:inline">Seleziona tutti</span>
            <FaPlusCircle className="md:hidden" />
          </Button>
        ))}
    </div>
  );
};

export default GroupsSelector;
