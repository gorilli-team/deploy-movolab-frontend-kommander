import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import CorporatePage from '../../../components/Corporate/CorporatePage';
import UsersTable, { /* exportUsers, */ searchUsers } from '../../../components/Users/UsersTable';
import TableHeader from '../../../components/UI/TableHeader';
import { CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR, http } from '../../../utils/Utils';
import TableHeaderTab from '../../../components/UI/TableHeaderTab';
import WhiteBox from '../../../components/UI/WhiteBox';
import UsersModal from '../../../components/Users/UsersModal';
import PlusOutlineCircle from '../../../assets/icons/PlusOutlineCircle';
import UsersFilterContainer from '../../../components/Users/UsersFilterContainer';

const CorporateUsers = () => {
  const [users, setUsers] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [simpleSearch, setSimpleSearch] = useState(true);
  const search = useLocation().search;
  const page = new URLSearchParams(search).get('page'); // eslint-disable-line
  const history = useHistory();

  const [userType, setUserType] = useState('user');

  useEffect(() => {
    fetchUsers();
  }, []); // eslint-disable-line

  const fetchUsers = async (skip = 0, limit = 10) => {
    const response = await http({
      url: `/users/corporate?skip=${skip}&limit=${limit}&userType=${userType}`,
    });
    setUsers(response);
    setClientsCount({ users: response.count });
    // setUsers(await dbFetchUsers(skip, limit));
  };

  const searchSubmit = async (data, e) => {
    e.preventDefault();

    if (simpleSearch) {
      // const response = await dbFetchUsers(0, null);
      const response = await http({ url: `/users/corporate?userType=${userType}` });

      if (data.query) {
        const query = data.query.toLowerCase();
        response.users = response.users.filter(
          (user) =>
            user.name.toLowerCase().includes(query) || user.surname.toLowerCase().includes(query),
        );
        response.count = response.users.length;
        return setUsers(response);
      }

      return fetchUsers();
    }

    const searchResults = await searchUsers(data);
    return setUsers({ users: searchResults.users, count: searchResults.users.length });
  };

  const closeModal = () => {
    setShowCreateUserModal(false);
  };

  const returnUser = (user) => {
    history.push(`/dashboard/utenti/persona/${user._id}`);
  };

  const updateUserType = (userType) => {
    var newurl =
      window.location.protocol +
      '//' +
      window.location.host +
      window.location.pathname +
      '?page=' +
      userType;
    window.history.pushState({ path: newurl }, '', newurl);
    setUserType(userType);
  };

  return (
    <CorporatePage canAccess={[CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR]}>
      <WhiteBox>
        <TableHeader
          tableName="Clienti"
          buttons={[
            {
              function: () => {
                setShowCreateUserModal(true);
              },
              label: 'Aggiungi persona',
              svgIco: <PlusOutlineCircle />,
            },
          ]}
        >
          <div className="flex flex-1 justify-end">
            <UsersFilterContainer onSubmit={searchSubmit} isSimple={simpleSearch} />
          </div>
        </TableHeader>

        <TableHeaderTab
          buttons={[
            {
              label: 'Persone' + (clientsCount.users ? ' (' + clientsCount.users + ')' : ''),
              function: () => updateUserType('user'),
              selected: userType === 'user',
            },
          ]}
        >
          <button
            type="button"
            onClick={() => setSimpleSearch(!simpleSearch)}
            className="rounded-lg border border-slate-300 whitespace-nowrap text-sm mb-1 sm:w-auto xs:w-auto enabled:hover:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed sm:mb-0 px-3 py-1 mr-2"
          >
            {simpleSearch ? 'Ricerca avanzata' : 'Ricerca veloce'}
          </button>

          <button
            type="button" //onClick={exportUsers}
            className="rounded-lg border border-slate-300 whitespace-nowrap text-sm mb-1 sm:w-auto xs:w-auto enabled:hover:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed sm:mb-0 px-3 py-1"
          >
            Esporta
          </button>
        </TableHeaderTab>

        {userType === 'user' && (
          <UsersTable
            users={users.users ?? []}
            clientsCount={users.count ?? 0}
            fetchUsers={fetchUsers}
          />
        )}
      </WhiteBox>

      {showCreateUserModal && (
        <UsersModal
          type={'driver'}
          closeModal={closeModal}
          returnUser={returnUser}
          requiredSection={'choose'}
        />
      )}
    </CorporatePage>
  );
};

export default CorporateUsers;
