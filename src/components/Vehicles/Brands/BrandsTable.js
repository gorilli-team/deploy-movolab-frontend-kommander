import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import BrandsTableItem from './BrandsTableItem';
import Navigation from '../../UI/Navigation';
import { http } from '../../../utils/Utils';

const BrandsTable = ({ role, clientId }) => {
  const [from, setFrom] = useState(0);
  const [brands, setBrands] = useState([]);
  const [brandsCount, setBrandsCount] = useState(0);

  useEffect(() => {
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBrands = async (skip = 0, limit = 10) => {
    try {
      const response = await http({ url: `/vehicles/brand?skip=${skip}&limit=${limit}` });
      setBrands(response.brands);
      setBrandsCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchBrands(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > brandsCount) return;
    fetchBrands(from + 10, 10);
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
                  <div className="font-semibold text-left">Nome Marca</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Foto</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Data Creazione</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Data Aggiornamento</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {brands.map((brand, index) => {
                return (
                  <BrandsTableItem key={index} brand={brand} role={role} clientId={clientId} />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={brandsCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default BrandsTable;
