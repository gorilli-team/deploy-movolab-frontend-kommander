import React, { useEffect, useState } from 'react';
import RevenueSharesTableItem from './RevenueSharesTableItem';
import { http } from '../../utils/Utils';
import toast from 'react-hot-toast';
import Navigation from '../UI/Navigation';

const RevenueSharesTable = (props) => {
  const [from, setFrom] = useState(0);
  const [revenueShares, setRevenueShares] = useState([]);
  const [revenueSharesCount, setRevenueSharesCount] = useState(0);

  useEffect(() => {
    fetchRevenueShares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  const fetchRevenueShares = async (skip = 0, limit = 10) => {
    try {
      if (props.revenueShares !== undefined) {
        setRevenueShares(props.revenueShares);
        setRevenueSharesCount(props.revenueShares.length);
      } else {
        const response = await http({
          url: `/clientPayments/revenueShares?skip=${skip}&limit=${limit}`,
        });
        setRevenueShares(response.revenueShares);
        setRevenueSharesCount(response.count);
      }
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
    if (from + 10 > revenueSharesCount) return;
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
                  <div className="font-semibold text-left">Movo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Ricavi Totali</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Ricavi Cliente</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Quota Movolab</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Data</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {revenueShares?.map((revenueShare, index) => {
                return <RevenueSharesTableItem key={index} revenueShare={revenueShare} />;
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={revenueSharesCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default RevenueSharesTable;
