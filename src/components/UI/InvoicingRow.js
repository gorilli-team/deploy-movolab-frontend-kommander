import React, { useState } from 'react';
import { convertPrice } from '../../utils/Prices';

const InvoicingRow = ({ children, ...props }) => {
  const [newPrice] = useState(props.price); // eslint-disable-line no-unused-vars

  return (
    <>
      {props.subTotal > 0 ? (
        <>
          {props.mode === 'small' ? (
            <>
              <div className="flex flex-wrap my-2 text-sm justify-between">
                <div
                  className={`${props.boldTytle ? 'font-semibold' : ''} ${
                    props.colSpan === 2 ? 'col-span-2' : ''
                  }`}
                >
                  {props.rowName.substring(0, 35)}
                </div>
                <div className="text-end">{convertPrice(newPrice)}</div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-8">
              <div
                className={`mx-3 mt-2 ${props.boldTytle ? 'font-semibold' : ''} ${
                  props.colSpan === 2 ? 'col-span-2' : ''
                }`}
              >
                {props.rowName}
              </div>
              {props.colSpan === 2 ? null : <div className="mx-3"></div>}
              <div className="mx-3"></div> <div className="mx-3"></div>
              <div className="mx-3 mt-2 text-end"></div>
              <div className="mx-3 text-end"></div>
              <div className="mx-3 text-end mt-2">
                {props.primary ? (
                  <span className="font-semibold rounded-lg">{convertPrice(newPrice)}</span>
                ) : (
                  <span>{convertPrice(newPrice)}</span>
                )}
              </div>
              <div className="mx-3 text-end">
                <div className="flex float-right mt-2 px-10 text-sm">{props.paymentDate}</div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </>
  );
};

export default InvoicingRow;
