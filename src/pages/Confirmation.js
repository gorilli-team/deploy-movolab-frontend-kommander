import React from 'react';

import Header from '../partials/Header';

function Confirmation() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/*  Site header */}
      <Header />

      {/*  Page content */}
      <main className="flex-grow">
        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">
              {/* Page header */}
              <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
                <h1 className="h1 text-gray-600">Registrazione effettuata</h1>
              </div>

              {/* Section header */}
              <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
                <p className="text-xl text-gray-700">Grazie per esserti registrato su Movolab.</p>
                <p className="text-xl text-gray-700">
                  Clicca il link che ti abbiamo inviato via email per confermare la registrazione.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Confirmation;
