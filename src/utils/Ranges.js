import { http } from './Utils';

export const fetchRangeInfo = async (rangeId) => {
  try {
    if (rangeId !== undefined) {
      const response = (await http({ url: '/pricing/range/' + rangeId })).data;
      return response;
    } else {
      return null;
    }
  } catch (err) {
    console.error(err);
  }
};
