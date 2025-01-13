import React, { useEffect, useState } from 'react';
import PacksTableItem from './PacksTableItem';
import { http } from '../../utils/Utils';
import toast from 'react-hot-toast';
import Navigation from '../UI/Navigation';

const PacksTable = ({ elements = [] }) => {
  const [from, setFrom] = useState(0);
  const [packs, setPacks] = useState([]);
  const [packsCount, setPacksCount] = useState(0);

  useEffect(() => {
    fetchPacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPacks = async (skip = 0, limit = 10) => {
    try {
      const response = await http({ url: `/clientPayments/packs?skip=${skip}&limit=${limit}` });
      setPacks(response.packs);
      setPacksCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchPacks(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > packsCount) return;
    fetchPacks(from + 10, 10);
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
                  <div className="font-semibold text-left">Stato</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Rinnovo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">
                    Visibile <br /> Onboarding
                  </div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Periodicità</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">
                    Tariffa <br /> Base
                  </div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">
                    Clienti <br /> Associati
                  </div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {packs?.map((pack, index) => {
                return <PacksTableItem key={index} pack={pack} />;
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={packsCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default PacksTable;
