import React from 'react';
import PersonalDetails from './User/PersonalDetails';

const ShowUser = ({ user }) => {
  return (
    <div className="flex">
      <div className="flex-initial w-4/6">
        <PersonalDetails user={user} />
      </div>
    </div>
  );
};

export default ShowUser;
