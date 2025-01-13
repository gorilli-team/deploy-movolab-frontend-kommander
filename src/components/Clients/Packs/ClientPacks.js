import React, { useEffect, useState } from 'react';
import FormLabel from '../../../components/UI/FormLabel';
import Button from '../../../components/UI/buttons/Button';
import { SelectField } from '../../../components/Form/SelectField';
import { http } from '../../../utils/Utils';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import DisplayDateTime from '../../../components/UI/dates/DisplayDateTime';
import ModalConfirmDialog from '../../../components/UI/ModalConfirmDialog';
import { convertPrice } from '../../../utils/Prices';

const ClientPacks = ({ client, isVisible, switchTo }) => {
  const [packsCount, setPacksCount] = useState([]); // eslint-disable-line no-unused-vars
  const [availablePacks, setAvailablePacks] = useState([]);
  const [confirmPackModal, setConfirmPackModal] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [clientData, setClientData] = useState(client);
  const mapPeriod = (period) => {
    switch (period) {
      case 'monthly':
        return 'Mensile';
      case 'quarterly':
        return 'Trimestrale';
      case 'biannual':
        return 'Semestrale';
      case 'yearly':
        return 'Annuale';
      default:
        return '';
    }
  };

  const form = useForm();

  const updateClientPack = async (packId) => {
    try {
      await http({
        url: `/clients/client/${clientData._id}/pack`,
        method: 'PUT',
        form: {
          packId,
        },
      });
      await fetchClient();
      toast.success('Pack associato con successo');
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Errore');
    }
  };

  const fetchClient = async () => {
    try {
      const response = await http({
        method: 'GET',
        url: `/clients/client/${clientData._id}`,
      });
      setClientData(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchClient();
    }
  }, [isVisible]);

  useEffect(() => {
    fetchPacks();
  }, [client, clientData]);

  const fetchPacks = async () => {
    try {
      const response = await http({ url: '/clientPayments/packs' });

      setPacksCount(response.count);
      if (clientData?.license?.licenseOwner === 'movolab') {
        setAvailablePacks(response.packs.filter((pack) => pack.licenseType === 'movolab'));
      }
      if (clientData?.license?.licenseOwner === 'client') {
        setAvailablePacks(response.packs.filter((pack) => pack.licenseType === 'client'));
      }

      form.setValue('pack', clientData?.currentPack?._id);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };
  return (
    <div className="flex flex-col">
      <div className="text-2xl font-semibold">Pack</div>
      {!clientData?.license || !clientData?.license?.licenseOwner ? (
        <div
          className="bg-yellow-50 border-l-2 border-yellow-500 text-yellow-700 p-4 mb-4 mt-4"
          role="alert"
        >
          <p className="font-bold">Attenzione</p>
          <p>
            Non è possibile aggiungere un Pack poiché la Licenza è mancante. Si prega di aggiungere
            prima una Licenza al cliente dalla sezione Impostazioni.
          </p>
          <Button className="mt-2" btnStyle="whiteLightButton" onClick={() => switchTo('settings')}>
            Vai alle Impostazioni
          </Button>
        </div>
      ) : (
        <div className="flex mt-2">
          <div className="w-[400px] pr-3 mr-5">
            <FormLabel>Seleziona Pack</FormLabel>
            <SelectField
              name="pack"
              form={form}
              options={
                availablePacks.map((pack) => ({
                  value: pack._id,
                  label: pack.name,
                })) || []
              }
              placeholder="Seleziona Pack"
              onChangeFunction={(e) => {
                e.preventDefault();
                setSelectedPack(availablePacks.find((pack) => pack._id === e.target.value));
                setConfirmPackModal(true);
              }}
            />
          </div>
        </div>
      )}
      {clientData?.currentPack && (
        <>
          <div className="w-full md:w-96">
            <FormLabel>Piano Selezionato</FormLabel>
            <div className="bg-white border border-gray-900 rounded p-2.5 text-gray-900">
              <div>
                {clientData?.currentPack?.name} -{' '}
                {clientData?.currentPack?.licenseType === 'client' ? 'Licenziatario' : 'Movolab'}
              </div>
              <div>Periodo di Pagamento: {mapPeriod(clientData?.currentPack?.paymentPeriod)}</div>
              <div>Tariffa Base: {convertPrice(clientData?.currentPack?.fee)}</div>
            </div>
          </div>

          <div className="w-full md:w-full">
            <FormLabel>Extra</FormLabel>
            <div className="bg-white border border-gray-900 rounded p-2.5 text-gray-900">
              <div className="flex">
                <span className="mr-2 w-60">Punti Nolo inclusi:</span>
                <span className="mr-2 w-60">
                  {clientData?.currentPack?.params?.includedRentalLocations}
                </span>
                <span className="mr-2 w-60">Punto Nolo extra:</span>
                <span className="mr-2 w-60">
                  {convertPrice(clientData?.currentPack?.variablePayments?.extraRentalLocationFee)}
                </span>
              </div>

              <div className="flex">
                <span className="mr-2 w-60">Veicoli inclusi:</span>
                <span className="mr-2 w-60">
                  {clientData?.currentPack?.params?.includedVehicles}
                </span>
                <span className="mr-2 w-60">Veicolo extra:</span>
                <span className="mr-2 w-60">
                  {convertPrice(clientData?.currentPack?.variablePayments?.extraVehicleFee)}
                </span>
              </div>
              <div className="flex">
                <span className="mr-2 w-60">Noleggi Mensili:</span>
                <span className="mr-2 w-60">
                  {clientData?.currentPack?.params?.includedMonthlyRents}
                </span>
                <span className="mr-2 w-60">Noleggio extra:</span>
                <span className="mr-2 w-60">
                  {convertPrice(clientData?.currentPack?.variablePayments?.extraMonthlyRentFee)}
                </span>
              </div>
              <div className="flex">
                <span className="mr-2 w-60">Comodati Mensili:</span>
                <span className="mr-2 w-60">
                  {clientData?.currentPack?.params?.includedComodati}
                </span>
                <span className="mr-2 w-60">Costo comodato extra:</span>
                <span className="mr-2 w-60">
                  {convertPrice(clientData?.currentPack?.variablePayments?.extraComodatoFee)}
                </span>
              </div>
              <div className="flex">
                <span className="mr-2 w-60">MNP Mensili:</span>
                <span className="mr-2 w-60">{clientData?.currentPack?.params?.includedMNP}</span>
                <span className="mr-2 w-60">MNP extra:</span>
                <span className="mr-2 w-60">
                  {convertPrice(clientData?.currentPack?.variablePayments?.extraMNPFee)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
      {clientData?.packHistory && clientData?.packHistory?.length > 0 && (
        <div className="flex mt-2">
          <div className="w-full pr-3 mr-5 mt-5">
            <div className="text-xl font-semibold">Storico Packs</div>
            <div className="flex flex-col">
              {clientData?.packHistory
                ?.slice()
                .reverse()
                .map((pack) => (
                  <div key={pack._id} className="flex items-center py-1 border-b border-gray-200">
                    <div className="w-60 font-semibold">{pack?.pack?.name}</div>
                    <div className="px-5 flex w-60">
                      Da: <DisplayDateTime date={pack.startDate} displayType={'flat'} />
                    </div>
                    <div className="px-5 flex w-60">
                      A:{' '}
                      {pack?.endDate ? (
                        <DisplayDateTime date={pack.endDate} displayType={'flat'} />
                      ) : (
                        'In corso'
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      <ModalConfirmDialog
        headerChildren="Modifica Pack associato al cliente"
        title={`Vuoi associare al cliente il pack: ${selectedPack?.name}`}
        description={
          <>
            Il nuovo pack avrà un costo base di {convertPrice(selectedPack?.fee)}{' '}
            {selectedPack?.paymentPeriod === 'monthly' ? 'mensili' : 'annuali'} <br />
            <br />
            Punti Nolo inclusi: {selectedPack?.params?.includedRentalLocations}, extra{' '}
            {convertPrice(selectedPack?.variablePayments?.extraRentalLocationFee)}
            <br />
            Veicoli inclusi: {selectedPack?.params?.includedVehicles}, extra{' '}
            {convertPrice(selectedPack?.variablePayments?.extraVehicleFee)}
            <br />
            Noleggi mensili: {selectedPack?.params?.includedMonthlyRents}, extra{' '}
            {convertPrice(selectedPack?.variablePayments?.extraMonthlyRentFee)}
            <br />
            Comodati mensili: {selectedPack?.params?.includedComodati}, extra{' '}
            {convertPrice(selectedPack?.variablePayments?.extraComodatoFee)}
            <br />
            MNP mensili: {selectedPack?.params?.includedMNP}, extra{' '}
            {convertPrice(selectedPack?.variablePayments?.extraMNPFee)}`
          </>
        }
        okText="Si, modifica"
        isVisible={confirmPackModal}
        handleOk={() => {
          updateClientPack(selectedPack?._id);
          setConfirmPackModal(false);
        }}
        handleCancel={() => {
          setConfirmPackModal(false);
        }}
      />
    </div>
  );
};

export default ClientPacks;
