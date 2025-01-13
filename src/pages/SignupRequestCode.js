import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useHistory } from 'react-router-dom';
import { http } from '../utils/Utils';
import Button from '../components/UI/buttons/Button';
import EmptyPage from './EmptyPage';

const SignupRequestCode = () => {
  const history = useHistory();

  const form = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await http({
        method: 'POST',
        url: '/clientProfile/resend-otp',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response) {
        history.push('/signup/code');
      } else {
        toast.error('Errore durante la verifica');
      }
    } catch (err) {
      console.error(err);
      toast.error('Errore durante la verifica');
    }
  };

  return (
    <EmptyPage className="py-24 px-6" headerProps={{ hideNav: true }}>
      <div className="flex flex-col text-black">
        <h1 className="h2 text-center text-gray-600">Richiedi Codice</h1>

        <h2 className="py-6 text-center text-gray-400">
          Clicca il bottone sottostante per richiedere
          <br />
          nuovamente un codice di verifica
        </h2>

        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm mx-auto">
          <fieldset disabled={form.formState.isSubmitting}>
            <Button btnStyle="darkGray" className="w-full py-3 !text-base">
              Conferma
            </Button>
          </fieldset>
        </form>

        <div className="text-gray-600 text-center mt-2">
          Oppure{' '}
          <Link
            to="/signin"
            className="text-gray-700 hover:text-gray-200 transition duration-150 ease-in-out"
          >
            <b>torna al login</b>
          </Link>
        </div>
      </div>
    </EmptyPage>
  );
};

export default SignupRequestCode;
