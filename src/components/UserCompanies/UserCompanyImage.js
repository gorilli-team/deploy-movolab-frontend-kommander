import React from 'react';
import { Link } from 'react-router-dom';

const UserCompanyImage = ({ userCompany, width = '5em', size = 40, goToUser = false }) => {
  return (
    <>
      {goToUser ? (
        <Link className="flex space-x-1" to={`/dashboard/utenti/azienda/${userCompany?._id}`}>
          <div
            className="shadow-sm relative cursor-pointer"
            style={{
              backgroundImage: `url(${userCompany?.imageUrl || ''})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              borderRadius: width,
              width: size + 'px',
              height: size + 'px',
              marginBottom: '0.2em',
            }}
          ></div>
        </Link>
      ) : (
        <div
          className="shadow-sm relative cursor-pointer"
          style={{
            backgroundImage: `url(${userCompany?.imageUrl || ''})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            borderRadius: width,
            width: size + 'px',
            height: size + 'px',
            marginBottom: '0.2em',
          }}
        ></div>
      )}
    </>
  );
};

export default UserCompanyImage;
