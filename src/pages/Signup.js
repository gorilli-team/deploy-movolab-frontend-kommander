import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { TextField } from '../components/Form/TextField';
import { http } from '../utils/Utils';
import { UserContext } from '../store/UserContext';
import EmptyPage from './EmptyPage';
import Button from '../components/UI/buttons/Button';
import Cookies from 'universal-cookie';

const Signup = () => {
  const history = useHistory();
  const userContext = useContext(UserContext);
  const location = useLocation();
  const cookies = new Cookies();

  const form = useForm();

  const isDemo = process.env.REACT_APP_IS_DEMO === 'true';

  const getQueryParams = (search) => {
    return new URLSearchParams(search);
  };

  const queryParams = getQueryParams(location.search);
  const packValue = queryParams.get('pack');

  if (packValue) {
    cookies.set('pack', packValue, { path: '/', maxAge: 172800 });
  }

  const onSubmit = async (data) => {
    try {
      await http({
        method: 'POST',
        url: '/clientProfile',
        form: data,
      });

      await userContext.login(data.email, data.password);

      let userData = await userContext.getUserInfo();

      if (userData) {
        window.analytics.identify(userData?._id, {
          email: userData?.email,
        });

        window.analytics.track({
          userId: userData?._id,
          event: 'Signed Up',
        });

        history.push('/signup/code');
      } else {
        toast.error('Errore durante la registrazione');
      }
    } catch (err) {
      console.error(err);
      toast.error('Errore durante la registrazione');
    }
  };

  return (
    <EmptyPage className="py-24 px-6" headerProps={{ hideNav: true }}>
      <div className="flex flex-col text-black">
        {isDemo ? (
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"
            role="alert"
          >
            <p className="font-bold">Attenzione!</p>
            <p>La pagina di Registrazione è disabilitata per questo sito demo.</p>
          </div>
        ) : (
          <div>
            <h1 className="h1 pb-6 text-center text-gray-600 w-full">Registrazione</h1>

            <div className="flex flex-wrap md:flex-nowrap gap-6 justify-center max-w-3xl mx-auto">
              <section className="w-full md:w-1/2 px-4 flex flex-col">
                {/* Form */}
                <div className="w-full">
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <fieldset disabled={form.formState.isSubmitting}>
                      <TextField
                        form={form}
                        name="email"
                        type="email"
                        label="Email"
                        placeholder="Email"
                        validation={{
                          required: { value: true, message: 'Email obbligatoria' },
                        }}
                        autofocus
                      />
                      <TextField
                        form={form}
                        name="password"
                        type="password"
                        label="Password"
                        placeholder="Password"
                        validation={{
                          required: { value: true, message: 'Password obbligatoria' },
                        }}
                      />
                      <div className="flex flex-wrap -mx-3 mt-6">
                        <div className="w-full px-3">
                          <Button btnStyle="darkGray" className="w-full py-3 !text-base">
                            Registrati
                          </Button>
                        </div>
                      </div>
                    </fieldset>
                  </form>
                  <div className="text-gray-600 text-center mt-2">
                    Già registrato?{' '}
                    <Link
                      to="/signin"
                      className="text-gray-700 hover:text-gray-200 transition duration-150 ease-in-out"
                    >
                      <b>Login</b>
                    </Link>
                    <p className="mt-2 text-sm">
                      <span className="text-red-600 ml-1">*</span> campo obbligatorio
                    </p>
                  </div>
                </div>
              </section>
              <section className="w-full md:w-1/2 px-4">
                <div className="text-gray-500 text-sm">
                  <p className="font-semibold">Attenzione, leggi bene prima di proseguire:</p>
                  <ul className="list-disc">
                    <li>
                      Per procedere devi essere il Rappresentante Legale o devi avere i poteri per
                      la sottoscrizione di contratti di fornitura servizi per la conto della tua
                      azienda​{' '}
                    </li>
                    <li>
                      La mail che inserisci deve essere una mail aziendale che ti servirà per
                      accedere come Amministratore
                    </li>
                    <li>
                      Devi avere a portata di mano
                      <ul className="pl-3">
                        <li>- la PEC aziendale</li>
                        <li>- il documento d’identità del Contraente</li>
                        <li>- la visura aziendale aggiornata</li>
                      </ul>
                    </li>
                    <li>Devi avere il Codice Partner ricevuto dal tuo Consulente</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </EmptyPage>
  );
};

export default Signup;
