import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { CLIENT_ROLE_ADMIN, http } from '../../../../utils/Utils';
import SettingsPage from '../../../../components/Settings/SettingsPage';
import UpdatePriceListGeneral from '../../../../components/PriceLists/Update/UpdatePriceListGeneral';
import UpdatePriceListFares from '../../../../components/PriceLists/Update/UpdatePriceListFares';
import UpdatePriceListFranchises from '../../../../components/PriceLists/Update/UpdatePriceListFranchises';
import UpdatePriceListDeposits from '../../../../components/PriceLists/Update/UpdatePriceListDeposits';
import UpdatePriceListExtras from '../../../../components/PriceLists/Update/UpdatePriceListExtras';
import UpdatePriceListAdministration from '../../../../components/PriceLists/Update/UpdatePriceListAdministration';
import ElementLabel from '../../../../components/UI/ElementLabel';
import TableHeaderTab from '../../../../components/UI/TableHeaderTab';
import CardsHeader from '../../../../components/UI/CardsHeader';
import WhiteBox from '../../../../components/UI/WhiteBox';

const EditPriceList = () => {
  const params = useParams();
  const history = useHistory();
  const mode = params.id ? 'edit' : 'create';
  const [priceList, setPriceList] = useState(null);

  const [fieldToUpdate, setFieldToUpdate] = useState('generale');

  useEffect(() => {
    fetchPriceList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchPriceList = async () => {
    try {
      if (!params.id) return;
      const response = await http({ url: `/pricing/priceLists/${params.id}` });
      setPriceList(response);
    } catch (err) {
      console.error(err);
      history.goBack();
    }
  };

  const updatePriceList = async (data) => {
    setPriceList(data);
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN]} hasBox={false}>
      <CardsHeader
        title="Listino"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
          },
          {
            children: 'Salva modifiche',
            form: 'priceListForm',
          },
        ]}
      />

      <WhiteBox className="mt-0">
        <div className="flex p-7 gap-x-4">
          <div className="flex-1">
            <div className="text-3xl font-semibold">{priceList?.name}</div>
            <div className="text-md">{priceList?.description}</div>
            <div className="text-sm my-2 text-gray-600">
              {priceList?.validFrom && priceList?.validTo && (
                <>
                  <strong className="font-semibold">Data inizio:</strong>{' '}
                  {new Date(priceList?.validFrom).toLocaleDateString()},{' '}
                </>
              )}
              {priceList?.validFrom && priceList?.validTo && (
                <>
                  <strong className="font-semibold">Data fine:</strong>{' '}
                  {new Date(priceList?.validTo).toLocaleDateString()}
                </>
              )}
            </div>
          </div>
          <div>
            <p className="font-semibold text-gray-600 flex">
              <span className="mr-2 text-sm w-16">Licenza</span>
              <span>
                {priceList?.licenseType === 'movolab' ? (
                  <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>
                ) : (
                  <ElementLabel bgColor="bg-gray-500">Personale</ElementLabel>
                )}
              </span>
            </p>
            <p className="font-semibold text-gray-600 flex mt-1">
              <span className="mr-2 text-sm w-16">Stato</span>
              <span>
                {priceList?.status === 'active' ? (
                  <ElementLabel bgColor="bg-green-600">Attivo</ElementLabel>
                ) : priceList?.status === 'inactive' ? (
                  <ElementLabel bgColor="bg-red-600">Annullato</ElementLabel>
                ) : (
                  ''
                )}
              </span>
            </p>
          </div>
        </div>

        <TableHeaderTab
          buttons={[
            {
              label: 'Generale',
              function: () => setFieldToUpdate('generale'),
              selected: fieldToUpdate === 'generale',
            },
            {
              label: 'Tariffe',
              function: () => setFieldToUpdate('tariffe'),
              selected: fieldToUpdate === 'tariffe',
              disabled: priceList === null,
            },
            {
              label: 'Franchigie',
              function: () => setFieldToUpdate('franchigie'),
              selected: fieldToUpdate === 'franchigie',
              disabled: priceList === null,
            },
            {
              label: 'Deposito',
              function: () => setFieldToUpdate('deposito'),
              selected: fieldToUpdate === 'deposito',
              disabled: priceList === null,
            },
            {
              label: 'Extra',
              function: () => setFieldToUpdate('extra'),
              selected: fieldToUpdate === 'extra',
              disabled: priceList === null,
            },
            {
              label: 'Amministrazione',
              function: () => setFieldToUpdate('amministrazione'),
              selected: fieldToUpdate === 'amministrazione',
              disabled: priceList === null,
            },
          ]}
        />

        <div className="p-6 bg-slate-200 border-4 rounded-b-2xl border-white">
          {fieldToUpdate === 'generale' && (
            <UpdatePriceListGeneral
              mode={mode}
              updatePriceList={updatePriceList}
            ></UpdatePriceListGeneral>
          )}
          {fieldToUpdate === 'tariffe' && <UpdatePriceListFares mode={mode}></UpdatePriceListFares>}
          {fieldToUpdate === 'franchigie' && (
            <UpdatePriceListFranchises mode={mode} type="client"></UpdatePriceListFranchises>
          )}
          {fieldToUpdate === 'deposito' && (
            <UpdatePriceListDeposits
              mode={mode}
              deposits={priceList?.deposits}
            ></UpdatePriceListDeposits>
          )}

          {fieldToUpdate === 'extra' && <UpdatePriceListExtras mode={mode}></UpdatePriceListExtras>}
          {fieldToUpdate === 'amministrazione' && (
            <UpdatePriceListAdministration mode={mode}></UpdatePriceListAdministration>
          )}
        </div>
      </WhiteBox>
    </SettingsPage>
  );
};

export default EditPriceList;
