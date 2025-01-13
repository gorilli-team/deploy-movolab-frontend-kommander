import React, { useEffect, useState } from 'react';
import DamagesTableItem from './DamagesTableItem';

import toast from 'react-hot-toast';

import { http } from '../../../utils/Utils';
import Navigation from '../../UI/Navigation';

const DamagesTable = ({ newDamages }) => {
  const [from, setFrom] = useState(0);
  const [damages, setDamages] = useState([]);
  const [damagesCount, setDamagesCount] = useState(0);

  useEffect(() => {
    fetchDamages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newDamages]);

  const fetchDamages = async (skip = 0, limit = 10) => {
    try {
      const response = await http({ url: `/pricing/damages?skip=${skip}&limit=${limit}` });
      setDamages(response.damages);
      setDamagesCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchDamages(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > damagesCount) return;
    fetchDamages(from + 10, 10);
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
                  <div className="font-semibold text-left">Gruppo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Parte del</div>
                  <div className="font-semibold text-left">Veicolo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Graffio</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Ammaccatura</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Crepa</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Rottura</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Foro</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Lacerazione</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Altro</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {damages?.reverse().map((damage, index) => {
                return <DamagesTableItem key={index} damage={damage} />;
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={damagesCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default DamagesTable;
