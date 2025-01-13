import React, { useContext, useEffect, useState } from 'react';
import CorporatePage from '../../components/Corporate/CorporatePage';
import Button from '../../components/UI/buttons/Button';
import { CORPORATE_ROLE_ADMIN } from '../../utils/Utils';
import { UserContext } from '../../store/UserContext';
import { http } from '../../utils/Utils';
import { releaseDate, releaseNumber } from '../../utils/Release';
import WhiteBox from '../../components/UI/WhiteBox';
import moment from 'moment/min/moment-with-locales';

moment.locale('it');

const CorporateHome = () => {
  const [userData, setUserData] = useState({});
  const [stats, setStats] = useState({});
  const userContext = useContext(UserContext);

  useEffect(() => {
    fetchStats();
    getClientProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    await http({
      url: '/corporate/stats',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
      .then((response) => {
        setStats(response);
      })
      .catch((error) => {
        console.error('error', error);
      });
  };

  const getClientProfileData = async () => {
    setUserData(await userContext.getUserInfo());
  };

  const corporate_tiles = [
    {
      name: 'Prenotazioni',
      link: '/corporate/prenotazioni',
      count: stats.reservationCount || 0,
    },
    {
      name: 'Movo',
      link: '/corporate/movimenti',
      count: stats.rentCount || 0,
    },
  ];

  return (
    <CorporatePage canAccess={CORPORATE_ROLE_ADMIN}>
      <WhiteBox>
        <div className="flex p-7 gap-x-4 mb-6">
          <div className="flex-1">
            <div className="text-3xl">
              Ciao <span className="font-semibold">{userData?.fullname}</span>
            </div>
            <div className="text-sm mt-4">
              {userData?.role === 'corporateAdmin' ? 'Amministratore' : 'Operatore'}
              <br />
              <strong className="text-xl">{userData?.email}</strong>
            </div>
          </div>
          <div className="text-right">
            <h3 className="capitalize text-xl mb-3">{moment().format('dddd, D MMMM YYYY')}</h3>
            <p className="text-xs">
              Ultimo accesso: {new Date(userData?.lastLogin).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap p-4 gap-4">
          {corporate_tiles.map((tile, key) => (
            <Button
              btnStyle="red"
              key={key}
              to={tile.link}
              className="flex flex-col py-4 px-5 min-w-[8em] !text-lg !font-light"
            >
              <h5 className="font-bold">{tile.name}</h5>
              <p>{tile.count}</p>
            </Button>
          ))}
        </div>
      </WhiteBox>

      <div className="pr-6 content-end text-xs text-right">
        <div>Versione: {releaseNumber}</div>
        <div>Data rilascio: {releaseDate}</div>
      </div>
    </CorporatePage>
  );
};

export default CorporateHome;
