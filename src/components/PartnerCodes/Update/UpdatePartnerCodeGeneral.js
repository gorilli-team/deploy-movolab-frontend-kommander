import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useParams, useHistory } from 'react-router-dom';
import { http } from '../../../utils/Utils';
import validator from 'validator'; // Add the validator package

import { TextField } from '../../Form/TextField';
import { MultipleSelectField } from '../../Form/MultipleSelectField';
import FormLabel from '../../UI/FormLabel';
import Button from '../../UI/buttons/Button';
import Modal from '../../UI/Modal';

const UpdatePartnerCodeGeneral = (props) => {
  const form = useForm();
  const params = useParams();
  const history = useHistory();
  const mode = params.id ? 'edit' : 'create';

  const [partnersData, setPartnersData] = useState([]);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);

  useEffect(() => {
    fetchPartnerCode();
    fetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchPartnerCode = async () => {
    try {
      if (props.mode === 'edit') {
        const response = await http({ url: `/partnerCode/${params.id}` });

        form.setValue('code', response.code);
        form.setValue('agent', response.agent);
        form.setValue('maxUses', response.maxUses);
        form.setValue('partnerUrl', response.partnerUrl);

        form.setValue(
          'partners',
          response.partners.map((partner) => {
            return { value: partner._id, label: partner.name };
          }),
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await http({ url: `/partner` });
      const partnersNames = response.partners.map((partner) => {
        return { value: partner._id, label: partner.name };
      });
      setPartnersData(partnersNames);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const createPartner = async (data) => {
    try {
      await http({
        method: 'POST',
        url: '/partner',
        form: data,
      });
      toast.success('Partner creato');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (!data.partners) {
        data.partners = [];
      } else {
        const partners = data.partners?.map((partner) => partner.value);
        data = {
          ...data,
          partners,
        };
      }

      if (props.mode === 'create') {
        //eslint-disable-next-line
        const result = await http({
          method: 'POST',
          url: '/partnerCode',
          form: data,
        });
        toast.success('Codice Partner creato');
        history.push(`/admin/codicipartner`);
      } else if (props.mode === 'edit') {
        await http({
          method: 'PUT',
          url: `/partnerCode/${params.id}`,
          form: data,
        });
        toast.success('Codice Partner aggiornato');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6 bg-white rounded shadow-md">
        {!params.id || params.id === 'crea' ? (
          <span className="font-bold">Creazione Codice Partner</span>
        ) : (
          <>
            <span className="font-bold">Aggiornamento Codice Partner</span>
          </>
        )}
        <fieldset disabled={form.formState.isSubmitting} className="space-y-0">
          <div className="flex flex-wrap">
            <div className="w-96 mr-2">
              <FormLabel className="block text-gray-700 text-sm font-bold mb-2">Codice</FormLabel>
              <TextField
                form={form}
                name="code"
                type="text"
                placeholder="Codice"
                validation={{
                  required: { value: true, message: 'Codice' },
                }}
              />
            </div>
            <div className="flex flex-wrap">
              <div className="w-96 mr-2">
                <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                  Partner Associati
                </FormLabel>
                <div className="flex space-x-2">
                  {partnersData && partnersData.length > 0 && (
                    <div className="w-96 mr-2">
                      <MultipleSelectField
                        className="flex-1"
                        name={'partners'}
                        form={form}
                        options={partnersData}
                        placeholder="Partners"
                      />
                    </div>
                  )}
                  <div className="w-32 mr-2">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowAddPartnerModal(true);
                        form.setValue('name', '');
                      }}
                      btnStyle="lightSlate"
                    >
                      Crea Nuovo Partner
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap">
            <div className="w-96 mr-2">
              <FormLabel className="block text-gray-700 text-sm font-bold mb-2">Agente</FormLabel>
              <TextField form={form} name="agent" type="text" placeholder="Agente" />
            </div>
            <div className="w-96 mr-2">
              <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                Utilizzi Massimi
              </FormLabel>
              <TextField form={form} name="maxUses" type="number" placeholder="Utilizzi Massimi" />
            </div>
          </div>
          <div className="flex flex-wrap">
            <div className="w-96 mr-2">
              <FormLabel className="block text-gray-700 text-sm font-bold mb-2">
                Partner Link
              </FormLabel>
              <TextField
                form={form}
                name="partnerUrl"
                type="text"
                placeholder="Partner Link"
                validation={{
                  validate: (value) => validator.isURL(value) || 'Inserisci un URL valido',
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-wrap -mx-3 mt-6 ">
              <div className="w-full px-3">
                {mode === 'edit' ? (
                  <div className="flex space-x-2">
                    <Button btnStyle="">Aggiorna Codice Partner</Button>
                  </div>
                ) : (
                  <Button className=" text-white font-bold py-2 px-4 rounded">
                    Crea Codice Partner
                  </Button>
                )}
              </div>
            </div>
          </div>
        </fieldset>
      </form>
      <Modal
        isVisible={showAddPartnerModal}
        onClose={() => setShowAddPartnerModal(false)}
        headerChildren={'Aggiungi Partner'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createPartner(form.getValues());
            setShowAddPartnerModal(false);
          }}
        >
          <div>
            <div className="flex flex-wrap">
              <div className="w-96 mr-2">
                <FormLabel className="block text-gray-700 text-sm font-bold mb-2">Nome</FormLabel>
                <TextField
                  form={form}
                  name="name"
                  type="text"
                  placeholder="Nome"
                  validation={{
                    required: { value: true, message: 'Nome' },
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-wrap -mx-3 mt-6 ">
                <div className="w-full px-3">
                  <Button btnStyle="blue">Aggiungi Partner</Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UpdatePartnerCodeGeneral;
