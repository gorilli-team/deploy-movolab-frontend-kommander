import React, { useEffect, useState } from 'react';
import ExtrasTableItem from './ExtrasTableItem';
import { http } from '../../../utils/Utils';
import toast from 'react-hot-toast';
import Navigation from '../../UI/Navigation';

const ExtrasTable = ({ elements = [] }) => {
  const [from, setFrom] = useState(0);
  const [extras, setExtras] = useState([]);
  const [extrasCount, setExtrasCount] = useState(0);

  useEffect(() => {
    fetchExtras(0, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchExtras = async (skip = 0, limit = 10) => {
    try {
      const response = await http({ url: `/pricing/extras?skip=${skip}&limit=${limit}` });
      setExtras(response.extras);
      setExtrasCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchExtras(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > extrasCount) return;
    fetchExtras(from + 10, 10);
    setFrom(from + 10);
  };

  return (
    <div className="bg-white border-t border-gray-200 overflow-hidden relative">
      <div className="overflow-y-auto h-full">
        <div>
          <table className="table-auto w-full">
            <thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50">
              <tr>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Tipo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Nome</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Gruppi</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Applicabilità</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Costo base</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Calcolo costo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Fatturazione</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">IVA</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Data Creazione</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {extras?.reverse().map((extra, index) => {
                return <ExtrasTableItem key={index} extra={extra} />;
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={extrasCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default ExtrasTable;
