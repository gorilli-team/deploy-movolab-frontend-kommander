import React, { useContext, useEffect, useState } from 'react';
import { http, MOVOLAB_ROLE_ADMIN, CLIENT_ROLE_ADMIN } from '../../utils/Utils';
import { UserContext } from '../../store/UserContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { SelectField } from '../Form/SelectField';
import Button from '../UI/buttons/Button';

const UpdateWorkflowsUserCompanies = ({ workflowId = null}) => {
  const form = useForm();
  const params = useParams();
  const [userCompanies, setUserCompanies] = useState([]);
  const [workflow, setWorkflow] = useState({});

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;
  const isClientAdmin = currentClient?.role === CLIENT_ROLE_ADMIN;
  const allowAdmin =
    isAdmin || (isClientAdmin && workflow?.client?._id === currentClient?.client?._id);

  useEffect(() => {
    fetchWorkflow();
    fetchUserCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserCompanies = async () => {
    try {
      const response = await http({ url: `/userCompanies` });

      setUserCompanies(
        response.userCompanies.map((userCompany) => {
          return {
            value: userCompany._id,
            label: `${userCompany.ragioneSociale}`,
          };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const addUserCompany = async (e) => {
    try {
      e.preventDefault();
      const newUserCompany = form.getValues('newUserCompany');
      const workflow = {
        userCompanies: [...form.getValues('userCompanies'), newUserCompany],
      };

      await http({
        method: 'PUT',
        url: `/workflow/${workflowId || params.id}`,
        form: workflow,
      });
      toast.success('Azienda Cliente aggiunta con successo');
      await fetchWorkflow();
      await fetchUserCompanies();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchWorkflow = async () => {
    try {
      const response = await http({ url: `/workflow/${workflowId || params.id}?mode=flat` });
      form.setValue('userCompanies', response.userCompanies);
      setWorkflow(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const removeUserCompany = async (e, id) => {
    try {
      e.preventDefault();
      const workflow = {
        userCompanies: form
          .getValues('userCompanies')
          .filter((userCompany) => userCompany._id !== id),
      };
      await http({
        method: 'PUT',
        url: `/workflow/${workflowId || params.id}`,
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
    <div>
      <div className="text-lg font-semibold">Clienti</div>

      <div className="mt-2">
        {workflow?.userCompanies?.map((userCompany, index) => {
          return (
            <div key={index}>
              <div className="flex mt-2">
                <div className="w-full">
                  <input
                    className="w-full py-1 rounded"
                    type="text"
                    value={`${userCompany.ragioneSociale}`}
                    disabled={true}
                  />
                </div>
                {allowAdmin && (
                  <div className="ml-2">
                    <Button
                      btnStyle="inFormStyle"
                      type="button"
                      onClick={(e) => {
                        removeUserCompany(e, userCompany._id);
                      }}
                    >
                      Rimuovi
                    </Button>
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
            {allowAdmin && userCompanies?.length > 0 && (
              <div className="mt-4">
                <div className="text-lg font-semibold">Aggiungi Cliente</div>

                <div className="flex mt-2">
                  <div style={{ width: '400px' }}>
                    <SelectField
                      form={form}
                      name={`newUserCompany`}
                      options={[{ value: '', label: '-- Seleziona --' }, ...userCompanies]}
                      autofocus
                    />
                  </div>
                  <div className="ml-2">
                    <Button
                      btnStyle="inFormStyle"
                      type="button"
                      onClick={(e) => {
                        addUserCompany(e);
                      }}
                    >
                      Aggiungi
                    </Button>
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

export default UpdateWorkflowsUserCompanies;
