import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { http } from '../../../utils/Utils';
import { TextField } from '../../Form/TextField';
import Button from '../../UI/buttons/Button';
import Modal from '../../UI/Modal';

const ClientProfilePasswordModal = ({ closeModal = () => {} }) => {
  const form = useForm();
  const params = useParams();
  const [isPasswordUpdated, setIsPasswordUpdated] = React.useState(false);

  const onSubmit = async (data) => {
    try {
      if (data.password !== data.passwordRepeat) {
        toast.error('Le password non corrispondono');
        return;
      }

      data.clientProfileId = params.id;

      const response = await http({
        method: 'POST',
        url: `/clientProfile/admin-update-password`,
        form: data,
      });

      if (response.error) {
        toast.error(response.error);
        return;
      } else {
        setIsPasswordUpdated(true);
        toast.success('Password aggiornata');
        setTimeout(() => form.reset(), 2500);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Errore');
    }
  };

  const exitFromModal = () => {
    closeModal();
  };

  return (
    <>
      <Modal
        isVisible={true}
        size="sm"
        bgClassName="items-start"
        className="md:mt-28"
        onClose={(e) => {
          e.preventDefault();
          exitFromModal();
        }}
        innerClassName="px-6 py-4 relative"
        headerChildren={
          <div className="">
            <h2 className="text-xl font-semibold">Modifica password</h2>
            {!isPasswordUpdated && (
              <p className="text-red-600 text-sm">
                Attenzione: la password di questo account verrà cambiata.
              </p>
            )}
          </div>
        }
      >
        {!isPasswordUpdated ? (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={form.formState.isSubmitting}>
              <div className="mt-3">
                <TextField
                  form={form}
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="Inserisci la password"
                  validation={{
                    required: { value: true },
                  }}
                  autofocus
                />
              </div>
              <div className="mt-6">
                <TextField
                  form={form}
                  name="passwordRepeat"
                  type="password"
                  label="Ripeti Password"
                  placeholder="Ripeti la password"
                  validation={{
                    required: { value: true },
                  }}
                  autofocus
                />
              </div>

              <div className="flex flex-wrap -mx-3 mt-6">
                <div className="w-full px-3">
                  <Button btnStyle="darkGray" className="w-full py-3 !text-base">
                    Aggiorna
                  </Button>
                </div>
              </div>
            </fieldset>
          </form>
        ) : (
          <div className="text-green-600 text-center mt-2 text-xl font-semibold">
            <p>Password aggiornata con successo</p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ClientProfilePasswordModal;
