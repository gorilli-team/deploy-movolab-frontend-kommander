import React, { useContext, useEffect, useState } from 'react';
import { http, MOVOLAB_ROLE_ADMIN } from '../../utils/Utils';
import { UserContext } from '../../store/UserContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { SelectField } from '../Form/SelectField';
import LightGrayButton from '../UI/buttons/LightGrayButton';

const UpdateWorkflowsAgreements = () => {
  const form = useForm();
  const params = useParams();
  const [clients, setClients] = useState([]);
  const [workflow, setWorkflow] = useState({});

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;

  useEffect(() => {
    fetchWorkflow();
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClients = async () => {
    try {
      const response = await http({ url: `/clients/client/all` });

      response.result.sort((a, b) => {
        if (a.ragioneSociale < b.ragioneSociale) {
          return -1;
        }
        if (a.ragioneSociale > b.ragioneSociale) {
          return 1;
        }
        return 0;
      });

      setClients(
        response.result.map((client) => {
          return {
            value: client._id,
            label: `${client.ragioneSociale}`,
          };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const addAgreement = async (e) => {
    try {
      e.preventDefault();

      const data = {
        client: form.getValues('agreement.client'),
        percentage: form.getValues('agreement.percentage'),
      };

      workflow.agreements.push(data);

      await http({
        method: 'PUT',
        url: `/workflow/${params.id}`,
        form: workflow,
      });
      toast.success('Azienda Cliente aggiunta con successo');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchWorkflow = async () => {
    try {
      const response = await http({ url: `/workflow/${params.id}?mode=flat` });
      form.setValue('agreements', response.agreements);
      setWorkflow(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const removeAgreement = async (e, id) => {
    try {
      e.preventDefault();
      const workflow = {
        agreements: form.getValues('clients').filter((client) => client._id !== id),
      };
      await http({
        method: 'PUT',
        url: `/workflow/${params.id}`,
        form: workflow,
      });
      toast.success('Azienda Cliente rimossa con successo');
      setWorkflow(null);
      await fetchWorkflow();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <div className="mt-4">
      <div className="text-lg font-semibold">Convenzioni</div>

      <div className="mt-2">
        {workflow?.agreements?.map((agreement, index) => {
          return (
            <div key={index}>
              <div className="flex mt-2">
                <div className="w-full flex gap-2">
                  <input
                    className="w-full"
                    type="text"
                    value={`${agreement?.client?.ragioneSociale}`}
                    disabled={true}
                  />
                  <input
                    className="w-full"
                    type="text"
                    value={`${agreement?.percentage}%`}
                    disabled={true}
                  />
                </div>
                {isAdmin && (
                  <div className="ml-2">
                    <LightGrayButton
                      type="button"
                      onClick={(e) => {
                        removeAgreement(e, agreement._id);
                      }}
                    >
                      Rimuovi
                    </LightGrayButton>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2">
        <form>
          <fieldset>
            {isAdmin && clients?.length > 0 && (
              <div className="mt-4">
                <div className="text-lg font-semibold">Aggiungi Convenzione</div>

                <div className="flex mt-2">
                  <div style={{ width: '400px' }}>
                    <SelectField
                      form={form}
                      name={`agreement.client`}
                      required={true}
                      label={'Azienda Nolo da Convenzionare'}
                      options={[{ value: '', label: '-- Seleziona Azienda Nolo --' }, ...clients]}
                      autofocus
                    />
                  </div>
                  <div className="ml-2">
                    <SelectField
                      form={form}
                      name={`agreement.percentage`}
                      required={true}
                      label={'Percentuale'}
                      options={[
                        { value: 5, label: '5%' },
                        { value: 10, label: '10%' },
                        { value: 15, label: '15%' },
                        { value: 20, label: '20%' },
                        { value: 25, label: '25%' },
                        { value: 30, label: '30%' },
                      ]}
                      autofocus
                    />
                  </div>

                  <div className="ml-2 mt-7">
                    <LightGrayButton
                      type="button"
                      onClick={(e) => {
                        addAgreement(e);
                      }}
                    >
                      Aggiungi
                    </LightGrayButton>
                  </div>
                </div>
              </div>
            )}
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default UpdateWorkflowsAgreements;
