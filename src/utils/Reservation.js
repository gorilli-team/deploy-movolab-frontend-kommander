import { http } from './Utils';

export const calculateReservationTotals = (reservation, prepaidReservationPercentage) => {
  let totalMovolab = 0;
  let totalCustom = 0;
  let missingMovolab = 0;
  let missingCustomer = 0;

  const amountInfoToPay = reservation?.price?.priceInfo?.amountInfo?.finalPrice;
  const amountInfoMissing =
    reservation?.price?.priceInfo?.amountInfo?.finalPrice -
    (reservation?.price?.priceInfo?.amountInfo?.amountPaid || 0);
  if (reservation?.price?.priceInfo?.amountInfo?.invoicingType === 'movolab') {
    totalMovolab += Number(amountInfoToPay.toFixed(2));
    missingMovolab += Number(amountInfoMissing.toFixed(2));
  } else {
    totalCustom += Number(amountInfoToPay.toFixed(2));
    missingCustomer += Number(amountInfoMissing.toFixed(2));
  }

  const extraServices = reservation?.price?.priceInfo?.extraServicesAmountInfo;
  for (let i = 0; i < extraServices?.length; i++) {
    const amountInfoToPay = extraServices[i]?.amountInfo?.finalPrice;
    const amountInfoMissing =
      extraServices[i]?.amountInfo?.finalPrice - (extraServices[i]?.amountInfo?.amountPaid || 0);

    if (extraServices[i]?.amountInfo?.invoicingType === 'movolab') {
      totalMovolab += Number(amountInfoToPay.toFixed(2));
      missingMovolab += Number(amountInfoMissing.toFixed(2));
    } else {
      totalCustom += Number(amountInfoToPay.toFixed(2));
      missingCustomer += Number(amountInfoMissing.toFixed(2));
    }
  }

  const extraCosts = reservation?.price?.priceInfo?.extraCostsAmountInfo;
  for (let i = 0; i < extraCosts?.length; i++) {
    const amountInfoToPay = extraCosts[i]?.amountInfo?.finalPrice;
    const amountInfoMissing =
      extraCosts[i]?.amountInfo?.finalPrice - (extraCosts[i]?.amountInfo?.amountPaid || 0);

    if (extraCosts[i]?.amountInfo?.invoicingType === 'movolab') {
      totalMovolab += Number(amountInfoToPay.toFixed(2));
      missingMovolab += Number(amountInfoMissing.toFixed(2));
    } else {
      totalCustom += Number(amountInfoToPay.toFixed(2));
      missingCustomer += Number(amountInfoMissing.toFixed(2));
    }
  }

  const totals = {
    totalMovolab: Number(totalMovolab.toFixed(2)),
    totalCustom: Number(totalCustom.toFixed(2)),
    missingMovolab: Number(missingMovolab.toFixed(2)),
    missingCustomer: Number(missingCustomer.toFixed(2)),
  };

  return totals;
};

export const calculatePayment = async (reservationId, workflow) => {
  const reservation = await http({ url: `/reservations/${reservationId}` });

  const result = calculateReservationTotals(
    reservation,
    workflow.administration.prepaidReservation / 100,
  );

  let paymentAmount = 0;
  result.movolabOutstanding.forEach((outstanding) => {
    paymentAmount += outstanding.finalPrice;
  });
  result.customerOutstanding.forEach((outstanding) => {
    paymentAmount += outstanding.finalPrice;
  });
  return paymentAmount;
};
