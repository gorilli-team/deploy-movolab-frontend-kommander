import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useHistory } from 'react-router-dom';
import { TextField } from '../components/Form/TextField';
import { UserContext } from '../store/UserContext';
import {
  MOVOLAB_ROLE_ADMIN,
  CORPORATE_ROLE_ADMIN,
  CORPORATE_ROLE_OPERATOR,
  CLIENT_ROLE_ADMIN,
} from '../utils/Utils';
import EmptyPage from './EmptyPage';
import Button from '../components/UI/buttons/Button';

const Signin = () => {
  const history = useHistory();
  const userContext = useContext(UserContext);
  const form = useForm();
  const searchParams = new URLSearchParams(document.location.search);
  const redirect = searchParams.get('redirect');

  const isDemo = process.env.REACT_APP_IS_DEMO === 'true';

  const onSubmit = async ({ email, password }) => {
    try {
      await userContext.login(email, password);
      let userData = await userContext.getUserInfo();

      if (userData?.isVerified === false) {
        history.push('/signup/code');
      } else if (userData?.role === MOVOLAB_ROLE_ADMIN) {
        history.push(redirect || '/admin');
      } else if (userData === null) {
        history.push(redirect || '/signup/1');
      } else if (
        userData?.role === CORPORATE_ROLE_ADMIN ||
        userData?.role === CORPORATE_ROLE_OPERATOR
      ) {
        history.push(redirect || '/corporate');
      } else if (
        userData?.role === CLIENT_ROLE_ADMIN &&
        (userData?.client?.license === null || userData?.client?.license === undefined)
      ) {
        history.push(redirect || '/signup/2');
      } else if (
        userData?.role === CLIENT_ROLE_ADMIN &&
        (userData?.client?.stripeCustomerId === null ||
          userData?.client?.stripeCustomerId === undefined)
      ) {
        history.push(redirect || '/signup/3');
      } else {
        if (userData?.client?.enabled === false) {
          history.push(redirect || '/inapprovazione');
        } else if (userData?.client?.authorized === false) {
          // If the user is not authorized, break the loop
          history.push('/');
        } else {
          history.push(redirect || '/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Errore durante il login');
    }
  };

  return (
    <EmptyPage headerProps={{ hideNav: true }}>
      <section className="max-w-6xl md:mx-auto px-4 sm:px-6">
        <h1 className="h1 pb-6 text-center text-gray-600 w-full">Login</h1>

        {/* Form */}
        <div className="w-full md:w-96 md:mx-auto text-black">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={form.formState.isSubmitting}>
              <TextField
                form={form}
                name="email"
                type="email"
                label="Email"
                placeholder="Email"
                validation={{
                  required: { value: true },
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
                  required: { value: true },
                }}
              />

              <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full px-3">
                  <div className="flex justify-between">
                    <Link
                      to="/reset-password"
                      className="text-gray-600 hover:text-gray-200 transition duration-150 ease-in-out"
                    >
                      Password dimenticata?
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap -mx-3 mt-6">
                <div className="w-full px-3">
                  <Button btnStyle="darkGray" className="w-full py-3 !text-base">
                    Login
                  </Button>
                </div>
              </div>
            </fieldset>
          </form>
          {!isDemo && (
            <div className="text-gray-600 text-center mt-2">
              Non hai un account?{' '}
              <Link
                to="/signup"
                className="text-gray-700 hover:text-gray-200 transition duration-150 ease-in-out"
              >
                <b>Registrati</b>
              </Link>
            </div>
          )}
        </div>
      </section>
    </EmptyPage>
  );
};

export default Signin;
