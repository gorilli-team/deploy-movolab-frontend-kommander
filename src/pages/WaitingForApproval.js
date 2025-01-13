import React, { useContext } from 'react';
import EmptyPage from './EmptyPage';
import { UserContext } from '../store/UserContext';
import { useHistory } from 'react-router-dom';

const WaitingForApproval = () => {
  const { data: userData } = useContext(UserContext);
  const history = useHistory();

  if (userData?.client?.enabled) {
    history.push('/dashboard')
    return null;
  }

  return (
    <EmptyPage>
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="h2 pb-6 text-center text-gray-600 w-full md:w-full">
          In attesa di approvazione...
        </h1>
        <div className="w-full mx-auto">
          <div className="text-gray-600 text-center mt-2">
            Stiamo verificando il tuo account.
            <br />
            Non appena il tuo account sarà approvato, potrai accedere alla tua dashboard. 🚀
          </div>
        </div>
      </section>
    </EmptyPage>
  );
};

export default WaitingForApproval;
