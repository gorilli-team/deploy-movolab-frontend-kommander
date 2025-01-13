import React from 'react';
import Button from './Button';

const GrayButton = ({ ...props }) => {
  props.btnStyle = 'gray';

  return (
    <Button { ...props }></Button>
  )
};

export default GrayButton;
