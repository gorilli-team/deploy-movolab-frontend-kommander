export const mapApplicability = (applicability) => {
  if (!applicability) return '-';
  if (applicability === 'manual') return 'Manuale';
  if (applicability === 'automatic') return 'Automatica';
  return applicability;
};

export const mapCostCalculation = (calculation) => {
  if (!calculation) return '-';
  if (calculation === 'fixed') return 'Fisso';
  if (calculation === 'daily') return 'Giornaliero';
  if (calculation === 'percentage') return 'Percentuale';
  if (calculation === 'unit') return 'Per Unità';
  return calculation;
};

export const mapGroups = (inputGroups, groups) => {
  if (!inputGroups || inputGroups.length === 0) return '-';
  const labels = inputGroups.map((group) => {
    return groups.find((g) => g.value === group)?.label;
  });
  return labels.join(', ');
};
