import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UpdateEventsTable from '../../UpdateEvents/UpdateEventsTable';
import { http } from '../../../utils/Utils';

const UserUpdates = () => {
  const params = useParams();
  const [user, setUser] = useState({}); // eslint-disable-line

  const fetchUser = async () => {
    try {
      const response = await http({ url: `/users/${params.id}` });

      setUser(response);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UpdateEventsTable collectionName={'users'} id={params.id} />
  );
};

export default UserUpdates;
