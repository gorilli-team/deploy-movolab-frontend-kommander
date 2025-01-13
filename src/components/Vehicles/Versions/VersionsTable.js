import React from 'react';
import VersionsTableItem from './VersionsTableItem';
import Navigation from '../../UI/Navigation';
import { MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';

const VersionsTable = ({
  elements = [],
  from,
  to,
  count,
  precFunction,
  succFunction,
  role,
  clientId,
}) => {
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
                  <div className="font-semibold text-left"></div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Versione</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Marca</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Modello</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Gruppo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Data Creazione</div>
                </th>
                {role === MOVOLAB_ROLE_ADMIN && (
                  <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Inserito Da</div>
                  </th>
                )}
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {elements?.reverse().map((version, index) => {
                return (
                  <VersionsTableItem
                    key={index}
                    version={version}
                    role={role}
                    clientId={clientId}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from}
        to={to}
        length={count}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default VersionsTable;
