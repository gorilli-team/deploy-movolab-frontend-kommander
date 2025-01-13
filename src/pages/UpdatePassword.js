import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { TextField } from '../components/Form/TextField';
import { http } from '../utils/Utils';
import Button from '../components/UI/buttons/Button';
import { useParams } from 'react-router-dom';
import EmptyPage from './EmptyPage';

function UpdatePassword() {
  const form = useForm();
  const params = useParams();
  const [isPasswordUpdated, setIsPasswordUpdated] = React.useState(false);

  const onSubmit = async (data) => {
    try {
      if (data.password !== data.passwordRepeat) {
        toast.error('Le password non corrispondono');
        return;
      }

      const response = await http({
        method: 'POST',
        url: `/clientProfile/update-password/${params.resetUrl}`,
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

  return (
    <EmptyPage>
      <div className="max-w-3xl mx-auto text-center pb-6 md:pb-6">
        <h1 className="h2 text-gray-600">Aggiorna Password</h1>
      </div>

      <div className="max-w-sm mx-auto w-full">
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
            <div className="flex flex-wrap -mx-3 mt-6">
              <div className="w-full px-3">
                <Button btnStyle="darkGray" className="w-full py-3 !text-base" to="/signin">
                  Torna al Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </EmptyPage>
  );
}

export default UpdatePassword;
