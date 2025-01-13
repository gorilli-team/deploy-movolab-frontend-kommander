import React, { useEffect, useState } from 'react';
import RevenueSharesMonthlyRecapTableItem from './RevenueSharesMonthlyRecapTableItem';
import { http } from '../../utils/Utils';
import toast from 'react-hot-toast';
import Navigation from '../UI/Navigation';

const RevenueSharesMonthlyRecapTable = () => {
  const [from, setFrom] = useState(0);
  const [revenueSharesMonthlyRecap, setRevenueSharesMonthlyRecap] = useState([]);
  const [revenueSharesMonthlyRecapCount, setRevenueSharesMonthlyRecapCount] = useState(0);

  useEffect(() => {
    fetchRevenueShares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRevenueShares = async (skip = 0, limit = 10) => {
    try {
      const response = await http({
        url: `/clientPayments/revenueShareMonthlyRecap?skip=${skip}&limit=${limit}`,
      });
      setRevenueSharesMonthlyRecap(response.revenueSharesMonthlyRecap);
      setRevenueSharesMonthlyRecapCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchRevenueShares(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > revenueSharesMonthlyRecapCount) return;
    fetchRevenueShares(from + 10, 10);
    setFrom(from + 10);
  };

  return (
    <div className="bg-white border-t border-gray-200 overflow-hidden relative">
      <div className="overflow-x-auto h-full">
        {/* Table */}
        <div>
          <table className="w-full table-fixed">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50">
              <tr>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Cliente</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Mese</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Anno</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Pagato</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Stato</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-center">Movo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">
                    Corrispettivo <br /> Totale
                  </div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">
                    Corrispettivo <br /> Cliente
                  </div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">
                    Ultimo <br /> Aggiornamento
                  </div>
                </th>

                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {revenueSharesMonthlyRecap?.map((monthlyRecap, index) => {
                return (
                  <RevenueSharesMonthlyRecapTableItem
                    key={index}
                    monthlyRecap={monthlyRecap}
                    showDetails={true}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={revenueSharesMonthlyRecapCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default RevenueSharesMonthlyRecapTable;
