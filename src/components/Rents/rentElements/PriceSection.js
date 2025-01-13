import React from 'react';
import PriceRowDetails from './PriceRowDetails';

const PriceSection = ({
  sectionTitle,
  sectionTotal,
  expanded,
  children,
  sectionBg = 'bg-sky-200',
  mode = 'small',
  innerClassName = 'divide-y',
  className = 'mb-2',
}) => (
  <div className={`text-sm ${className}`}>
    {mode === 'small' ? (
      <>
        <>
          <div
            className={`flex justify-between rounded-xl px-3 py-0.5 mx-[-0.75rem] font-semibold ${sectionBg}`}
          >
            <h4>{sectionTitle}</h4>
            <h4>{sectionTotal}</h4>
          </div>
          <div className={`${expanded ? '' : 'hidden'} ${innerClassName}`}>{children}</div>
        </>
      </>
    ) : (
      <>
        <div className={`${expanded ? '' : 'hidden'} ${innerClassName}`}>
          {children ? (
            <>
              <PriceRowDetails
                label="Descrizione"
                totalPriceVat="Subtotale"
                totalPrice="Prezzo"
                vat="IVA"
                invoicingType="Fatturazione"
                totalPriceDiscounted="Subtotale"
                discount="Sconto"
                priceEdit={false}
                mode={mode}
                className="font-semibold"
              />
              {children}
            </>
          ) : null}
        </div>

        <div
          className={`flex justify-between rounded-xl px-3 py-0.5 mx-[-0.75rem] font-semibold ${sectionBg}`}
        >
          <h4>{sectionTitle}</h4>
          <h4 className="flex">
            <div className="md:w-24">{sectionTotal}</div>
            <div className="md:w-44"></div>
          </h4>
        </div>
      </>
    )}
  </div>
);

export default PriceSection;
