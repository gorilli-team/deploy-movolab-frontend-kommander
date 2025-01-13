import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';
import SettingsPage from '../../../../components/Settings/SettingsPage';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR, http } from '../../../../utils/Utils';
import { UserContext } from '../../../../../src/store/UserContext';
import PriceListDetails from '../../../../components/PriceLists/PriceListDetails';
import ModalConfirmDialog from '../../../../components/UI/ModalConfirmDialog';
import WhiteBox from '../../../../components/UI/WhiteBox';
import CardsHeader from '../../../../components/UI/CardsHeader';

const PriceList = () => {
  const params = useParams();
  const history = useHistory();
  const [priceList, setPriceList] = useState();
  const [showDuplicatePricelistModal, setShowDuplicatePricelistModal] = useState(false);

  const { data: currentClient } = useContext(UserContext);
  const license = currentClient?.client?.license?.licenseOwner;

  useEffect(() => {
    fetchPriceList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchPriceList = async () => {
    try {
      const response = await http({ url: `/pricing/priceLists/${params.id}` });
      if (!response) {
        throw new Error('Listino non disponibile');
      }
      setPriceList(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Listino non disponibile');
      history.goBack();
    }
  };

  const duplicatePriceList = async () => {
    try {
      if (currentClient?.role !== CLIENT_ROLE_ADMIN) {
        throw new Error('Non hai i permessi per duplicare il listino');
      }
      if (license !== 'client') {
        throw new Error('Non hai i permessi per duplicare il listino');
      }
      const priceList = await http({
        url: `/pricing/priceLists/${params.id}/duplicate`,
        method: 'POST',
      });
      setShowDuplicatePricelistModal(false);
      toast.success('Listino duplicato');
      history.push(`/settings/listini/${priceList._id}`);
    } catch (err) {
      console.error(err);
      setShowDuplicatePricelistModal(false);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} hasBox={false}>
      <CardsHeader
        title="Listino"
        buttons={
          currentClient?.role === CLIENT_ROLE_ADMIN
            ? [
                {
                  btnStyle: 'lightSlateTransparent',
                  children: '« Indietro',
                  onClick: () => history.goBack(),
                },
                {
                  btnStyle: 'lightSlateTransparent',
                  children: 'Duplica',
                  hiddenIf: license !== 'client',
                  onClick: () => setShowDuplicatePricelistModal(true),
                },
                {
                  children: 'Aggiorna',
                  to: `/settings/listini/${params.id}/aggiorna`,
                  hiddenIf: license !== 'client',
                },
              ]
            : []
        }
      />

      <WhiteBox className="mt-0 p-3">
        <PriceListDetails priceList={priceList} />
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
      </WhiteBox>
    </SettingsPage>
  );
};

export default PriceList;
