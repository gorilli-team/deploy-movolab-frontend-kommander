import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { http } from '../utils/Utils';

const useGroups = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await http({ url: '/groups' });
      setGroups(
        response.groups.map((group) => {
          return { value: group?._id, label: `${group?.mnemonic} - ${group?.description}` };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return groups;
};

export default useGroups;
