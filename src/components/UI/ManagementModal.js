import React from 'react';
import WhiteButton from './buttons/WhiteButton';

const ManagementModal = ({ text, closeModal }) => {
  return (
    <div style={{ height: '450px', width: '600px' }}>
      <div className="justify-center items-center flex fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          <div className="border-2 rounded-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
              <div className="mr-2">
                <h3 className="text-2xl font-semibold">Schermata di gestione</h3>
              </div>
              <div>
                <WhiteButton className="p-1" onClick={closeModal}>
                  x
                </WhiteButton>
              </div>
            </div>
            <div className="flex items-center justify-center h-40 min-h-40">
              <div className="p-6">
                Questa è un'area destinata alla gestione di questa funzionalità.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementModal;
