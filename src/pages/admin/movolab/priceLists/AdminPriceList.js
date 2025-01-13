import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../../utils/Utils';
import { UserContext } from '../../../../store/UserContext';

import AdminPage from '../../../../components/Admin/AdminPage';
import Button from '../../../..//components/UI/buttons/Button';
import ModalConfirmDialog from '../../../../components/UI/ModalConfirmDialog';

import PriceListDetails from '../../../../components/PriceLists/PriceListDetails';

const AdminPriceList = () => {
  const params = useParams();
  const history = useHistory();
  const [priceList, setPriceList] = useState({});
  const [showDuplicatePricelistModal, setShowDuplicatePricelistModal] = useState(false);

  const { data: currentClient } = useContext(UserContext);
  const license = currentClient?.client?.license?.licenseOwner;
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;

  useEffect(() => {
    fetchPriceList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchPriceList = async () => {
    try {
      const response = await http({ url: `/pricing/priceLists/${params.id}` });
      setPriceList(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const duplicatePriceList = async () => {
    try {
      const priceList = await http({
        url: `/pricing/priceLists/${params.id}/duplicate`,
        method: 'POST',
      });
      setShowDuplicatePricelistModal(false);
      toast.success('Listino duplicato');
      history.push(`/admin/movolab/listini/${priceList._id}`);
    } catch (err) {
      console.error(err);
      setShowDuplicatePricelistModal(false);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <div className="p-4 w-full">
        <div className="flex space-x-4">
          <Button btnStyle={'lightGray'} onClick={() => history.goBack()}>
            Indietro
          </Button>
          {isAdmin && (
            <Button
              btnStyle={'lightGray'}
              onClick={() => {
                setShowDuplicatePricelistModal(true);
              }}
            >
              Duplica
            </Button>
          )}

          {(license === 'client' || isAdmin) && (
            <Button to={`/admin/movolab/listini/${params.id}/aggiorna`}>Aggiorna</Button>
          )}
        </div>

        <PriceListDetails priceList={priceList} />

        <div className="mb-4 mt-2"></div>
      </div>

      <ModalConfirmDialog
        isVisible={showDuplicatePricelistModal}
        headerChildren="Stai per duplicare il listino"
        title="Duplica listino"
        description="Sei sicuro di voler duplicare il listino?"
        okText="Duplica"
        handleCancel={() => {
          setShowDuplicatePricelistModal(false);
        }}
        handleOk={() => {
          duplicatePriceList();
        }}
      />
    </AdminPage>
  );
};

export default AdminPriceList;
