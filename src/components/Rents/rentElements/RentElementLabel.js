import React from 'react';
import ElementLabel from '../../UI/ElementLabel';

const RentElementLabel = ({ rentState, rentCustomerCompany = undefined }) => {
  return (
    <p className="font-semibold text-gray-600 uppercase">
      {rentState === 'aperto' ? (
        <ElementLabel bgColor="bg-green-500">{rentState}</ElementLabel>
      ) : rentState === 'attivo' ? (
        <ElementLabel bgColor="bg-green-600">{rentState}</ElementLabel>
      ) : rentState === 'no show' ? (
        <ElementLabel bgColor="bg-red-600">{rentState}</ElementLabel>
      ) : rentState === 'chiuso' ? (
        <ElementLabel bgColor="bg-yellow-600">{rentState}</ElementLabel>
      ) : rentState === 'fatturato' ? (
        <ElementLabel bgColor="bg-purple-700">{rentState}</ElementLabel>
      ) : rentState === 'parz fatturato' ? (
        <ElementLabel bgColor="bg-purple-500">{rentState}</ElementLabel>
      ) : rentState === 'incassato' ? (
        <ElementLabel bgColor="bg-sky-700">{rentState}</ElementLabel>
      ) : rentState === 'parz incassato' ? (
        <ElementLabel bgColor="bg-sky-500">{rentState}</ElementLabel>
      ) : rentState === 'annullato' ? (
        <ElementLabel bgColor="bg-red-400">{rentState}</ElementLabel>
      ) : rentState === 'stornato' ? (
        <ElementLabel bgColor="bg-purple-600">{rentState}</ElementLabel>
      ) : rentState === 'draft' ? (
        <ElementLabel>BOZZA</ElementLabel>
      ) : (
        <ElementLabel>{rentState}</ElementLabel>
      )}
    </p>
  );
};

export default RentElementLabel;
