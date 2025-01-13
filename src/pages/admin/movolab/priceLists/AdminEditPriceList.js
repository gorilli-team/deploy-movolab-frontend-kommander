import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../../utils/Utils';
import Button from '../../../../components/UI/buttons/Button';

import AdminPage from '../../../../components/Admin/AdminPage';
import UpdatePriceListAdministration from '../../../../components/PriceLists/Update/UpdatePriceListAdministration';
import UpdatePriceListDeposits from '../../../../components/PriceLists/Update/UpdatePriceListDeposits';
import UpdatePriceListExtras from '../../../../components/PriceLists/Update/UpdatePriceListExtras';
import UpdatePriceListFares from '../../../../components/PriceLists/Update/UpdatePriceListFares';
import UpdatePriceListFranchises from '../../../../components/PriceLists/Update/UpdatePriceListFranchises';
import UpdatePriceListGeneral from '../../../../components/PriceLists/Update/UpdatePriceListGeneral';

const AdminEditPriceList = () => {
  const params = useParams();
  const history = useHistory();
  const [priceList, setPriceList] = useState(null);

  const search = useLocation().search;
  const section = new URLSearchParams(search).get('section');
  const groupToVisualize = new URLSearchParams(search).get('group');

  const mode = params.id ? 'edit' : 'create';

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

  const [fieldToUpdate, setFieldToUpdate] = useState(section || 'generale');

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <div className="p-2">
        <div className="flex flex-wrap px-2">
          <div className="pr-4 pt-2">
            <Button btnStyle={'lightGray'} onClick={() => history.goBack()}>
              Indietro
            </Button>
          </div>
          {mode === 'edit' && (
            <>
              <div className="pr-4 pt-2">
                <Button
                  btnStyle={'gray'}
                  selected={fieldToUpdate === 'generale'}
                  onClick={() => {
                    setFieldToUpdate('generale');
                  }}
                >
                  Generale
                </Button>
              </div>
              <div className="pr-4 pt-2">
                <Button
                  btnStyle={'gray'}
                  selected={fieldToUpdate === 'tariffe'}
                  onClick={() => {
                    setFieldToUpdate('tariffe');
                  }}
                >
                  Tariffe
                </Button>
              </div>
              <div className="pr-4 pt-2">
                <Button
                  btnStyle={'gray'}
                  selected={fieldToUpdate === 'franchigie'}
                  onClick={() => {
                    setFieldToUpdate('franchigie');
                  }}
                >
                  Franchigie
                </Button>
              </div>
              <div className="pr-4 pt-2">
                <Button
                  btnStyle={'gray'}
                  selected={fieldToUpdate === 'deposito'}
                  onClick={() => {
                    setFieldToUpdate('deposito');
                  }}
                >
                  Deposito
                </Button>
              </div>
              <div className="pr-4 pt-2">
                <Button
                  btnStyle={'gray'}
                  selected={fieldToUpdate === 'extra'}
                  onClick={() => {
                    setFieldToUpdate('extra');
                  }}
                >
                  Extra
                </Button>
              </div>
              <div className="pr-4 pt-2">
                <Button
                  btnStyle={'gray'}
                  selected={fieldToUpdate === 'amministrazione'}
                  onClick={() => {
                    setFieldToUpdate('amministrazione');
                  }}
                >
                  Amministrazione
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="mb-4 mt-4 px-2">
          {fieldToUpdate === 'generale' && (
            <UpdatePriceListGeneral mode={mode}></UpdatePriceListGeneral>
          )}
          {fieldToUpdate === 'tariffe' && (
            <UpdatePriceListFares
              mode={mode}
              groupToVisualize={groupToVisualize}
            ></UpdatePriceListFares>
          )}
          {fieldToUpdate === 'franchigie' && (
            <UpdatePriceListFranchises
              mode={mode}
              type="admin"
              groupToVisualize={groupToVisualize}
            ></UpdatePriceListFranchises>
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
      </div>
    </AdminPage>
  );
};

export default AdminEditPriceList;
