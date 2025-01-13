import React, { useContext, useEffect, useState } from 'react';
import { http, MOVOLAB_ROLE_ADMIN, CLIENT_ROLE_ADMIN } from '../../utils/Utils';
import { UserContext } from '../../store/UserContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { SelectField } from '../Form/SelectField';
import { TextField } from '../Form/TextField';
import FormLabel from '../UI/FormLabel';
import Button from '../UI/buttons/Button';

const UpdateWorkflowsExtraFields = ({ workflowId = null}) => {
  const [workflow, setWorkflow] = useState({});
  const [addNewExtraField, setAddNewExtraField] = useState(false);

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;
  const isClientAdmin = currentClient?.role === CLIENT_ROLE_ADMIN;
  const allowAdmin =
    isAdmin || (isClientAdmin && workflow?.client?._id === currentClient?.client?._id);

  const fetchWorkflow = async () => {
    try {
      const response = await http({ url: `/workflow/${workflowId || params.id}` });

      form.setValue('extraFields', response.extraFields);
      form.setValue('field', null);
      form.setValue('dataType', '');
      form.setValue('requiredField', '');

      setWorkflow(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchWorkflow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapExtraFieldType = (extraFieldType) => {
    if (extraFieldType === 'string') {
      return 'Testo';
    }
    if (extraFieldType === 'number') {
      return 'Numero';
    }
    if (extraFieldType === 'boolean') {
      return 'Si/No';
    }
    if (extraFieldType === 'date') {
      return 'Data';
    }

    return extraFieldType;
  };

  const deleteExtraField = async (e, index) => {
    e.preventDefault();
    if (!allowAdmin) {
      toast.error('Non hai i permessi per eliminare questo campo');
      return;
    }
    workflow.extraFields.splice(index, 1);

    await http({
      method: 'PUT',
      url: `/workflow/${workflowId || params.id}`,
      form: workflow,
    });
    toast.success('Campo extra eliminato');
    await fetchWorkflow();
  };

  const addExtraField = async (e) => {
    e.preventDefault();
    if (!allowAdmin) {
      toast.error('Non hai i permessi per aggiungere questo campo');
      return;
    }
    const field = form.getValues('field');
    const dataType = form.getValues('dataType');
    const requiredField = form.getValues('requiredField');
    if (field === '' || field === undefined) {
      toast.error('Compila Nome Campo');
      return;
    }
    if (dataType === '' || dataType === undefined) {
      toast.error('Compila Tipo Dato');
      return;
    }
    if (requiredField === '' || requiredField === undefined) {
      toast.error('Compila Obbligatorio');
      return;
    }

    const extraField = {
      field: field,
      dataType,
      requiredField,
    };

    const newWorkflow = {
      ...workflow,
      extraFields: [...workflow.extraFields, extraField],
    };

    await http({
      method: 'PUT',
      url: `/workflow/${workflowId || params.id}`,
      form: newWorkflow,
    });
    toast.success('Campo extra aggiunto');
    setAddNewExtraField(false);
    form.setValue('field', undefined);
    form.setValue('dataType', undefined);
    form.setValue('requiredField', undefined);

    await fetchWorkflow();
  };

  const form = useForm();
  const params = useParams();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="text-lg font-semibold">Campi Extra</div>
      <div className="mt-2">
        {workflow?.extraFields?.length > 0 &&
          workflow?.extraFields?.map((extraField, index) => {
            return (
              <div className="flex mb-2" key={index}>
                <div className="pr-2">
                  <FormLabel>Nome</FormLabel>

                  <input className="w-60 py-1 rounded" type="text" value={extraField.field} disabled={true} />
                </div>
                <div className="pr-2">
                  <FormLabel>Tipo dato</FormLabel>
                  <input
                    className="w-60 py-1 rounded"
                    type="text"
                    value={mapExtraFieldType(extraField.dataType)}
                    disabled={true}
                  />
                </div>
                <div className="pr-2">
                  <FormLabel>Obbligatorio?</FormLabel>
                  <input
                    className="w-32 py-1 rounded"
                    type="text"
                    value={extraField.requiredField ? 'Obbligatorio' : 'Opzionale'}
                    disabled={true}
                  />
                </div>

                {allowAdmin && (
                  <div className="ml-2">
                    <FormLabel>&nbsp;</FormLabel>
                    <Button
                      btnStyle="inFormStyle"
                      type="button"
                      onClick={(e) => {
                        deleteExtraField(e, index);
                      }}
                    >
                      Rimuovi
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        {allowAdmin && (
          <>
            {addNewExtraField ? (
              <>
                <div className="mt-8">
                  <div className="text-lg font-semibold">Aggiungi Campo Extra</div>
                </div>
                <div className="flex mt-2">
                  <div className="pr-2">
                    <FormLabel>Nome Campo</FormLabel>

                    <TextField
                      className={'w-60'}
                      form={form}
                      placeholder={'Nome Campo'}
                      name={'field'}
                    />
                  </div>
                  <div className="pr-2">
                    <FormLabel>Tipo dato</FormLabel>
                    <SelectField
                      className={'w-60'}
                      form={form}
                      name={'dataType'}
                      placeholder="Tipo dato"
                      options={[
                        { value: 'string', label: 'Testo' },
                        { value: 'number', label: 'Numero' },
                        { value: 'date', label: 'Data' },
                        { value: 'boolean', label: 'SI/NO' },
                      ]}
                    />
                  </div>
                  <div className="pr-2">
                    <FormLabel>Obbligatorio?</FormLabel>
                    <SelectField
                      className={'w-32'}
                      form={form}
                      name={'requiredField'}
                      placeholder="-"
                      options={[
                        { value: true, label: 'Obbligatorio' },
                        { value: false, label: 'Opzionale' },
                      ]}
                    />
                  </div>

                  <div className="ml-2">
                    <FormLabel>&nbsp;</FormLabel>
                    <Button
                      btnStyle="inFormStyle"
                      type="button"
                      onClick={(e) => {
                        addExtraField(e);
                      }}
                    >
                      Aggiungi
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-5">
                <Button
                  btnStyle="inFormStyle"
                  type="button"
                  onClick={(e) => {
                    setAddNewExtraField(true);
                  }}
                >
                  Aggiungi Campo Extra
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UpdateWorkflowsExtraFields;
