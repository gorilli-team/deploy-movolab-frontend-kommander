export const transmissionNames = [
  { value: 'aut', label: 'Automatica' },
  { value: 'aut6', label: 'Automatica 6 marce' },
  { value: 'aut7', label: 'Automatica 7 marce' },
  { value: 'aut8', label: 'Automatica 8 marce' },
  { value: 'aut9', label: 'Automatica 9 marce' },
  { value: 'man', label: 'Manuale' },
  { value: 'man4', label: 'Manuale 4 marce' },
  { value: 'man5', label: 'Manuale 5 marce' },
  { value: 'man6', label: 'Manuale 6 marce' },
  { value: 'man7', label: 'Manuale 7 marce' },
  { value: 'man8', label: 'Manuale 8 marce' },
  { value: 'cvt', label: 'Variatore' },
];

export const getVehicleGroup = (vehicle) => {
  if (vehicle === undefined) return;
  if (vehicle && vehicle.group) {
    return { group: vehicle.group, custom: true };
  } else {
    return { group: vehicle?.version?.group, custom: false };
  }
};

export const getVehicleImageUrl = (vehicle) => {
  if (vehicle === undefined) return;
  if (vehicle && vehicle.imageUrl) {
    return { imageUrl: vehicle.imageUrl, custom: true };
  } else {
    return { imageUrl: vehicle?.version?.imageUrl, custom: false };
  }
};
