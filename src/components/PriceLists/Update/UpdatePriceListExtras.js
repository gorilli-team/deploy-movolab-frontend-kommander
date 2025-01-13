import React, { useContext, useEffect, useState } from 'react';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../utils/Utils';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { SelectField } from '../../Form/SelectField';
import { TextField } from '../../Form/TextField';
import Button from '../../UI/buttons/Button';
import { UserContext } from '../../../store/UserContext';
import { FaTrash } from 'react-icons/fa6';

const UpdatePriceListExtras = (props) => {
  const { data: currentClient } = useContext(UserContext);
  const [extrasAvailable, setExtrasAvailable] = useState([]);
  const [priceList, setPriceList] = useState({ extras: [] });
  const [showExtras, setShowExtras] = useState(false);
  const form = useForm();
  const params = useParams();

  useEffect(() => {
    fetchPriceList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPriceList = async () => {
    try {
      const response = await http({ url: `/pricing/priceLists/${params.id}` });
      setPriceList(response);
      form.setValue('extras', response.extras);
      fetchExtras({ exclude: response.extras.map((extra) => extra._id) });
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchExtras = async ({ exclude }) => {
    try {
      setShowExtras(false);
      const response = await http({ url: '/pricing/extras' });

      setExtrasAvailable(
        response.extras.map((extra) => {
          const name = extra.name;

          return {
            value: extra._id,
            label: name,
          };
        }),
      );

      setShowExtras(true);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onSubmit = async (data) => {
    try {
      const dataToSend = {
        ...data,
        extras: data.extras.filter((extra) => extra !== ''),
      };

      await http({
        method: 'PUT',
        url: `/pricing/priceLists/${params.id}`,
        form: dataToSend,
      });
      toast.success('Listino aggiornato');
      fetchPriceList();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <>
      {!showExtras && <div>Caricamento...</div>}
      {showExtras && extrasAvailable.length === 0 && <div>Nessun extra disponibile</div>}
      {showExtras && extrasAvailable.length > 0 && (
        <form onSubmit={form.handleSubmit(onSubmit)} id="priceListForm">
          <fieldset disabled={form.formState.isSubmitting}>
            {extrasAvailable.length > 0 &&
              priceList?.extras.map((extra, index) => {
                return (
                  <div className="flex" key={index}>
                    <div style={{ width: '400px' }} key={index}>
                      {extra.name !== undefined ? (
                        <TextField form={form} name={`extras[${index}].name`} disabled={true} />
                      ) : (
                        <SelectField
                          form={form}
                          name={`extras[${index}]`}
                          placeholder="Seleziona extra"
                          options={extrasAvailable.filter((extra) => {
                            return !priceList.extras.some((priceListExtra) => {
                              return priceListExtra._id === extra.value;
                            });
                          })}
                        />
                      )}
                    </div>
                    {extra.name !== undefined ? (
                      <div className="ml-2">
                        <Button
                          type="button"
                          btnStyle="inFormStyle"
                          className="!text-red-500 !border-red-500"
                          onClick={() => {
                            priceList.extras.splice(index, 1);
                            const updatedPriceList = {
                              ...priceList,
                              extras: priceList.extras,
                            };
                            setPriceList(updatedPriceList);
                            form.setValue('extras', updatedPriceList.extras);
                          }}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    ) : (
                      <div className="ml-2">
                        <Button btnStyle="inFormStyle">Salva</Button>
                      </div>
                    )}
                  </div>
                );
              })}

            <div>
              <Button
                btnStyle="inFormStyle"
                type="button"
                onClick={() => {
                  const updatedPriceList = {
                    ...priceList,
                    extras: [...priceList.extras, ''],
                  };
                  setPriceList(updatedPriceList);
                  form.setValue('extras', updatedPriceList.extras);
                }}
              >
                Aggiungi
              </Button>
            </div>

            {currentClient.role === MOVOLAB_ROLE_ADMIN ? (
              <div>
                <Button>Salva</Button>
              </div>
            ) : null}
          </fieldset>
        </form>
      )}
    </>
  );
};

export default UpdatePriceListExtras;
