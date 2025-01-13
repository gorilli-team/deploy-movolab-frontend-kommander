import React, { useEffect, useState } from 'react';
import PriceListsTableItem from './PriceListsTableItem';
import { http } from '../../../utils/Utils';
import toast from 'react-hot-toast';
import Navigation from '../../UI/Navigation';

const PriceListsTable = ({ licenseType, setCount }) => {
  const [from, setFrom] = useState(0);
  const [priceLists, setPriceLists] = useState([]);
  const [priceListsCount, setPriceListsCount] = useState(0);

  useEffect(() => {
    fetchPriceLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licenseType]);

  const fetchPriceLists = async (skip = 0, limit = 10) => {
    try {
      if (licenseType) {
        const response = await http({
          url: `/pricing/priceLists?skip=${skip}&limit=${limit}&licenseType=${licenseType}`,
        });
        setPriceLists(response.priceLists);
        setPriceListsCount(response.count);
        setCount(response.count);
        return;
      } else {
        const response = await http({ url: `/pricing/priceLists?skip=${skip}&limit=${limit}` });
        setPriceLists(response.priceLists);
        setPriceListsCount(response.count);
        setCount(response.count);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchPriceLists(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > priceListsCount) return;
    fetchPriceLists(from + 10, 10);
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
                  <div className="font-semibold text-left">Cliente</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Nome</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Descrizione</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Data Creazione</div>
                </th>

                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Stato</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {priceLists?.map((priceList, index) => {
                return <PriceListsTableItem key={index} priceList={priceList} />;
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={priceListsCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default PriceListsTable;
