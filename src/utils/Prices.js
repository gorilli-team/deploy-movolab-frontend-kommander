export const calculatePrice = (
  movementType,
  fare,
  days,
  storedDiscountPercentage,
  storedDiscountAmount,
  value,
) => {
  if (movementType === 'COM' || movementType === 'MNP') return 0;

  if (fare?.calculation === 'unit') {
    return fare?.baseFare * days;
  } else if (fare?.calculation === 'range') {
    return fare?.baseFare;
  }
};

export const calculateBasePrice = (movementType, fare, days) => {
  if (movementType === 'COM' || movementType === 'MNP') return 0;

  if (fare.calculation === 'unit') {
    return fare?.baseFare * days;
  }
  if (fare.calculation === 'range') {
    return fare?.baseFare;
  }
};

export const calculateExtraServicesPrice = (extraServices) => {
  if (!extraServices) return 0;
  return extraServices.reduce((acc, extraService) => {
    return acc + extraService.cost.amount;
  }, 0);
};

export const calculateTotalPrice = (price, extraServicesPrice) => {
  return price + extraServicesPrice;
};

export const convertPrice = (price) => {
  if (price === undefined) return '';
  const numberPrice = +price;
  return (numberPrice.toFixed(2) + '').replace('.', ',') + '€';
};

export const showCostTimeframe = (timeUnit) => {
  if (timeUnit === 'hour') return 'Orario';
  if (timeUnit === 'day') return 'Giornaliero';
  if (timeUnit === 'month') return 'Mensile';
  if (timeUnit === 'minute') return 'Minuto';
  else return 'Giornaliero';
};

export const convertFareCalculation = (fare, range) => {
  if (fare.calculation === 'unit') {
    if (range.timeUnit === 'day') {
      return 'Giornaliero';
    }
  } else {
    return 'Fisso';
  }
};

export const calculateScontoInverso = (line) => {
  return (
    line.initialPrice -
    (line.initialPrice * (1 + line.vatPercentage / 100) - line.discountAmount) /
      (1 + line.vatPercentage / 100)
  );
};
