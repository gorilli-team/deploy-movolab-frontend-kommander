import React, { useContext, useEffect, useState } from 'react';
import Button from '../../UI/buttons/Button';
import { convertPrice } from '../../../utils/Prices';
import { useForm } from 'react-hook-form';
import { FaPen, FaPlus, FaMinus } from 'react-icons/fa';
import { UserContext } from '../../../store/UserContext';
import { MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';

const PriceRowDetails = ({
  element,
  label,
  labelDescription,
  totalPriceVat,
  subTotal,
  totalPrice,
  totalPriceDiscounted = false,
  vat,
  invoicingType,
  type,
  elementCount,
  className = '',
  mode = 'full',
  discount,
  discountPercentage,
  priceEdit,
  percentageDiscountEdit,
  updatePriceFunction,
  onDiscountUpdate,
}) => {
  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN; // eslint-disable-line no-unused-vars
  const [editPriceAmount, setEditPriceAmount] = useState(false); //eslint-disable-line
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm();
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [localDiscountPercentage, setLocalDiscountPercentage] = useState(0);

  if (priceEdit === undefined) priceEdit = true;

  useEffect(() => {
    setLocalDiscountPercentage(discountPercentage);
  }, [discountPercentage]);

  const [priceEditEnabled, setPriceEditEnabled] = useState(priceEdit); //eslint-disable-line

  useEffect(() => {
    setPriceEditEnabled(priceEdit);
  }, [priceEdit]);

  if (!discount) discount = element?.amountInfo?.discountAmount;

  const calculatePriceVat = (totalPrice, vat) => {
    const numberString = vat.slice(0, -1);
    if (isNaN(totalPrice)) return 0;
    return convertPrice(totalPrice * (1 + Number(numberString) / 100));
  };

  const updatePrice = (data) => {
    try {
      setIsLoading(true);
      setEditPriceAmount(false);
      if (type === 'extraService') {
        updatePriceFunction(type, element, data, elementCount);
      } else if (type === 'extraCost') {
        updatePriceFunction(type, element, data, elementCount);
      } else {
        updatePriceFunction(type, element, data);
      }
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const updatePercentageDiscount = async (newPercentage) => {
    try {
      updatePriceFunction(type, element, undefined, newPercentage);
    } catch (error) {
      console.error('Error updating discount:', error);
    }
  };

  const handleIncrease = () => {
    const newPercentage = Math.min(localDiscountPercentage + 1, 100);
    setLocalDiscountPercentage(newPercentage);
    updatePercentageDiscount(newPercentage);
  };

  const handleDecrease = () => {
    const newPercentage = Math.max(localDiscountPercentage - 1, 0);
    setLocalDiscountPercentage(newPercentage);
    updatePercentageDiscount(newPercentage);
  };

  if (isLoading) {
    return <div>Caricamento...</div>;
  } else {
    return mode === 'small' ? (
      <div className={`py-2 ${className}`}>
        <div className="flex justify-between">
          <div>
            <strong className="font-semibold">{label}</strong>
            <br />
            {labelDescription}
          </div>
          <div className="text-right">
            <strong className="font-semibold">Prezzo Totale</strong>
            <br />
            {priceEditEnabled && !isAdmin ? (
              <>
                {!editPriceAmount ? (
                  <>
                    {convertPrice(totalPriceVat || 0)}
                    <FaPen
                      className="inline cursor-pointer ml-1"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditPriceAmount(true);
                      }}
                    />
                  </>
                ) : (
                  <div className={`${mode !== 'small' ? 'mx-3' : ''} text-end flex`}>
                    <form onSubmit={form.handleSubmit(updatePrice)}>
                      <div className="flex flex-row">
                        <input
                          className="w-20 text-right border rounded-lg px-1 py-0 rounded-r-none border-sky-600"
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={totalPriceVat}
                          {...form.register('totalPriceVat', {
                            valueAsNumber: true,
                          })}
                        />
                        <Button
                          className="py-0 px-2 border-l-0 rounded-l-none"
                          onClick={(e) => {
                            e.preventDefault();
                            updatePrice(form.getValues('totalPriceVat'));
                          }}
                          btnStyle="inFormStyle"
                        >
                          Salva
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <>{convertPrice(totalPriceVat)}</>
            )}
          </div>
        </div>
        <div
          className={`flex flex-wrap justify-end ${
            discount && totalPriceDiscounted ? 'gap-x-3' : 'gap-x-6'
          } `}
        >
          <div className="pt-3">
            Prezzo
            <br />
            {convertPrice(totalPrice || 0)}
          </div>
          {subTotal ? (
            <div className="pt-3">
              Con IVA
              <br />
              {convertPrice(subTotal || 0)}
            </div>
          ) : null}
          {discount ? (
            <div className="pt-3">
              Sconto
              <br />
              {convertPrice(discount)}
            </div>
          ) : null}
          {percentageDiscountEdit ? (
            <div className="pt-3">
              Sconto
              <br />
              {editingDiscount ? (
                <div className="flex items-center">
                  {localDiscountPercentage > 0 && (
                    <FaMinus className="cursor-pointer mr-2" onClick={handleDecrease} />
                  )}
                  <span>{localDiscountPercentage}%</span>
                  {localDiscountPercentage < 100 && (
                    <FaPlus className="cursor-pointer ml-2" onClick={handleIncrease} />
                  )}
                  <FaPen
                    className="cursor-pointer ml-2"
                    onClick={() => setEditingDiscount(false)}
                  />
                </div>
              ) : (
                <div>
                  {localDiscountPercentage}%{' '}
                  <FaPen
                    className="inline cursor-pointer ml-1"
                    onClick={() => setEditingDiscount(true)}
                  />
                </div>
              )}
            </div>
          ) : null}
          {totalPriceDiscounted ? (
            <div className="pt-3">
              Scontato
              <br />
              {convertPrice(totalPriceDiscounted)}
            </div>
          ) : null}
          <div className="pt-3">
            IVA
            <br />
            {vat}
          </div>
          <div className="pt-3">
            Fatturazione
            <br />
            {invoicingType}
          </div>
        </div>
      </div>
    ) : (
      <div className={`flex py-1 gap-x-2 md:gap-x-0 flex-wrap ${className}`}>
        {labelDescription ? <div className="md:w-40">{label}</div> : null}
        <div className="flex-1">{labelDescription || label}</div>
        <div className="hidden md:block w-20">
          {isNaN(totalPrice) ? 'Imponibile' : convertPrice(totalPrice)}
        </div>
        <div className="hidden md:block w-12">{vat}</div>
        <div className="hidden md:block w-20">
          {isNaN(totalPrice) ? 'Subtotale' : calculatePriceVat(totalPrice, vat)}
        </div>
        <div className="hidden md:block w-20">
          {isNaN(discount)
            ? discount
            : discount !== 0
            ? convertPrice(discount)
            : discountPercentage !== 0 && discountPercentage !== undefined
            ? `${discountPercentage}%`
            : ''}
        </div>
        {/* <div className="w-20">{totalPriceDiscounted || '-'}</div> */}
        <div className="w-40">
          {priceEditEnabled && !isAdmin ? (
            <>
              {!editPriceAmount ? (
                <>{convertPrice(totalPriceDiscounted || totalPriceVat)} </>
              ) : (
                <>
                  <div className={`${mode !== 'small' ? 'mx-3' : ''} text-end flex`}>
                    <form onSubmit={form.handleSubmit(updatePrice)}>
                      <div className="flex flex-row">
                        <input
                          className="w-20 text-right border rounded-lg px-1 py-0 rounded-r-none border-sky-600"
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={totalPriceDiscounted}
                          {...form.register('totalPriceVat', {
                            valueAsNumber: true,
                          })}
                        />
                        <Button
                          className="py-0 px-2 border-l-0 rounded-l-none"
                          onClick={(e) => {
                            e.preventDefault();
                            updatePrice();
                          }}
                          btnStyle="inFormStyle"
                        >
                          Salva
                        </Button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </>
          ) : (
            <>{isNaN(totalPriceVat) ? totalPriceVat : convertPrice(totalPriceVat)}</>
          )}
        </div>
        <div className="w-28">{invoicingType}</div>
      </div>
    );
  }
};

export default PriceRowDetails;
