import React, { useContext, useEffect, useState } from 'react';
import { http, MOVOLAB_ROLE_ADMIN, CLIENT_ROLE_ADMIN } from '../../utils/Utils';
import { UserContext } from '../../store/UserContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { SelectField } from '../Form/SelectField';
import Button from '../UI/buttons/Button';

const UpdateWorkflowsPriceLists = ({ workflowId = null }) => {
  const [priceListsRetrieved, setPriceListsRetrieved] = useState([]);
  const [workflow, setWorkflow] = useState({});

  const form = useForm();
  const params = useParams();

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;
  const isClientAdmin = currentClient?.role === CLIENT_ROLE_ADMIN;
  const allowAdmin =
    isAdmin || (isClientAdmin && workflow?.client?._id === currentClient?.client?._id);

  useEffect(() => {
    fetchWorkflow();
    fetchPriceLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWorkflow = async () => {
    try {
      const response = await http({ url: `/workflow/${workflowId || params.id}?mode=flat` });
      form.setValue('priceLists', response.priceLists);
      setWorkflow(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchPriceLists = async () => {
    try {
      const responseWorkflow = await http({
        url: `/workflow/${workflowId || params.id}?mode=flat`,
      });

      const workflowType = responseWorkflow?.workflowType;
      let response;
      if (workflowType === 'movolab') {
        response = await http({ url: `/pricing/priceLists?licenseType=${workflowType}` });
      } else {
        response = await http({ url: `/pricing/priceLists?client=${responseWorkflow.client._id}` });
      }

      const ids = responseWorkflow.priceLists?.map((priceList) => priceList._id) || [];
      const availablePriceLists = response.priceLists?.filter((priceList) => {
        return !ids.includes(priceList._id);
      });

      if (availablePriceLists?.length > 0) {
        form.setValue('newPriceList', availablePriceLists[0]);
      }

      setPriceListsRetrieved(
        availablePriceLists?.map((priceList) => {
          return {
            value: priceList._id,
            label: `${priceList.name} - Licenza: ${priceList.licenseType}`,
          };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const addPriceList = async (e) => {
    try {
      e.preventDefault();
      if (!allowAdmin) return toast.error('Non hai i permessi per eseguire questa azione');

      const newPriceList = form.getValues('newPriceList');

      const newWorkflow = {
        priceLists: [...(workflow.priceLists || []), newPriceList],
      };

      await http({
        method: 'PUT',
        url: `/workflow/${workflowId || params.id}`,
        form: newWorkflow,
      });
      toast.success('Listino aggiunto con successo');
      await fetchWorkflow();
      await fetchPriceLists();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const removePriceList = async (e, id) => {
    try {
      e.preventDefault();
      if (!allowAdmin) return toast.error('Non hai i permessi per eseguire questa azione');
      const workflow = {
        priceLists: form.getValues('priceLists').filter((priceList) => priceList._id !== id),
      };

      await http({
        method: 'PUT',
        url: `/workflow/${workflowId || params.id}`,
        form: workflow,
      });
      toast.success('Listino rimosso con successo');
      fetchWorkflow();
      fetchPriceLists();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <div className="">
      <div>
        <div>
          <form>
            <fieldset disabled={form.formState.isSubmitting}>
              {workflow && workflow.priceLists && workflow?.priceLists?.length > 0 ? (
                <div>
                  <div className="text-lg font-semibold">Listini</div>
                  <div className="mt-2">
                    {workflow?.priceLists?.map((priceList, index) => {
                      return (
                        <div key={index}>
                          <div className="flex mt-2">
                            <div style={{ width: '400px' }}>
                              <input
                                className="w-full pr-8 py-1 rounded"
                                type="text"
                                value={`${priceList.name} - Licenza ${priceList.licenseType}`}
                                disabled={true}
                              />
                            </div>
                            {allowAdmin && (
                              <div className="ml-2">
                                <Button
                                  type="button"
                                  btnStyle="inFormStyle"
                                  onClick={(e) => {
                                    removePriceList(e, priceList._id);
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
                </div>
              ) : (
                <div className="mt-4">
                  <div className="text-lg font-semibold">
                    Nessun Listino associato a questo workflow
                  </div>
                </div>
              )}
              {allowAdmin && (
                <>
                  {priceListsRetrieved?.length > 0 ? (
                    <div className="mt-4">
                      <div className="text-lg font-semibold">Aggiungi Listino</div>

                      <div className="flex mt-2">
                        <div style={{ width: '400px' }}>
                          <SelectField
                            form={form}
                            name={`newPriceList`}
                            options={priceListsRetrieved}
                            autofocus
                          />
                        </div>
                        <div className="ml-2">
                          <Button
                            type="button"
                            btnStyle="inFormStyle"
                            onClick={(e) => {
                              addPriceList(e);
                            }}
                          >
                            Aggiungi
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4"></div>
                  )}
                </>
              )}
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateWorkflowsPriceLists;
