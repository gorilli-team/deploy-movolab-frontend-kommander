export const olderThan18 = (date) => {
  const today = new Date();
  const birthDate = new Date(date);

  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  const day = today.getDate() - birthDate.getDate();

  if (month < 0 || (month === 0 && day < 0)) {
    age = age - 1;
  }
  return age >= 18;
};
