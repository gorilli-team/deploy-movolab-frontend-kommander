import { decideDamagesCostType } from './Damages';

export const calculateRentOpeningTotals = (rent, prepaidRentPercentage) => {
  let totalMovolab = 0;
  let totalCustom = 0;
  let missingMovolab = 0;
  let missingCustomer = 0;

  const amountInfoToPay = rent?.price?.priceInfo?.amountInfo?.finalPrice;
  const amountInfoMissing =
    rent?.price?.priceInfo?.amountInfo?.finalPrice -
    (rent?.price?.priceInfo?.amountInfo?.amountPaid || 0);
  if (rent?.price?.priceInfo?.amountInfo?.invoicingType === 'movolab') {
    totalMovolab += amountInfoToPay;
    missingMovolab += amountInfoMissing;
  } else {
    totalCustom += amountInfoToPay;
    missingCustomer += amountInfoMissing;
  }

  const extraServices = rent?.price?.priceInfo?.extraServicesAmountInfo;
  for (let i = 0; i < extraServices?.length; i++) {
    const amountInfoToPay = extraServices[i]?.amountInfo?.finalPrice;
    const amountInfoMissing =
      extraServices[i]?.amountInfo?.finalPrice - (extraServices[i]?.amountInfo?.amountPaid || 0);

    if (extraServices[i]?.amountInfo?.invoicingType === 'movolab') {
      totalMovolab += amountInfoToPay;
      missingMovolab += amountInfoMissing;
    } else {
      totalCustom += amountInfoToPay;
      missingCustomer += amountInfoMissing;
    }
  }

  const extraCosts = rent?.price?.priceInfo?.extraCostsAmountInfo;
  for (let i = 0; i < extraCosts?.length; i++) {
    const amountInfoToPay = extraCosts[i]?.amountInfo?.finalPrice;
    const amountInfoMissing =
      extraCosts[i]?.amountInfo?.finalPrice - (extraCosts[i]?.amountInfo?.amountPaid || 0);

    if (extraCosts[i]?.amountInfo?.invoicingType === 'movolab') {
      totalMovolab += amountInfoToPay;
      missingMovolab += amountInfoMissing;
    } else {
      totalCustom += amountInfoToPay;
      missingCustomer += amountInfoMissing;
    }
  }

  const totals = {
    totalMovolab,
    totalCustom,
    missingMovolab,
    missingCustomer,
  };

  return totals;
};

export const calculateRentClosingTotals = (rent) => {
  let totalMovolab = 0;
  let totalCustom = 0;
  let missingMovolab = 0;
  let missingCustomer = 0;

  if (!rent?.price?.priceInfo) {
    return {
      totalMovolab: 0,
      totalCustom: 0,
      missingMovolab: 0,
      missingCustomer: 0,
    };
  }

  const amountInfoToPay = rent?.price?.priceInfo?.amountInfo?.finalPrice;
  const amountInfoMissing =
    rent?.price?.priceInfo?.amountInfo?.finalPrice -
    (rent?.price?.priceInfo?.amountInfo?.amountPaid || 0);

  if (rent?.price?.priceInfo?.amountInfo?.invoicingType === 'movolab') {
    totalMovolab += amountInfoToPay;
    missingMovolab += amountInfoMissing;
  } else {
    totalCustom += amountInfoToPay;
    missingCustomer += amountInfoMissing;
  }

  const extraDaysAmountInfoToPay = rent?.price?.priceInfo?.extraDaysAmountInfo?.finalPrice;
  const extraDaysAmountInfoMissing =
    rent?.price?.priceInfo?.extraDaysAmountInfo?.finalPrice -
    (rent?.price?.priceInfo?.extraDaysAmountInfo?.amountPaid || 0);

  if (rent?.price?.priceInfo?.extraDaysAmountInfo?.invoicingType === 'movolab') {
    totalMovolab += extraDaysAmountInfoToPay;
    missingMovolab += extraDaysAmountInfoMissing;
  }
  if (rent?.price?.priceInfo?.extraDaysAmountInfo?.invoicingType === 'customer') {
    totalCustom += extraDaysAmountInfoToPay;
    missingCustomer += extraDaysAmountInfoMissing;
  }

  const fuelExtraAmountInfoToPay = rent?.price?.priceInfo?.fuelExtraAmountInfo?.finalPrice;
  const fuelExtraAmountInfoMissing =
    rent?.price?.priceInfo?.fuelExtraAmountInfo?.finalPrice -
    (rent?.price?.priceInfo?.fuelExtraAmountInfo?.amountPaid || 0);

  if (rent?.price?.priceInfo?.fuelExtraAmountInfo?.invoicingType === 'movolab') {
    totalMovolab += fuelExtraAmountInfoToPay;
    missingMovolab += fuelExtraAmountInfoMissing;
  } else {
    totalCustom += fuelExtraAmountInfoToPay;
    missingCustomer += fuelExtraAmountInfoMissing;
  }

  const kmExtraAmountInfoToPay = rent?.price?.priceInfo?.kmExtraAmountInfo?.finalPrice;
  const kmExtraAmountInfoMissing =
    rent?.price?.priceInfo?.kmExtraAmountInfo?.finalPrice -
    (rent?.price?.priceInfo?.kmExtraAmountInfo?.amountPaid || 0);
  if (rent?.price?.priceInfo?.kmExtraAmountInfo?.invoicingType === 'movolab') {
    totalMovolab += kmExtraAmountInfoToPay;
    missingMovolab += kmExtraAmountInfoMissing;
  }
  if (rent?.price?.priceInfo?.kmExtraAmountInfo?.invoicingType === 'customer') {
    totalCustom += kmExtraAmountInfoToPay;
    missingCustomer += kmExtraAmountInfoMissing;
  }

  const ifFranchiseAmountInfoToPay = rent?.price?.priceInfo?.ifFranchiseAmountInfo?.finalPrice;
  const ifFranchiseAmountInfoMissing =
    rent?.price?.priceInfo?.ifFranchiseAmountInfo?.finalPrice -
    (rent?.price?.priceInfo?.ifFranchiseAmountInfo?.amountPaid || 0);
  if (rent?.price?.priceInfo?.ifFranchiseAmountInfo?.invoicingType === 'movolab') {
    totalMovolab += ifFranchiseAmountInfoToPay;
    missingMovolab += ifFranchiseAmountInfoMissing;
  }
  if (rent?.price?.priceInfo?.ifFranchiseAmountInfo?.invoicingType === 'customer') {
    totalCustom += ifFranchiseAmountInfoToPay;
    missingCustomer += ifFranchiseAmountInfoMissing;
  }

  const decideDamagesCost = decideDamagesCostType(
    rent?.price?.priceInfo?.kaskoFranchiseAmountInfo,
    rent?.price?.priceInfo?.damagesAmountInfo,
  );

  if (decideDamagesCost === 'kasko') {
    const kaskoFranchiseAmountInfoToPay =
      rent?.price?.priceInfo?.kaskoFranchiseAmountInfo?.finalPrice;
    const kaskoFranchiseAmountInfoMissing =
      rent?.price?.priceInfo?.kaskoFranchiseAmountInfo?.finalPrice -
      (rent?.price?.priceInfo?.kaskoFranchiseAmountInfo?.amountPaid || 0);
    if (rent?.price?.priceInfo?.kaskoFranchiseAmountInfo?.invoicingType === 'movolab') {
      totalMovolab += kaskoFranchiseAmountInfoToPay;
      missingMovolab += kaskoFranchiseAmountInfoMissing;
    }
    if (rent?.price?.priceInfo?.kaskoFranchiseAmountInfo?.invoicingType === 'customer') {
      totalCustom += kaskoFranchiseAmountInfoToPay;
      missingCustomer += kaskoFranchiseAmountInfoMissing;
    }
  }

  if (decideDamagesCost === 'damages') {
    const damagesAmountInfoToPay = rent?.price?.priceInfo?.damagesAmountInfo?.finalPrice;
    const damagesAmountInfoMissing =
      rent?.price?.priceInfo?.damagesAmountInfo?.finalPrice -
      (rent?.price?.priceInfo?.damagesAmountInfo?.amountPaid || 0);
    if (rent?.price?.priceInfo?.damagesAmountInfo?.invoicingType === 'movolab') {
      totalMovolab += damagesAmountInfoToPay;
      missingMovolab += damagesAmountInfoMissing;
    }
    if (rent?.price?.priceInfo?.damagesAmountInfo?.invoicingType === 'customer') {
      totalCustom += damagesAmountInfoToPay;
      missingCustomer += damagesAmountInfoMissing;
    }
  }

  const rcaFranchiseAmountInfoToPay = rent?.price?.priceInfo?.rcaFranchiseAmountInfo?.finalPrice;
  const rcaFranchiseAmountInfoMissing =
    rent?.price?.priceInfo?.rcaFranchiseAmountInfo?.finalPrice -
    (rent?.price?.priceInfo?.rcaFranchiseAmountInfo?.amountPaid || 0);
  if (rent?.price?.priceInfo?.rcaFranchiseAmountInfo?.invoicingType === 'movolab') {
    totalMovolab += rcaFranchiseAmountInfoToPay;
    missingMovolab += rcaFranchiseAmountInfoMissing;
  }
  if (rent?.price?.priceInfo?.rcaFranchiseAmountInfo?.invoicingType === 'customer') {
    totalCustom += rcaFranchiseAmountInfoToPay;
    missingCustomer += rcaFranchiseAmountInfoMissing;
  }

  const extraServices = rent?.price?.priceInfo?.extraServicesAmountInfo;
  for (let i = 0; i < extraServices?.length; i++) {
    const amountInfoToPay = extraServices[i]?.amountInfo?.finalPrice;
    const amountInfoMissing =
      extraServices[i]?.amountInfo?.finalPrice - (extraServices[i]?.amountInfo?.amountPaid || 0);

    if (extraServices[i]?.amountInfo?.invoicingType === 'movolab') {
      totalMovolab += amountInfoToPay;
      missingMovolab += amountInfoMissing;
    } else {
      totalCustom += amountInfoToPay;
      missingCustomer += amountInfoMissing;
    }
  }

  const extraCosts = rent?.price?.priceInfo?.extraCostsAmountInfo;
  for (let i = 0; i < extraCosts?.length; i++) {
    const amountInfoToPay = extraCosts[i]?.amountInfo?.finalPrice;
    const amountInfoMissing =
      extraCosts[i]?.amountInfo?.finalPrice - (extraCosts[i]?.amountInfo?.amountPaid || 0);

    if (extraCosts[i]?.amountInfo?.invoicingType === 'movolab') {
      totalMovolab += amountInfoToPay;
      missingMovolab += amountInfoMissing;
    } else {
      totalCustom += amountInfoToPay;
      missingCustomer += amountInfoMissing;
    }
  }

  const totals = {
    totalMovolab: Number(totalMovolab.toFixed(2)) || 0,
    totalCustom: Number(totalCustom.toFixed(2)) || 0,
    missingMovolab: Number(missingMovolab.toFixed(2)) || 0,
    missingCustomer: Number(missingCustomer.toFixed(2)) || 0,
  };

  return totals;
};

export const rentStateIsEqualOrAfter = (rent, state) => {
  const states = [
    'draft',
    'annullato',
    'aperto',
    'attivo',
    'chiuso',
    'stornato',
    'parz fatturato',
    'fatturato',
    'parz incassato',
    'incassato'
  ];

  const stateIndex = states.indexOf(rent?.state);
  const stateToCompareIndex = states.indexOf(state);

  return stateIndex >= stateToCompareIndex;
};
