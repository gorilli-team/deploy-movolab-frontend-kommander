import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useHistory } from 'react-router-dom';
import { http, CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR } from '../utils/Utils';
import Button from '../components/UI/buttons/Button';
import EmptyPage from './EmptyPage';
import Stepper from '../components/UI/Stepper';

const SignupCode = () => {
  const history = useHistory();

  const form = useForm();

  const onSubmit = async (data) => {
    const otp = Object.values(data).join('');
    try {
      const response = await http({
        method: 'POST',
        url: '/clientProfile/verify-otp',
        form: { otp },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response) {
        if (response?.clientProfile?.client?._id) {
          history.push('/dashboard');
        } else if (
          response?.clientProfile?.role === CORPORATE_ROLE_ADMIN ||
          response?.clientProfile?.role === CORPORATE_ROLE_OPERATOR
        ) {
          history.push('/corporate');
        } else {
          history.push('/signup/1');
        }
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
        <h1 className="h2 text-center text-gray-600 mb-4">Inserisci il Codice</h1>

        <div className="flex justify-center">
          <Stepper
            steps={[
              { content: '1', isCurrent: true },
              { content: '2' },
              { content: '3' },
              { content: '4' },
            ]}
          ></Stepper>
        </div>

        <h2 className="py-6 text-center text-gray-400">
          Ti abbiamo inviato un codice di verifica via email.
          <br />
          Inseriscilo qui sotto per completare la registrazione.
        </h2>

        {/* Form */}
        <div className="max-w-sm mx-auto">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={form.formState.isSubmitting}>
              <div className="flex justify-between w-full">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    className="p-2 h-16 w-12 rounded-md text-xl text-black font-semibold text-center appearance-none custom-number-input"
                    name={`digit${i + 1}`}
                    type="number"
                    placeholder=""
                    maxLength={1}
                    required
                    autoFocus={i === 0}
                    {...form.register(`digit${i + 1}`)} // Link the input field to the form
                    onChange={(e) => {
                      if (e.target.value.length === 1) {
                        const nextInput = document.querySelector(`input[name="digit${i + 2}"]`);
                        if (nextInput) {
                          nextInput.focus();
                        }
                      }
                    }}
                    onKeyUp={(e) => {
                      if (e.key === 'Backspace') {
                        const nextInput = document.querySelector(`input[name="digit${i}"]`);
                        if (nextInput) {
                          nextInput.focus();
                        }
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();

                      const paste = (e.clipboardData || window.clipboardData).getData('text');
                      const otp = paste.split('').slice(0, 6);

                      otp.forEach((digit, i) => {
                        form.setValue(`digit${i + 1}`, digit);
                      });
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap -mx-3 mt-6">
                <div className="w-full px-3">
                  <Button btnStyle="darkGray" className="w-full py-3 !text-base">
                    Conferma
                  </Button>{' '}
                </div>
              </div>
            </fieldset>
          </form>
          <div className="text-gray-600 text-center mt-2">
            Non hai ricevuto il codice?{' '}
            <Link
              to="/signup/requestcode"
              className="text-gray-700 hover:text-gray-200 transition duration-150 ease-in-out"
            >
              <b>Richiedilo di nuovo</b>
            </Link>
          </div>
          <style jsx>{`
            /* Custom CSS to hide arrows in number input */
            .custom-number-input::-webkit-outer-spin-button,
            .custom-number-input::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }

            .custom-number-input {
              -moz-appearance: textfield;
            }
          `}</style>
        </div>
      </div>
    </EmptyPage>
  );
};

export default SignupCode;
