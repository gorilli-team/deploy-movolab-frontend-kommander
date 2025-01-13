import React, { useState } from 'react';
import toast from 'react-hot-toast';
import UsersTableItem from './UsersTableItem';
import Navigation from '../../components/UI/Navigation';
import { exportToCsv, http, removeUndefinedNullAndEmpty } from '../../utils/Utils';

export const fetchUsers = async (skip = 0, limit = 10) => {
  try {
    return await http({ url: `/users?skip=${skip}&limit=${limit}` });
  } catch (err) {
    console.error(err);
    toast.error(err?.reason?.error || 'Errore');
  }
};

export const exportUsers = async() => {
  const response = await http({ url: `/users` });
  return exportToCsv('users', response.users);
};

export const searchUsers = async (data) => {
  try {
    const queryObject = removeUndefinedNullAndEmpty(data);
    const form = {
      queryObject,
    };
    const response = await http({
      method: 'POST',
      url: '/users/advanced-search',
      form,
    });

    return response;
  } catch (err) {
    console.error(err);
    toast.error(err?.reason?.error);
  }
};

const UsersTable = ({ users, usersCount, fetchUsers, pagination = 10 }) => {
  const [from, setFrom] = useState(0);

  const precFunction = () => {
    if (from - pagination < 0) return;
    fetchUsers(from - pagination, pagination);
    setFrom(from - pagination);
  };

  const succFunction = () => {
    if (from + pagination > usersCount) return;
    fetchUsers(from + pagination, pagination);
    setFrom(from + pagination);
  };

  return (
    <>
      <div className="overflow-auto h-full">
        {/* Table */}
        <div className="border-b">
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-white bg-gray-400 border-t border-b border-gray-200">
              <tr>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left"></div>
                  {/* */}
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Nominativo</div>
                  {/* */}
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Città</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Codice Fiscale</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Patente - Scadenza</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Tipo Cliente</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Stato cliente</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {users.reverse().map((user, index) => {
                return <UsersTableItem key={index} user={user} />;
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + pagination}
        length={usersCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </>
  );
};

export default UsersTable;
