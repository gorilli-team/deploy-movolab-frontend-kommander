import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { http } from '../../../utils/Utils';

import { TextField } from '../../Form/TextField';
import { SelectField } from '../../Form/SelectField';
import FormLabel from '../../UI/FormLabel';
import Button from '../../UI/buttons/Button';
import WhiteButton from '../../UI/buttons/WhiteButton';

const UpdatePackGeneral = (props) => {
  const form = useForm();
  const params = useParams();
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const [pack, setPack] = useState({});
  const mode = params.id ? 'edit' : 'create';

  useEffect(() => {
    fetchPack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchPack = async () => {
    try {
      if (props.mode === 'edit') {
        const response = await http({ url: `/clientPayments/packs/${params.id}` });

        setPack(response);
        form.setValue('name', response.name);
        form.setValue('licenseType', response.licenseType);
        form.setValue('paymentPeriod', response.paymentPeriod);
        form.setValue('status', response.status);
        form.setValue('visible', response.visible);
        form.setValue('fee', response.fee);
        form.setValue('params.includedRentalLocations', response.params?.includedRentalLocations);
        form.setValue('params.includedVehicles', response.params?.includedVehicles);
        form.setValue('params.includedMonthlyRents', response.params?.includedMonthlyRents);
        form.setValue('params.includedComodati', response.params?.includedComodati);
        form.setValue('params.includedMNP', response.params?.includedMNP);

        form.setValue(
          'variablePayments.extraRentalLocationFee',
          response.variablePayments?.extraRentalLocationFee,
        );
        form.setValue(
          'variablePayments.extraVehicleFee',
          response.variablePayments?.extraVehicleFee,
        );

        form.setValue(
          'variablePayments.extraMonthlyRentFee',
          response.variablePayments?.extraMonthlyRentFee,
        );
        form.setValue(
          'variablePayments.extraComodatoFee',
          response.variablePayments?.extraComodatoFee,
        );
        form.setValue('variablePayments.extraMNPFee', response.variablePayments?.extraMNPFee);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const openModal = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const removePack = async (e) => {
    e.preventDefault();
    try {
      await http({
        method: 'DELETE',
        url: `/clientPayments/packs/${params.id}`,
      });
      toast.success('Pack eliminato');
      history.push('/admin/packs');
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Errore');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (props.mode === 'create') {
        data = {
          ...data,
        };

        //eslint-disable-next-line
        const result = await http({
          method: 'POST',
          url: '/clientPayments/packs',
          form: data,
        });
        toast.success('Pack creato');
        history.push(`/admin/packs`);
      } else if (props.mode === 'edit') {
        await http({
          method: 'PUT',
          url: `/clientPayments/packs/${params.id}`,
          form: data,
        });
        toast.success('Pack aggiornato');
        history.push(`/admin/packs/${params.id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-5">
        {!params.id || params.id === 'crea' ? (
          <span className="font-bold">Creazione Pack</span>
        ) : (
          <>
            <span>{pack?.name}:</span> <span className="font-bold">Aggiornamento Pack</span>
          </>
        )}
        <fieldset disabled={form.formState.isSubmitting} className="space-y-0">
          <div className="flex flex-wrap">
            <div className="w-96 mr-2">
              <FormLabel className="block text-gray-700 text-sm font-bold mb-2">Nome</FormLabel>
              <TextField
                form={form}
                name="name"
                type="text"
                placeholder="Nome Pack"
                validation={{
                  required: { value: true, message: 'Nome Pack' },
                }}
              />
            </div>
            <div className="w-96 mr-2">
              <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                Tipo Licenza
              </FormLabel>
              <SelectField
                form={form}
                name="licenseType"
                placeholder="Tipo Licenza"
                validation={{
                  required: {
                    value: true,
                    message: 'Inserisci Tipo Licenza',
                  },
                }}
                options={[
                  { label: 'Movolab', value: 'movolab' },
                  { label: 'Cliente', value: 'client' },
                ]}
              />
            </div>
          </div>
          <div className="flex flex-wrap">
            <div className="w-64 mr-2">
              <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                Periodicità
              </FormLabel>
              <SelectField
                form={form}
                name="paymentPeriod"
                placeholder="Periodicità"
                validation={{
                  required: {
                    value: true,
                    message: 'Inserisci Periodicità',
                  },
                }}
                options={[
                  { label: 'Mensile', value: 'monthly' },
                  { label: 'Annuale', value: 'yearly' },
                ]}
              />
            </div>
            <div className="w-64 mr-2">
              <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                Visibilità Onboarding
              </FormLabel>
              <SelectField
                form={form}
                name="visible"
                placeholder="-"
                validation={{
                  required: {
                    value: true,
                    message: 'Inserisci Visibilità',
                  },
                }}
                options={[
                  { label: 'Visibile in onboarding', value: true },
                  { label: 'Nascosto in onboarding', value: false },
                ]}
              />
            </div>
            <div className="w-64 mr-2">
              <FormLabel className="block text-gray-700 text-sm font-bold mb-2">Stato</FormLabel>
              <SelectField
                form={form}
                name="status"
                placeholder="Stato"
                validation={{
                  required: {
                    value: true,
                    message: 'Inserisci Stato',
                  },
                }}
                options={[
                  { label: 'ATTIVO', value: 'active' },
                  { label: 'INATTIVO', value: 'inactive' },
                ]}
              />
            </div>
            <div className="w-32 mr-2">
              <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                Tariffa Base (Euro)
              </FormLabel>
              <TextField
                form={form}
                name="fee"
                type="number"
                placeholder="Tariffa Base"
                validation={{
                  required: { value: true, message: 'Tariffa Base' },
                }}
              />
            </div>
          </div>

          <div className="mt-4">
            <p className="font-semibold text-gray-600 flex mt-1">
              <span className="mr-2 w-60 text-xl">Extra</span>
            </p>
            <div className="flex flex-wrap">
              <div className="flex w-96 flex-wrap mr-2">
                <div className="flex-1 mr-2">
                  <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                    Punti Nolo Inclusi
                  </FormLabel>
                  <TextField
                    form={form}
                    name="params.includedRentalLocations"
                    type="text"
                    placeholder="Punti Nolo Inclusi"
                  />
                </div>
                <div className="flex-1">
                  <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                    Punto Nolo extra (Euro){' '}
                  </FormLabel>
                  <TextField
                    form={form}
                    name="variablePayments.extraRentalLocationFee"
                    placeholder="Costo Punto Nolo extra"
                  />
                </div>
              </div>
              <div className="flex w-96 flex-wrap mr-2">
                <div className="flex-1 mr-2">
                  <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                    Veicoli Inclusi
                  </FormLabel>
                  <TextField
                    form={form}
                    name="params.includedVehicles"
                    type="text"
                    placeholder="Veicoli Inclusi"
                  />
                </div>
                <div className="flex-1">
                  <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                    Veicolo extra (Euro){' '}
                  </FormLabel>
                  <TextField
                    form={form}
                    name="variablePayments.extraVehicleFee"
                    placeholder="Costo Veicolo extra"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap">
              <div className="flex w-96 flex-wrap mr-2">
                <div className="flex-1 mr-2">
                  <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                    Noleggi Inclusi
                  </FormLabel>
                  <TextField
                    form={form}
                    name="params.includedMonthlyRents"
                    type="text"
                    placeholder="Noleggi Inclusi"
                  />
                </div>
                <div className="flex-1">
                  <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                    Noleggio extra (Euro){' '}
                  </FormLabel>
                  <TextField
                    form={form}
                    name="variablePayments.extraMonthlyRentFee"
                    placeholder="Costo Punto Nolo extra"
                  />
                </div>
              </div>
              <div className="flex w-96 flex-wrap mr-2">
                <div className="flex-1 mr-2">
                  <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                    Comodati Inclusi
                  </FormLabel>
                  <TextField
                    form={form}
                    name="params.includedComodati"
                    type="text"
                    placeholder="Comodati Inclusi"
                  />
                </div>
                <div className="flex-1">
                  <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                    Comodato extra (Euro){' '}
                  </FormLabel>
                  <TextField
                    form={form}
                    name="variablePayments.extraComodatoFee"
                    placeholder="Costo Comodato extra"
                  />
                </div>
              </div>
              <div className="flex w-96 flex-wrap mr-2">
                <div className="flex-1 mr-2">
                  <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                    MNP Inclusi
                  </FormLabel>
                  <TextField
                    form={form}
                    name="params.includedMNP"
                    type="text"
                    placeholder="MNP Inclusi"
                  />
                </div>
                <div className="flex-1">
                  <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                    MNP extra (Euro){' '}
                  </FormLabel>
                  <TextField
                    form={form}
                    name="variablePayments.extraMNPFee"
                    placeholder="Costo MNP extra"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-wrap -mx-3 mt-6 ">
              <div className="w-full px-3">
                {mode === 'edit' ? (
                  <div className="flex space-x-2">
                    <Button btnStyle="">Aggiorna Pack</Button>
                    <Button
                      btnStyle="white"
                      className="!text-red-500"
                      onClick={(e) => openModal(e)}
                    >
                      Rimuovi Pack
                    </Button>
                  </div>
                ) : (
                  <Button className=" text-white font-bold py-2 px-4 rounded">Crea Pack</Button>
                )}
              </div>
            </div>
          </div>
        </fieldset>
      </form>
      {showModal ? (
        <div className="justify-center items-center flex fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="relative my-6 mx-auto w-3xl max-w-3xl">
            {/*content*/}
            <div className="border-2 border-gray-600 rounded-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/*header*/}
              <div className="flex items-start justify-between p-3 border-b border-solid border-gray-600 rounded-t">
                <div className="flex">
                  <h3 className="text-xl font-semibold mt-3 mr-4">Rimozione Pack</h3>
                </div>
                <WhiteButton className="p-2" onClick={closeModal}>
                  x
                </WhiteButton>
              </div>
              {/*body*/}
              <div className="relative p-6 flex-auto">
                <div>
                  Sei sicuro di voler rimuovere il Pack <strong>{form.watch('name')}</strong>?
                </div>
                <div className="flex space-x-2 mt-4">
                  <WhiteButton
                    type="submit"
                    onClick={() => {
                      setShowModal(false);
                    }}
                  >
                    Annulla
                  </WhiteButton>
                  <Button
                    btnStyle="white"
                    className="!text-red-500"
                    type="submit"
                    onClick={(e) => {
                      removePack(e);
                    }}
                  >
                    Rimuovi
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default UpdatePackGeneral;
