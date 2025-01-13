import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { TextField } from '../components/Form/TextField';
import { http } from '../utils/Utils';
import EmptyPage from './EmptyPage';
import Button from '../components/UI/buttons/Button';

function ResetPassword() {
  const form = useForm();

  const onSubmit = async (data) => {
    try {
      await http({
        method: 'POST',
        url: '/clientProfile/forgot-password',
        form: data,
      });

      toast.success('Controlla la posta elettronica');
      setTimeout(() => form.reset(), 2500);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore durante il login');
    }
  };

  return (
    <EmptyPage>
      <section className="max-w-6xl mx-auto">
        <h1 className="h2 text-gray-600">Password dimenticata?</h1>
        <p className="text-xl text-gray-600 pb-6 text-center">Recupera la tua password</p>

        {/* Form */}
        <div className="max-w-sm mx-auto">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={form.formState.isSubmitting}>
              <TextField
                form={form}
                name="email"
                type="email"
                label="Email"
                placeholder="Inserisci la tua email"
                validation={{
                  required: { value: true },
                }}
                autofocus
              />

              <div className="flex flex-wrap -mx-3 mt-6">
                <div className="w-full px-3">
                  <Button btnStyle="darkGray" className="w-full py-3 !text-base">
                    Recupera Password
                  </Button>
                </div>
              </div>
            </fieldset>
          </form>
          <div className="text-gray-400 text-center mt-2">
            <Link
              to="/signin"
              className="text-gray-600 hover:text-gray-200 transition duration-150 ease-in-out"
            >
              Annulla
            </Link>
          </div>
        </div>
      </section>
    </EmptyPage>
  );
}

export default ResetPassword;
