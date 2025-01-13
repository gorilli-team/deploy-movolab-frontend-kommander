import React, { useState } from 'react';
import Sidebar from './Sidebar';
import WhiteBox from './WhiteBox';
import Header from '../../partials/Header';
import DemoBanner from './DemoBanner';

const PageLayout = ({
  children,
  userContext,
  sidebarMenu,
  canAccess,
  loading,
  hasBox = true,
  colorClasses = null,
  ...props
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isDemo = process.env.REACT_APP_IS_DEMO === 'true';

  return (
    <>
      <>
        {isDemo && <DemoBanner />}
        <div
          className={`w-full ${
            isDemo ? 'h-16 top-10' : 'h-16 top-0'
          } fixed z-40 bg-white print:hidden`}
          style={isDemo ? { top: '40px' } : { top: '0px' }}
        >
          <Header mobileNavOpen={mobileNavOpen} mobiToggle={setMobileNavOpen} />
        </div>
      </>

      <div className="flex flex-col bg-gray-400">
        {/* Page content */}
        <main className={`relative flex h-screen ${isDemo ? 'pt-16' : 'pt-16'}`}>
          <div
            className={`flex-none print:hidden ${
              mobileNavOpen ? '' : 'ml-[-13rem]'
            } md:!ml-0 transition-[margin]`}
          >
            <Sidebar userContext={userContext} colors={colorClasses} sidebar_menu={sidebarMenu} />
          </div>
          <div
            className="grow bg-slate-100 print:bg-white text-gray-800 overflow-y-auto"
            id="bodyPage"
          >
            <div className="w-screen md:w-auto">
              {loading ? (
                <div className="p-5 text-center">Loading...</div>
              ) : hasBox ? (
                <WhiteBox {...props}>{children}</WhiteBox>
              ) : (
                children
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PageLayout;
