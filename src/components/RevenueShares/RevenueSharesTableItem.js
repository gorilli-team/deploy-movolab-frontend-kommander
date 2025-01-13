import React from 'react';
import { Link } from 'react-router-dom';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import Button from '../UI/buttons/Button';
import { convertPrice } from '../../utils/Prices';

const RevenueSharesTableItem = ({ revenueShare, showDetails }) => {
  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-normal">
        <p className="text-left font-semibold text-gray-600 overflow-hidden text-ellipsis">
          {showDetails ? (
            <Link
              to={`/admin/clienti/anagrafica/${revenueShare?.client?._id}`}
              className="text-blue-500 hover:underline"
            >
              {revenueShare?.client?.ragioneSociale}
            </Link>
          ) : (
            <span>{revenueShare?.client?.ragioneSociale}</span>
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-normal">
        <p className="text-left font-semibold text-gray-600 overflow-hidden text-ellipsis">
          {showDetails ? (
            <Link
              to={`/admin/clienti/movimenti/${revenueShare?.rent?._id}`}
              className="text-blue-500 hover:underline"
            >
              {revenueShare.rent?.code}
            </Link>
          ) : (
            <span>{revenueShare.rent?.code}</span>
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-normal">
        <p className="text-left font-semibold text-gray-600 overflow-hidden text-ellipsis">
          {convertPrice(revenueShare.totalAmount)}
        </p>
      </td>
      <td className="pr-4 py-2">
        {convertPrice(revenueShare?.clientAmount?.expectedRevenue)}
        <br />
        <span className="text-xs text-gray-500">
          Saldo: {convertPrice(revenueShare?.clientAmount?.receivedRevenue)}
        </span>
      </td>
      <td className="pr-4 py-2">
        {convertPrice(revenueShare?.movolabAmount?.expectedRevenue)}
        <br />
        <span className="text-xs text-gray-500">
          Saldo: {convertPrice(revenueShare?.movolabAmount?.receivedRevenue)}
        </span>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-normal">
        <DisplayDateTime date={revenueShare.createdAt} displayType={'flat'} />
      </td>
      {showDetails && (
        <td>
          <Button
            to={`/admin/ripartizione-incassi/${revenueShare?._id}`}
            btnStyle="tableItemAction"
          >
            Dettagli &raquo;
          </Button>
        </td>
      )}
    </tr>
  );
};

export default RevenueSharesTableItem;
