import React, { useContext } from 'react';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../utils/Utils';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { SelectField } from '../../Form/SelectField';
import useGroups from '../../../hooks/useGroups';
import Button from '../../UI/buttons/Button';
import { UserContext } from '../../../store/UserContext';

const UpdatePriceListDeposits = (props) => {
  const { data: currentClient } = useContext(UserContext);

  const form = useForm();
  form.setValue('deposits', props.deposits);

  const params = useParams();
  const groups = useGroups();

  const onSubmit = async (data) => {
    try {
      const dataToSend = {
        ...data,
        deposits: data.deposits,
      };

      await http({
        method: 'PUT',
        url: `/pricing/priceLists/${params.id}`,
        form: dataToSend,
      });
      toast.success('Listino aggiornato');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} id="priceListForm">
      <fieldset disabled={form.formState.isSubmitting}>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 font-semibold px-4">
            <div className="w-60">Gruppo</div>
            <div className="w-60 px-3">Deposito (€)</div>
          </div>
          {groups &&
            groups.map(
              (group, index) => (
                form.setValue(`deposits.[${index}].group`, group?.value), //eslint-disable-line
                (
                  <div
                    className="flex items-center w-fit gap-2 bg-slate-50 rounded-md p-4"
                    key={group?.value}
                  >
                    <div className="w-60">
                      <div className="text-sm font-semibold">{group?.label}</div>
                    </div>
                    <div className="w-60 px-3">
                      <SelectField
                        label={group?.name}
                        className="m-0"
                        name={`deposits.[${index}].amount`}
                        form={form}
                        options={[
                          { value: 0, label: '0 Euro' },
                          { value: 100, label: '100 Euro' },
                          { value: 200, label: '200 Euro' },
                          { value: 300, label: '300 Euro' },
                          { value: 400, label: '400 Euro' },
                          { value: 500, label: '500 Euro' },
                          { value: 1000, label: '1000 Euro' },
                        ]}
                      />
                    </div>
                  </div>
                )
              ),
            )}
        </div>
        {currentClient.role === MOVOLAB_ROLE_ADMIN ? (
          <div>
            <Button>Salva</Button>
          </div>
        ) : null}
      </fieldset>
    </form>
  );
};

export default UpdatePriceListDeposits;
