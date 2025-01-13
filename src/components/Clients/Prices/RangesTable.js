import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../utils/Utils';
import RangesTableItem from './RangesTableItem';
import Navigation from '../../UI/Navigation';

const RangesTable = ({ role, type, updateRangesCount }) => {
  const [from, setFrom] = useState(0);
  const [ranges, setRanges] = useState([]);
  const [rangesCount, setRangesCount] = useState(0);

  useEffect(() => {
    fetchRanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const fetchRanges = async (skip = 0, limit = 10) => {
    try {
      let response;
      if (role === MOVOLAB_ROLE_ADMIN) {
        response = await http({
          url: `/pricing/range?skip=${skip}&limit=${limit}&type=${type}`,
        });
      } else {
        response = await http({ url: `/pricing/range?skip=${skip}&limit=${limit}` });
      }
      setRanges(response.ranges);
      setRangesCount(response.count);
      updateRangesCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchRanges(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > rangesCount) return;
    fetchRanges(from + 10, 10);
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
                  <div className="font-semibold text-left">Nome</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Descrizione</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Unità Tempo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Da</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">A</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">
                    Tariffe <br /> Associate
                  </div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {ranges?.reverse().map((range, index) => {
                return <RangesTableItem key={index} range={range} />;
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={rangesCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default RangesTable;
