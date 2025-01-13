import React, { useEffect, useState } from 'react';
import PartnerCodesTableItem from './PartnerCodesTableItem';
import { http } from '../../utils/Utils';
import toast from 'react-hot-toast';
import Navigation from '../UI/Navigation';

const PacksTable = ({ elements = [] }) => {
  const [from, setFrom] = useState(0);
  const [partnerCodes, setPartnerCodes] = useState([]);
  const [partnerCodesCount, setPartnerCodesCount] = useState(0);

  useEffect(() => {
    fetchPartnerCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPartnerCodes = async (skip = 0, limit = 10) => {
    try {
      const response = await http({ url: `/partnerCode?skip=${skip}&limit=${limit}` });
      setPartnerCodes(response.partnerCodes);
      setPartnerCodesCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchPartnerCodes(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > partnerCodesCount) return;
    fetchPartnerCodes(from + 10, 10);
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
                  <div className="font-semibold text-left">Codice</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Agente</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Utilizzi Massimi</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Utilizzi Totali</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Partner</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Data di Creazione</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {partnerCodes?.map((partnerCode, index) => {
                return <PartnerCodesTableItem key={index} partnerCode={partnerCode} />;
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={partnerCodesCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default PacksTable;
