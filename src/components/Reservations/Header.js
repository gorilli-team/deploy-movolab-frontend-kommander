import React, { useContext } from 'react';
import { UserContext } from '../../store/UserContext';

const ReservationHeader = ({ title, section }) => {
  const { data: currentClient } = useContext(UserContext);
  const currentDate = new Date(Date.now());
  const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(
    currentDate.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}/${currentDate.getFullYear()}`;

  return (
    <div className="flex items-center justify-between px-2">
      <div className="font-bold text-2xl p-2"> {title}</div>
      <div className="flex items-center">
        <div
          className={`bg-black text-white px-[7px] border-2 rounded-full border-black cursor-pointer"`}
        >
          1
        </div>
        <div style={{ width: '2rem', height: '2px', background: '#000' }}></div>
        <div
          className={`${
            section === 'second' ? 'bg-black text-white' : 'hover:bg-black hover:text-white'
          } cursor-pointer px-[7px] border-2 rounded-full border-black "`}
        >
          2
        </div>
      </div>
      <div className="flex items-center">
        <p>
          Agg: {currentClient?.fullname} | {formattedDate}
        </p>
        <img
          style={{ paddingLeft: 15, cursor: 'pointer', width: 30 }}
          className="hover:font-bold"
          src="/close.png"
          alt="check mark icon"
        />
      </div>
    </div>
  );
};

export default ReservationHeader;
