import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useHistory } from 'react-router-dom';
import Page from '../../../components/Dashboard/Page';
import UsersTable, {
  /* exportUsers, */ searchUsers,
  fetchUsers as dbFetchUsers,
} from '../../../components/Users/UsersTable';
import UserCompaniesTable, {
  fetchUserCompanies as dbFetchUserCompanies,
} from '../../../components/UserCompanies/UserCompaniesTable';
import TableHeader from '../../../components/UI/TableHeader';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import TableHeaderTab from '../../../components/UI/TableHeaderTab';
import WhiteBox from '../../../components/UI/WhiteBox';
import UserCompaniesModal from '../../../components/UserCompanies/UserCompaniesModal';
import UsersModal from '../../../components/Users/UsersModal';
import PlusOutlineCircle from '../../../assets/icons/PlusOutlineCircle';
import UsersFilterContainer from '../../../components/Users/UsersFilterContainer';

const Users = () => {
  const [users, setUsers] = useState(0);
  const [userCompanies, setUserCompanies] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [showCreateUserCompanyModal, setShowCreateUserCompanyModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [simpleSearch, setSimpleSearch] = useState(true);
  const search = useLocation().search;
  const page = new URLSearchParams(search).get('page');
  const history = useHistory();

  const [userType, setUserType] = useState(page === 'company' ? 'company' : 'user');

  useEffect(() => {
    fetchUsers();
    fetchUserCompanies();
    fetchClientsCount();
  }, []);

  const fetchClientsCount = async () => {
    try {
      const response = await http({ url: '/users' });
      const responseCompanies = await http({ url: '/userCompanies' });
      setClientsCount({ users: response.count, companies: responseCompanies.count });
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchUsers = async (skip = 0, limit = 10) => {
    setUsers(await dbFetchUsers(skip, limit));
  };

  const fetchUserCompanies = async (skip = 0, limit = 10) => {
    setUserCompanies(await dbFetchUserCompanies(skip, limit));
  };

  const searchSubmit = async (data, e) => {
    e.preventDefault();

    if (simpleSearch) {
      if (userType === 'user') {
        const response = await dbFetchUsers(0, null);

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
      if (userType === 'company') {
        const response = await dbFetchUserCompanies(0, null);

        if (data.query) {
          const query = data.query.toLowerCase();
          response.userCompanies = response.userCompanies.filter(
            (company) =>
              company.ragioneSociale.toLowerCase().includes(query) ||
              company.partitaIva.toLowerCase().includes(query),
          );
          response.count = response.userCompanies.length;
          return setUserCompanies(response);
        }

        return fetchUserCompanies();
      }
    }

    const searchResults = await searchUsers(data);
    return setUsers({ users: searchResults.users, count: searchResults.users.length });
  };

  const closeModal = () => {
    setShowCreateUserCompanyModal(false);
    setShowCreateUserModal(false);
  };

  const returnUserCompany = (userCompany) => {
    history.push(`/dashboard/utenti/azienda/${userCompany._id}`);
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
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <WhiteBox>
        <TableHeader
          tableName="Clienti"
          buttons={[
            {
              function: () => {
                userType === 'user'
                  ? setShowCreateUserModal(true)
                  : setShowCreateUserCompanyModal(true);
              },
              label: userType === 'user' ? 'Aggiungi persona' : 'Aggiungi azienda',
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
            {
              label:
                'Aziende' + (clientsCount.companies ? ' (' + clientsCount.companies + ')' : ''),
              function: () => updateUserType('company'),
              selected: userType === 'company',
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

        {userType === 'company' && (
          <UserCompaniesTable
            userCompanies={userCompanies.userCompanies ?? []}
            userCompaniesCount={userCompanies.count ?? 0}
            fetchuserCompanies={fetchUserCompanies}
          />
        )}
      </WhiteBox>

      {showCreateUserCompanyModal && (
        <UserCompaniesModal
          mode={'add'}
          closeModal={closeModal}
          returnUser={returnUserCompany}
          returnCompany={returnUserCompany}
          requiredSection={'add'}
        />
      )}

      {showCreateUserModal && (
        <UsersModal
          type={'driver'}
          closeModal={closeModal}
          returnUser={returnUser}
          requiredSection={'choose'}
        />
      )}
    </Page>
  );
};

export default Users;
