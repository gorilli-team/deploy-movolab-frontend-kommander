import { useEffect, useState } from 'react';
import { http } from '../utils/Utils';

const useFetchFranchise = (id) => {
  const [franchise, setFranchise] = useState({});

  useEffect(() => {
    fetchFranchise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchFranchise = async () => {
    try {
      if (!id) return;
      const response = await http({ url: `/vehicles/franchise/${id}` });

      setFranchise(response);
    } catch (err) {
      console.error(err);
    }
  };

  return franchise;
};

export default useFetchFranchise;
