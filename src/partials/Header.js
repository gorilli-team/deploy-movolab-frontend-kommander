import React, { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { UserContext } from '../store/UserContext';
import Button from '../components/UI/buttons/Button';
import ButtonDropdown from '../components/UI/buttons/ButtonDropdown';
import { FaGear, FaGaugeHigh, FaUser, FaCaretDown } from 'react-icons/fa6';
import {
  MOVOLAB_ROLE_ADMIN,
  CLIENT_ROLE_ADMIN,
  CLIENT_ROLE_OPERATOR,
  CORPORATE_ROLE_ADMIN,
  CORPORATE_ROLE_OPERATOR,
} from '../utils/Utils';

function Header({ className = 'bg-customblue', mobileNavOpen = false, mobiToggle = () => {}, hideNav = false }) {
  const [mode] = useState(window.location.pathname.split('/')[1]);
  const userContext = useContext(UserContext);
  const isLoggedIn = userContext.data;
  const history = useHistory();

  const isDemo = process.env.REACT_APP_IS_DEMO === 'true';

  const customisations = userContext?.data?.customisations || {};
  const canSeeHeaderMenu =
    userContext?.data?.client?.enabled ||
    userContext?.data?.role === MOVOLAB_ROLE_ADMIN ||
    userContext?.data?.role === CORPORATE_ROLE_ADMIN ||
    userContext?.data?.role === CORPORATE_ROLE_OPERATOR;

  const userRole = userContext.data?.role;
  const logoutUser = (e) => {
    // e.preventDefault();
    userContext.logout();
    history.push('/');
  };

  const homeLink = () => {
    const pathname = window.location.pathname.split('/')[1];
    if (pathname === 'admin') return '/admin';
    if (pathname === 'dashboard') return '/dashboard';
    if (pathname === 'settings') return '/dashboard';
    if (pathname === 'corporate') return '/corporate';
    return '/';
  };

  const dashboardLink = () => {
    const pathname = window.location.pathname.split('/')[1];
    if (pathname === 'admin') return '/admin';
    // if (pathname === 'dashboard') return '/settings/profilo';
    if (pathname === 'settings') return '/dashboard';
    if (pathname === 'corporate') return '/corporate';
    if (userRole === CORPORATE_ROLE_ADMIN || userRole === CORPORATE_ROLE_OPERATOR)
      return '/corporate';
    if (userRole === MOVOLAB_ROLE_ADMIN) return '/admin';
    return '/dashboard';
  };

  if (mode === 'corporate') {
    customisations.headerColor = '#dc2626';
    // userContext.data.client.imageUrl = userContext.data.company.imageUrl;
  }

  return (
    <header
      className={`w-full ${className}`}
      style={{ backgroundColor: customisations?.headerColor }}
    >
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Site branding */}
          <div className="flex-1 mr-4">
            {/* Logo */}
            <Link to={homeLink} className="block w-full" aria-label="Movolab">
              <div
                className="w-full h-8 cursor-pointer"
                style={{
                  backgroundImage: `url(${
                    userContext?.data?.client?.imageUrl || '/movolab_logo.png'
                  })`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'left center',
                  backgroundSize: 'contain',
                }}
              ></div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:flex-grow">
            {/* Desktop menu links */}
            {!isLoggedIn && <ul className="flex flex-grow justify-end flex-wrap items-center"></ul>}

            {/* Desktop sign in links */}
            {isLoggedIn && canSeeHeaderMenu ? (
              <ul className="flex flex-grow justify-end flex-wrap items-center gap-4">
                <li>
                  <Button
                    to={dashboardLink()}
                    btnStyle="whiteLink"
                    className="!px-1"
                    style={{ color: customisations?.headerTextColor }}
                  >
                    <FaGaugeHigh className="inline mb-1" /> Dashboard
                  </Button>
                </li>
                {userRole === CLIENT_ROLE_ADMIN && (
                  <li>
                    <Button
                      to={'/settings/clientInfo'}
                      btnStyle="whiteLink"
                      className="!px-1"
                      style={{ color: customisations?.headerTextColor }}
                    >
                      <FaGear className="inline mb-1" /> Admin
                    </Button>
                  </li>
                )}
                {userRole === CLIENT_ROLE_OPERATOR && (
                  <li>
                    <Button
                      to={'/settings/listini'}
                      btnStyle="whiteLink"
                      className="!px-1"
                      style={{ color: customisations?.headerTextColor }}
                    >
                      <FaGear className="inline mb-1" /> Impostazioni
                    </Button>
                  </li>
                )}
                <li>
                  <ButtonDropdown
                    btnStyle="whiteLink"
                    className="!px-1"
                    style={{ color: customisations?.headerTextColor }}
                    dropdownClass="right-0"
                    dropdownItems={[
                      {
                        children: (
                          <>
                            <strong>
                              {userContext.data?.fullname !== undefined
                                ? `Login: ${userContext.data?.fullname}`
                                : userContext.data?.role === MOVOLAB_ROLE_ADMIN
                                ? 'Admin di Movolab'
                                : `Login: ${userContext.data?.email}`}
                            </strong>
                            <br />
                            <small>
                              {userContext.data?.email !== undefined ? userContext.data?.email : ''}
                            </small>
                          </>
                        ),
                      },
                      {
                        children: 'Profilo',
                        to:
                          window.location.pathname.split('/')[1] === 'corporate'
                            ? '/corporate/profilo'
                            : '/settings/profilo',
                        hiddenIf: userContext.data?.role === MOVOLAB_ROLE_ADMIN,
                      },
                      {
                        children: 'Logout',
                        onClick: logoutUser,
                      },
                    ]}
                  >
                    <FaUser className="inline mb-1" />{' '}
                    {userContext.data?.fullname !== undefined
                      ? userContext.data?.fullname
                      : userContext.data?.role === MOVOLAB_ROLE_ADMIN
                      ? 'Admin'
                      : 'Utente'}
                    <FaCaretDown className="inline mb-1 ml-1" />
                  </ButtonDropdown>
                </li>
              </ul>
            ) : (
              <ul className="flex flex-grow justify-end flex-wrap items-center gap-4">
                <li>
                  <Button to={'/signin'} btnStyle="whiteLink" className="!px-1">
                    Login
                  </Button>
                </li>
                {!isDemo && (
                  <li className="ml-4">
                    <Button to={'/signup'} btnStyle="whiteLink" className="!px-1">
                      Registrati
                    </Button>
                  </li>
                )}
              </ul>
            )}
          </nav>

          {!hideNav ? (
            <div className="md:hidden overflow-hidden">
              {/* Hamburger button */}
              <button
                className={`hamburger ${mobileNavOpen && 'active'}`}
                aria-controls="mobile-nav"
                aria-expanded={mobileNavOpen}
                onClick={() => mobiToggle(!mobileNavOpen)}
              >
                <span className="sr-only">Menu</span>
                <svg
                  className="w-6 h-6 fill-current text-gray-200 hover:text-gray-700 transition duration-150 ease-in-out"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect y="4" width="24" height="2" rx="1" />
                  <rect y="11" width="24" height="2" rx="1" />
                  <rect y="18" width="24" height="2" rx="1" />
                </svg>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Header;
