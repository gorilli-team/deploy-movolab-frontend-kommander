import React, { useEffect, useState } from 'react';
import FaresTableItem from './FaresTableItem';

import toast from 'react-hot-toast';

import { http } from '../../../utils/Utils';
import Navigation from '../../UI/Navigation';

const FaresTable = ({ selectedGroup, rangeId, type, updateFaresCount }) => {
  const [from, setFrom] = useState(0);
  const [fares, setFares] = useState([]);
  const [faresCount, setFaresCount] = useState(0);
  const [pageSize] = useState(15);

  useEffect(() => {
    fetchFares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup, type]);

  const fetchFares = async (skip = 0, limit = pageSize) => {
    try {
      let url =
        selectedGroup !== undefined
          ? `/fares?skip=${skip}&limit=${limit}&group=${selectedGroup}`
          : `/fares?skip=${skip}&limit=${limit}`;

      if (rangeId) {
        url += `&range=${rangeId}`;
      }
      if (type) {
        url += `&type=${type}`;
      }

      const response = await http({
        url: url,
      });
      setFares(response.fares);
      setFaresCount(response.count);
      if (updateFaresCount) updateFaresCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - pageSize < 0) return;
    fetchFares(from - pageSize, pageSize);
    setFrom(from - pageSize);
  };

  const succFunction = () => {
    if (from + pageSize > faresCount) return;
    fetchFares(from + pageSize, pageSize);
    setFrom(from + pageSize);
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
                  <div className="font-semibold text-left">Gruppo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Fascia</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Calcolo prezzo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Tariffa</div>
                  <div className="font-semibold text-left">Base</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Giorni</div>
                  <div className="font-semibold text-left">Extra</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">KM Giorno</div>
                  <div className="font-semibold text-left">Inclusi</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">KM Extra</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Creato il</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {fares?.reverse().map((fare, index) => {
                return <FaresTableItem key={index} fare={fare} />;
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + pageSize}
        length={faresCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default FaresTable;
