import React from 'react';
import { convertPrice } from '../../utils/Prices';
import PriceRowDetails from '../Rents/rentElements/PriceRowDetails';

const PriceRow = ({ element, ...props }) => {
  return (
    <PriceRowDetails
      element={element}
      label={element?.name}
      labelDescription={
        element?.calculation !== undefined && (
          <div className="text-sm">
            {convertPrice(element?.dailyPrice)}{' '}
            {element?.calculation === 'daily'
              ? `(Giornaliero) x ${element.totalDays} giorni`
              : '(Per Unità)'}
          </div>
        )
      }
      totalPrice={element?.amountInfo?.initialPrice}
      totalPriceVat={element?.amountInfo?.finalPrice}
      subTotal={element?.amountInfo?.subTotal}
      priceEdit={props.priceEdit}
      elementCount={props.elementCount}
      type={props.type}
      vat={element?.amountInfo?.vatPercentage + '%'}
      invoicingType={
        element?.amountInfo?.invoicingType === 'movolab' ? (
          <>Movolab</>
        ) : element?.amountInfo?.invoicingType === 'customer' ? (
          <>Diretta</>
        ) : null
      }
      {...props}
    />
  );
};

export default PriceRow;
