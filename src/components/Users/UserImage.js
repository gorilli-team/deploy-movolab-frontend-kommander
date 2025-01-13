import React from 'react';
import { Link } from 'react-router-dom';

const UserImage = ({ user, width = '5em', size = 40, goToUser = false }) => {
  const isCorporate = window.location.pathname.includes('corporate');

  const toLink = isCorporate
    ? `/corporate/clienti/${user?._id}`
    : `/dashboard/utenti/persona/${user?._id}`;

  return (
    <>
      {goToUser ? (
        <Link className="flex space-x-1" to={toLink}>
          <div
            className="shadow-sm relative cursor-pointer"
            style={{
              backgroundImage: `url(${user.imageUrl || ''})`,
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
            backgroundImage: `url(${user.imageUrl || ''})`,
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

export default UserImage;
