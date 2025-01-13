import { useEffect, useState } from 'react';
import { http } from '../utils/Utils';

const useFetchRanges = (priceListId) => {
  const [ranges, setRanges] = useState([]);

  useEffect(() => {
    fetchRanges(priceListId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRanges = async (priceListId) => {
    try {
      const response = await http({ url: `/pricing/range/priceList/${priceListId}` });
      setRanges(response.ranges);
    } catch (err) {
      console.error(err);
    }
  };

  return ranges;
};

export default useFetchRanges;
