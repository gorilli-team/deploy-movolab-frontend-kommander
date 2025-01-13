import React, { useEffect, useState } from 'react';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../utils/Utils';
import toast from 'react-hot-toast';
import Navigation from '../../UI/Navigation';

import ModelsTableItem from './ModelsTableItem';

const ModelsTable = ({ role, clientId }) => {
  const [from, setFrom] = useState(0);
  const [models, setModels] = useState([]);
  const [modelsCount, setModelsCount] = useState(0);

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchModels = async (skip = 0, limit = 10) => {
    try {
      const response = await http({ url: `/vehicles/model?skip=${skip}&limit=${limit}` });
      setModels(response.models);
      setModelsCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchModels(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > modelsCount) return;
    fetchModels(from + 10, 10);
    setFrom(from + 10);
  };

  return (
    <div className="bg-white border-t border-gray-200 overflow-hidden relative">
      <div className="overflow-x-auto h-full">
        {/* Table */}
        <div>
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50">
              <tr>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Nome Modello</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Nome Marca</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Data Creazione</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Data Aggiornamento</div>
                </th>
                {role === MOVOLAB_ROLE_ADMIN && (
                  <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Inserito Da</div>
                  </th>
                )}
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {models.reverse().map((model, index) => {
                return (
                  <ModelsTableItem key={index} model={model} role={role} clientId={clientId} />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={modelsCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default ModelsTable;
