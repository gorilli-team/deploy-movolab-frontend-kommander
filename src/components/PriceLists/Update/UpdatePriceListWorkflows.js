import React, { useEffect, useState } from 'react';
import { http } from '../../../utils/Utils';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { SelectField } from '../../Form/SelectField';
import LightGrayButton from '../../UI/buttons/LightGrayButton';
import WhiteButton from '../../UI/buttons/WhiteButton';
import GrayButton from '../../UI/buttons/GrayButton';

const UpdatePriceListWorkflows = (props) => {
  const [workflowsAvailable, setWorkflowsAvailable] = useState([]);
  const [priceList, setPriceList] = useState({ workflows: [] });
  const form = useForm();
  const params = useParams();

  useEffect(() => {
    fetchPriceList();
    fetchWorkflows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPriceList = async () => {
    try {
      const response = await http({ url: `/pricing/priceLists/${params.id}?mode=flat` });
      setPriceList(response);
      form.setValue('workflows', response.workflows);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchWorkflows = async () => {
    try {
      const response = await http({ url: '/workflow' });
      setWorkflowsAvailable(
        response.workflows.map((workflow) => {
          return {
            value: workflow._id,
            label: `${workflow.name}`,
          };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onSubmit = async (input) => {
    const data = { workflows: input.workflows.filter((workflow) => workflow !== '') };

    try {
      await http({
        method: 'PUT',
        url: `/pricing/priceLists/${params.id}`,
        form: data,
      });
      toast.success('Listino aggiornato');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <div className="mb-4">
      <div className="text-xl font-bold">Flusso</div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={form.formState.isSubmitting}>
          {workflowsAvailable.length > 0 &&
            priceList?.workflows.map((workflow, index) => {
              return (
                <div className="flex" key={index}>
                  <div style={{ width: '400px' }} key={index}>
                    <SelectField
                      form={form}
                      name={`workflows[${index}]`}
                      placeholder="Seleziona flusso"
                      options={workflowsAvailable}
                    />
                  </div>
                  <div className="ml-2">
                    <LightGrayButton
                      type="button"
                      onClick={() => {
                        const updatedPriceList = {
                          ...priceList,
                          workflows: priceList.workflows.splice(1, index),
                        };
                        setPriceList(updatedPriceList);
                        form.setValue('workflows', updatedPriceList.workflows);
                      }}
                    >
                      Rimuovi
                    </LightGrayButton>
                  </div>
                </div>
              );
            })}

          <div>
            <WhiteButton
              type="button"
              onClick={() => {
                const updatedPriceList = {
                  ...priceList,
                  workflows: [...priceList.workflows, ''],
                };
                setPriceList(updatedPriceList);
                form.setValue('workflows', updatedPriceList.workflows);
              }}
            >
              Aggiungi uno
            </WhiteButton>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-wrap -mx-3 mt-6 ">
              <div className="w-60 px-3">
                <GrayButton>Salva</GrayButton>
              </div>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default UpdatePriceListWorkflows;
