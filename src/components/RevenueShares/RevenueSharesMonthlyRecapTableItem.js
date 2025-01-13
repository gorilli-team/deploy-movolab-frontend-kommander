import React from 'react';
import { Link } from 'react-router-dom';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import Button from '../UI/buttons/Button';
import ElementLabel from '../UI/ElementLabel';
import { convertPrice } from '../../utils/Prices';
import { getMonthName } from '../../utils/Dates';

const RevenueSharesMonthlyRecapTableItem = ({
  monthlyRecap,
  isClient = false,
  expandFunction,
  showDetails,
}) => {
  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-normal">
        <p className="text-left font-semibold text-gray-600 overflow-hidden text-ellipsis">
          {showDetails ? (
            <Link
              to={`/admin/clienti/anagrafica/${monthlyRecap?.client?._id}`}
              className="text-blue-500 hover:underline"
            >
              {monthlyRecap?.client?.ragioneSociale}
            </Link>
          ) : (
            <span>{monthlyRecap?.client?.ragioneSociale}</span>
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-normal">
        <p className="text-left font-semibold text-gray-600 overflow-hidden text-ellipsis">
          {getMonthName(monthlyRecap.month)}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-normal">
        <p className="text-left font-semibold text-gray-600 overflow-hidden text-ellipsis">
          {monthlyRecap.year}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-normal">
        <div>
          {monthlyRecap?.paid ? (
            <ElementLabel bgColor="bg-green-500">Pagato</ElementLabel>
          ) : (
            <ElementLabel bgColor="bg-red-500">Non Pagato</ElementLabel>
          )}{' '}
        </div>
      </td>
      <td className="first:pl-5 w-60 last:pr-5 py-3 whitespace-normal">
        <div className="pr-5">
          {monthlyRecap?.status === 'open' ? (
            <ElementLabel bgColor="bg-yellow-600">In Elaborazione...</ElementLabel>
          ) : monthlyRecap?.status === 'invoiced' ? (
            <ElementLabel bgColor="bg-green-500">Fatturato</ElementLabel>
          ) : monthlyRecap?.status === 'closed' ? (
            <ElementLabel bgColor="bg-blue-500">Chiuso</ElementLabel>
          ) : (
            <ElementLabel bgColor="bg-gray-500">{monthlyRecap?.status}</ElementLabel>
          )}
        </div>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-normal">
        <p className="text-center font-semibold text-gray-600 overflow-hidden">
          {monthlyRecap.revenueShares?.length}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-normal">
        <p className="text-left font-semibold text-gray-600 overflow-hidden text-ellipsis">
          {monthlyRecap.totalMovolab ? convertPrice(monthlyRecap.totalAmount) : 'N/D'}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-normal">
        <p className="text-left font-semibold text-gray-600 overflow-hidden text-ellipsis">
          {monthlyRecap.totalMovolab
            ? convertPrice(monthlyRecap.totalAmount - monthlyRecap.totalMovolab)
            : 'N/D'}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-normal">
        <div className="text-left font-semibold text-gray-600 overflow-hidden text-ellipsis">
          <DisplayDateTime date={monthlyRecap.updatedAt} displayType={'flex'} />
        </div>
      </td>
      <td>
        {isClient ? (
          <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
            <Button btnStyle="tableItemAction" onClick={() => expandFunction()}>
              Espandi &darr;
            </Button>
          </td>
        ) : (
          <Button
            to={`/admin/ripartizione-incassi/mensile/${monthlyRecap?._id}`}
            btnStyle="tableItemAction"
          >
            Dettagli &raquo;
          </Button>
        )}
      </td>
    </tr>
  );
};

export default RevenueSharesMonthlyRecapTableItem;
