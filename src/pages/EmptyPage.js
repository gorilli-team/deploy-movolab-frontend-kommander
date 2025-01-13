import React from 'react';
import Header from '../partials/Header';
import Footer from '../partials/Footer';

import DemoBanner from '../components/UI/DemoBanner';

const EmptyPage = ({
  children,
  className = 'flex flex-col justify-center px-6 pb-12 md:pb-24',
  headerProps = {},
  ...props
}) => {
  const isDemo = process.env.REACT_APP_IS_DEMO === 'true';

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {isDemo && <DemoBanner />}

      <Header className="bg-darkgray" {...headerProps} />

      <main className="flex flex-col flex-1 overflow-auto">
        <div className={`flex-1 bg-slate-50 ${className}`} {...props}>
          {children}
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default EmptyPage;
