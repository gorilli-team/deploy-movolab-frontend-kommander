import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import FranchisesTableItem from './FranchisesTableItem';
import Navigation from '../../UI/Navigation';
import { http } from '../../../utils/Utils';

const FranchisesTable = () => {
  const [from, setFrom] = useState(0);
  const [franchises, setFranchises] = useState([]);
  const [franchisesCount, setFranchisesCount] = useState(0);

  useEffect(() => {
    fetchFranchises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFranchises = async (skip = 0, limit = 10) => {
    try {
      const response = await http({ url: `/vehicles/franchise?skip=${skip}&limit=${limit}` });
      setFranchises(response.franchises);
      setFranchisesCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchFranchises(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > franchisesCount) return;
    fetchFranchises(from + 10, 10);
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
                  <div className="font-semibold text-left">Licenza</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Tipo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Descrizione</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Tipo Calcolo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Valore</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Percentuale</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Data Creazione</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {franchises?.reverse().map((franchise, index) => {
                return <FranchisesTableItem key={index} franchise={franchise} />;
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={franchisesCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default FranchisesTable;
