export const capitalizeString = (string) => {
  if (string === undefined) return '';
  if (typeof string !== 'string') return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};
