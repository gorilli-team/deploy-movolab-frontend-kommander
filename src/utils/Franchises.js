export const mapFranchiseCalculation = (calculation) => {
  if (!calculation) return '-';
  if (calculation === 'min') return 'Minimale';
  if (calculation === 'max') return 'Massimale';
  if (calculation === 'none') return 'Nessuna';
};
