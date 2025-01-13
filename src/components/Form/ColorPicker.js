import React, { useState } from 'react';
import { TextField } from './TextField';
import { ChromePicker } from 'react-color';
import { MdFormatColorFill } from 'react-icons/md';
import Button from '../UI/buttons/Button';

const ColorPicker = ({ className, ...props }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [curColor, setCurColor] = useState({ hex: props.form.getValues(props.name) || '' });

  return (
    <TextField
      className={`relative flex ${className}`}
      inputClassName="border-r-0 rounded-r-none"
      inputGroupClassName="flex-1"
      showValue={curColor.hex}
      onClick={(e) => {
        e.preventDefault();
        setShowPicker(!showPicker);
      }}
      autocomplete="off"
      {...props}
    >
      <Button
        onClick={(e) => {
          e.preventDefault();
          setShowPicker(!showPicker);
        }}
        btnStyle="unstyled"
        className="bg-white hover:bg-slate-50 active:bg-slate-100 px-2 border-slate-700 border-y border-r !rounded-l-none rounded-r"
      >
        <MdFormatColorFill color={curColor.hex} />
      </Button>
      {showPicker && (
        <ChromePicker
          className="absolute right-0 top-10 z-10"
          color={curColor}
          onChangeComplete={(color) => { props.form.setValue(props.name, color?.hex); setCurColor(color); /*setShowPicker(false);*/ }}
          disableAlpha={true}
        />
      )}
    </TextField>
  );
};

export default ColorPicker;
