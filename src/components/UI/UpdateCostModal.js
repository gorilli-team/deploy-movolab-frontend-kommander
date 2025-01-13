import React from 'react';
import { useForm } from 'react-hook-form';

import { TextField } from '../Form/TextField';
import FormLabel from './FormLabel';
import GrayButton from './buttons/GrayButton';
import WhiteButton from './buttons/WhiteButton';
import LightGrayButton from './buttons/LightGrayButton';

const UpdateCostModal = ({ type, costAmount, updateCustomCost, closeModal }) => {
  const form = useForm();

  form.setValue('cost', costAmount?.toFixed(2) || 0);

  const mapType = (type) => {
    switch (type) {
      case 'fuel':
        return 'Carburante';
      case 'km':
        return 'Km';
      case 'damages':
        return 'Danni';
      case 'kaskoFranchise':
        return 'Kasko';
      case 'rcaFranchise':
        return 'RCA';
      case 'ifFranchise':
        return 'Furto';
      default:
        return 'Carburante';
    }
  };

  const updateCost = async (value) => {
    updateCustomCost(type, value);
    closeModal();
  };

  return (
    <div style={{ height: '450px', width: '600px' }}>
      <div className="justify-center items-center flex fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          <div className="border-2 rounded-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
              <div className="mr-2">
                <h3 className="text-lg font-semibold mt-2">Aggiorna costo {mapType(type)}</h3>
              </div>
              <div>
                <WhiteButton className="p-1" onClick={closeModal}>
                  x
                </WhiteButton>
              </div>
            </div>
            <div className="relative p-4 flex-auto">
              {type === 'rcaFranchise' && (
                <div className="text-xs mb-4 text-gray-600">
                  <p>Al costo inserito verrà eventualmente applicato lo sconto SuperRCA</p>
                </div>
              )}
              {type === 'ifFranchise' && (
                <div className="text-xs mb-4 text-gray-600">
                  <p>Al costo inserito verrà eventualmente applicato lo sconto SuperRCA</p>
                </div>
              )}
              <form onSubmit={form.handleSubmit(updateCost)}>
                <fieldset disabled={form.formState.isSubmitting} className="w-full">
                  <>
                    <div className="flex">
                      <div className="w-full">
                        <FormLabel>Costo da addebitare</FormLabel>
                        <TextField form={form} name="cost" placeholder="Costo" />
                      </div>
                    </div>
                    <div className="flex flex-wrap -mx-3 mt-2 ">
                      <div className="px-3">
                        <LightGrayButton
                          onClick={(e) => {
                            e.preventDefault();
                            updateCost(0);
                          }}
                        >
                          Azzera
                        </LightGrayButton>
                      </div>
                      <div className="px-3">
                        <GrayButton
                          onClick={(e) => {
                            e.preventDefault();
                            updateCost(form.getValues('cost'));
                          }}
                        >
                          Aggiorna
                        </GrayButton>
                      </div>
                    </div>
                  </>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateCostModal;
