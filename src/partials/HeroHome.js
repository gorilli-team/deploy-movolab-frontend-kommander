import React from 'react';
import Button from '../components/UI/buttons/Button';

const isDemo = process.env.REACT_APP_IS_DEMO === 'true';

function HeroHome() {
  return (
    <section className="max-w-3xl mx-auto text-center text-gray-700">
      <h1 className="h1 mb-4" data-aos="fade-up">
        Movolab
      </h1>
      <p className="text-xl text-gray-700 mb-1" data-aos="fade-up" data-aos-delay="200">
        La nuova piattaforma di mobilità
      </p>
      <div className="w-auto flex flex-col gap-3 mt-5 max-w-xs mx-auto sm:w-80 sm:flex-row sm:justify-center">
        {!isDemo && (
          <Button
            btnStyle="black"
            to="/signup"
            className="sm:w-1/2 py-3 !text-base"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            Registrati
          </Button>
        )}
        <Button
          btnStyle="darkGray"
          to="/signin"
          className="sm:w-1/2 py-3 !text-base"
          data-aos="fade-up"
          data-aos-delay="600"
        >
          Login
        </Button>
      </div>
    </section>
  );
}

export default HeroHome;
