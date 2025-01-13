export const vehicleParts = [
  { label: 'Carrozzeria', value: 'body' },
  { label: 'Ruota', value: 'wheel' },
  { label: 'Parabrezza', value: 'windshield' },
  { label: 'Lunotto posteriore', value: 'rear windowshield' },
  { label: 'Vetro', value: 'glass' },
  { label: 'Specchietto', value: 'mirror' },
  { label: 'Fanale', value: 'light' },
  { label: 'Sedile', value: 'seat' },
  { label: 'Cruscotto', value: 'dashboard' },
  { label: 'Plancia', value: 'panel' },
  { label: 'Volante', value: 'steering wheel' },
  { label: 'Cielo interno', value: 'ceiling' },
  { label: 'Altro', value: 'other' },
];

export const decideDamagesCostType = (kaskoFranchiseAmountInfo, damagesAmountInfo) => {
  const kaskoCost = kaskoFranchiseAmountInfo?.finalPrice;
  const damagesCost = damagesAmountInfo?.finalPrice;
  const kaskoInitialCost = kaskoFranchiseAmountInfo?.initialPrice;
  const decideDamagesCost = damagesCost >= kaskoCost && kaskoInitialCost > 0 ? 'kasko' : 'damages';
  return decideDamagesCost;
};
