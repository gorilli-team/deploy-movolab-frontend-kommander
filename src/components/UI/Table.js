import React, { useEffect, useState } from 'react';
import Navigation from './Navigation';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../assets/icons/LoadingSpinner';

const Table = ({
  header = [],
  itemsLayout = {},
  fetchFunction,
  queryProps = null,
  perPage = 10,
  rowClassFunction = () => '',
  customTable = null,
  headClassName = 'text-white bg-gray-400 border-gray-200',
  children = <></>,
  avoidLoading = false,
  emptyTableMessage = 'Nessun dato presente in tabella',
}) => {
  const [from, setFrom] = useState(0);
  const [count, setCount] = useState(0);
  const [resource, setResource] = useState([]);

  //eslint-disable-next-line
  useEffect(async () => {
    if (customTable) return;

    try {
      if (!avoidLoading) {
        setResource(null);
      }

      const data = await fetchFunction(from, 10, queryProps);

      setResource(data.resource);
      setCount(data.count);
    } catch (e) {
      toast.error('Errore nel caricamento dei dati');
      console.error(e);
    }
  }, [queryProps, from]);

  return (
    <>
      <div className="w-full overflow-x-auto border-b">
        <table className="table-auto w-full font-semibold">
          <thead className={`text-xs uppercase border-t border-b ${headClassName}`}>
            <tr className="font-semibold text-left">
              {header.map((text, key) => (
                <th className="first:pl-5 pr-2 last:pr-5 py-3 whitespace-nowrap" key={key}>
                  {text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm divide-y text-gray-600 divide-gray-200">
            {!customTable ? (
              resource === null ? (
                <tr>
                  <td className="text-center py-3" colSpan={header.length}>
                    <LoadingSpinner className="w-5 inline" />
                  </td>
                </tr>
              ) : resource.length <= 0 ? (
                <tr>
                  <td
                    className="text-center font-normal py-16 text-gray-400 text-2xl"
                    colSpan={header.length}
                  >
                    {emptyTableMessage}
                  </td>
                </tr>
              ) : (
                resource.map((row, rowKey) => (
                  <tr className={rowClassFunction(row)} key={rowKey}>
                    {Object.entries(itemsLayout).map(([key, cell]) => (
                      <td className="first:pl-5 pr-2 last:pr-5 py-3 whitespace-nowrap" key={key}>
                        {cell(row[key], row)}
                      </td>
                    ))}
                  </tr>
                ))
              )
            ) : null}
            {children}
          </tbody>
        </table>
      </div>

      {!customTable ? (
        <Navigation
          from={from + 1}
          to={from + perPage}
          length={count}
          precFunction={() => {
            if (from - perPage >= 0) {
              setFrom(from - perPage);
            }
          }}
          succFunction={() => {
            if (from + perPage <= count) {
              setFrom(from + perPage);
            }
          }}
        />
      ) : null}
    </>
  );
};

export default Table;
