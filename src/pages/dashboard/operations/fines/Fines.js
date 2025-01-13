import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Page from '../../../../components/Dashboard/Page';

import WhiteBox from '../../../../components/UI/WhiteBox';
import TableHeader from '../../../../components/UI/TableHeader';
import PlusOutlineCircle from '../../../../assets/icons/PlusOutlineCircle';

import { http } from '../../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../../utils/Utils';
import Table from '../../../../components/UI/Table';
import ElementLabel from '../../../../components/UI/ElementLabel';
import { convertPrice } from '../../../../utils/Prices';
import Button from '../../../../components/UI/buttons/Button';

const Fines = () => {
  const history = useHistory();
  // const userContext = useContext(UserContext);
  // const [userData, setUserData] = useState({});
  const [finesCount, setFinesCount] = useState(0);

  /* useEffect(() => {
    getClientProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getClientProfileData = async () => {
    setUserData(await userContext.getUserInfo());
  }; */

  const fetchFines = async (skip = 0, limit = 10) => {
    const response = await http({
      url: `/fines?skip=${skip}&limit=${limit}`,
    });

    setFinesCount(response.count);

    return { resource: response.fines, count: response.count };
  };

  const fineStates = (state) =>
    state === 'draft' ? (
      <ElementLabel>BOZZA</ElementLabel>
    ) : state === 'open' ? (
      <ElementLabel bgColor="bg-green-600">INSERITA</ElementLabel>
    ) : (
      <ElementLabel bgColor="bg-yellow-600">{state}</ElementLabel>
    );

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <WhiteBox>
        <TableHeader
          tableName={'Multe' + ' (' + finesCount + ')'}
          buttons={[
            {
              function: () => {
                history.push('/dashboard/operazioni/multe/crea');
              },
              label: 'Nuova multa',
              svgIco: <PlusOutlineCircle />,
            },
          ]}
        />

        {/* <TableHeaderTab
          buttons={[
            {
              label: 'Multe' + ' (' + finesCount + ')',
              selected: true
            },
          ]}
        /> */}

        <Table
          header={['Verbale', 'Movo', 'Stato', 'Importo multa', 'Data inserimento', '']}
          fetchFunction={fetchFines}
          emptyTableMessage="Non è stata creata alcuna multa"
          itemsLayout={{
            code: (code) => code,
            rent: (rent) => rent?.code.substring(rent?.code.length - 8),
            state: fineStates,
            amount: convertPrice,
            createdAt: (date) => (date ? new Date(date).toLocaleDateString() : ''),
            _id: (id) => (
              <Button to={`/dashboard/operazioni/multe/${id}`} btnStyle="tableItemAction">
                Dettagli &raquo;
              </Button>
            ),
          }}
        />
      </WhiteBox>
    </Page>
  );
};

export default Fines;
