import React from 'react';
import { Link } from 'react-router-dom';
import EmptyPage from './EmptyPage';

function PageNotFound() {
  return (
    <EmptyPage>
      <div className="max-w-3xl mx-auto text-center">
        {/* Top image */}
        {/* 404 content */}

        <h1 className="h1 mt-20 mb-4 text-gray-600" data-aos="fade-up" data-aos-delay="200">
          Questa pagina non esiste.
        </h1>
        <p className="text-lg text-gray-400" data-aos="fade-up" data-aos-delay="400">
          Torna alla{' '}
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-200 transition duration-150 ease-in-out"
          >
            <b>homepage</b>
          </Link>{' '}
        </p>
      </div>
    </EmptyPage>
  );
}

export default PageNotFound;
