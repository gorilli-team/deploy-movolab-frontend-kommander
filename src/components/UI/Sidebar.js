import React, { useEffect, useRef, useState } from 'react';
import { FaArrowCircleLeft, FaArrowCircleRight } from 'react-icons/fa';
import { NavLink, useLocation } from 'react-router-dom';
import { CLIENT_ROLE_ADMIN } from '../../utils/Utils';
import { FaDoorClosed, FaGear, FaUser } from 'react-icons/fa6';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const colorClasses = {
  bgColor: 'bg-lightblue',
  fgColor: 'text-white hover:text-slate-100',
  selectedColor: 'bg-lightblue-darker',
  hoverColor: 'hover:bg-lightblue-darker',
};

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  userContext,
  sidebar_menu = [],
  colors = colorClasses,
}) {
  const location = useLocation();
  const { pathname: currentPath } = location;
  const role = userContext?.data?.role;
  const license = userContext?.data?.client?.license?.licenseOwner;

  const menu = Object.keys(sidebar_menu);
  const history = useHistory();

  const trigger = useRef(null);
  const sidebar = useRef(null);

  colors = colors ? colors : colorClasses;

  const customisations = userContext?.data?.customisations || {};

  const logoutUser = (e) => {
    // e.preventDefault();
    userContext.logout();
    history.push('/');
  };

  if (currentPath.startsWith('/settings')) {
    customisations.navbarColor = customisations.settingsNavColor;
    customisations.navbarFgColor = customisations.settingsNavFgColor;
  }

  const [isClosed, setClosed] = useState(localStorage.getItem('navbarClosed') === 'true');

  localStorage.setItem('navbarClosed', isClosed);

  const toggleNavbar = () => {
    setClosed(!isClosed);
    localStorage.setItem('navbarClosed', isClosed);
  };

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target))
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  const userRole = userContext.data?.role;

  return (
    <div
      id="sidebar"
      ref={sidebar}
      className={`${colors.bgColor} overflow-y-auto h-full flex py-3`}
      style={{ backgroundColor: customisations?.navbarColor }}
    >
      {/* Links */}
      <div className={`${isClosed ? 'min-w-12' : 'min-w-[13rem] w-full'} transition-[min-width]`}>
        <ul className="flex flex-col h-full">
          {menu.map((path, key) => {
            const { icon: ItemIcon, ...item } = sidebar_menu[path];

            if (item.allowedRoles && !item.allowedRoles.includes(role)) return null;
            if (item.allowedLicense && !item.allowedLicense.includes(license)) return null;

            const selected = item.exact
              ? menu.includes(path) && currentPath === path
              : currentPath.startsWith(path) ||
                item.nestedItems?.find((itm) => itm.url === currentPath);

            return (
              <li
                key={key}
                className={`mb-1 last:mb-0 relative group ${
                  selected ? colors.selectedColor : colors.hoverColor
                }`}
              >
                <NavLink
                  to={path}
                  className={`block py-2 ${colors.fgColor} ${isClosed ? 'px-2' : 'px-5'}`}
                  style={{ color: selected ? null : customisations?.navbarFgColor }}
                >
                  <div className={`flex items-center ${isClosed ? 'justify-center' : ''}`}>
                    <ItemIcon className="text-2xl"></ItemIcon>
                    {!isClosed && (
                      <span className="text-sm ml-2 font-medium lg:inline-block">{item.label}</span>
                    )}
                  </div>
                </NavLink>
                {item.nestedItems ? (
                  <ul
                    className={
                      isClosed
                        ? `hidden group-hover:block animate-fadein absolute ${colors.bgColor} ${colors.hoverColor} top-0 left-12 py-3 pr-4 pl-2 z-40`
                        : 'mb-3 ml-4'
                    }
                  >
                    {item.nestedItems.map((nestedItem, key) => (
                      <li key={key}>
                        <NavLink
                          exact
                          to={nestedItem.url}
                          className={`block ${colors.fgColor}`}
                          style={{ color: customisations?.navbarFgColor }}
                        >
                          <div className="flex items-center ml-2 my-1">
                            <span className="text-sm font-medium lg:inline-block">
                              {nestedItem.label}
                            </span>
                          </div>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : isClosed ? (
                  <div
                    className={`hidden group-hover:block animate-fadein absolute ${colors.bgColor} ${colors.hoverColor} text-white top-0 left-12 z-40`}
                  >
                    <NavLink
                      to={path}
                      className={`block py-2 ${colors.fgColor} px-5`}
                      style={{ color: customisations?.navbarFgColor }}
                    >
                      <span className="text-sm font-medium lg:inline-block">{item.label}</span>
                    </NavLink>
                  </div>
                ) : null}
              </li>
            );
          })}

          <li className="flex-1"></li>

          <li className={`hidden md:block ${colors.hoverColor}`}>
            <button
              className={`block w-full py-2 ${colors.fgColor} ${isClosed ? 'px-2' : 'px-5'}`}
              onClick={toggleNavbar}
              title={isClosed ? 'Espandi' : 'Riduci'}
              style={{ color: customisations?.navbarFgColor }}
            >
              <div className={`flex items-center ${isClosed ? 'justify-center' : ''}`}>
                {isClosed ? (
                  <FaArrowCircleRight className="text-xl" />
                ) : (
                  <FaArrowCircleLeft className="text-xl" />
                )}

                {!isClosed && (
                  <span className="text-sm font-medium ml-2 lg:inline-block">
                    {isClosed ? 'Espandi' : 'Riduci'}
                  </span>
                )}
              </div>
            </button>
          </li>

          {userRole === CLIENT_ROLE_ADMIN && (
            <li className={`block md:hidden ${colors.hoverColor}`}>
              <NavLink
                to={'/settings/clientInfo'}
                className={`block py-2 px-5 ${colors.fgColor}`}
                style={{ color: customisations?.navbarFgColor }}
              >
                <div className={`flex items-center ${isClosed ? 'justify-center' : ''}`}>
                  <FaGear className="text-2xl"></FaGear>
                  <span className="text-sm ml-2 font-medium lg:inline-block">Admin</span>
                </div>
              </NavLink>
            </li>
          )}

          <li className={`block md:hidden ${colors.hoverColor}`}>
            <NavLink
              className={`block py-2 px-5 ${colors.fgColor}`}
              style={{ color: customisations?.navbarFgColor }}
              to={
                window.location.pathname.split('/')[1] === 'corporate'
                  ? '/corporate/profilo'
                  : '/settings/profilo'
              }
            >
              <div className={`flex items-center ${isClosed ? 'justify-center' : ''}`}>
                <FaUser className="text-2xl"></FaUser>
                <span className="text-sm ml-2 font-medium lg:inline-block">
                  {userContext.data?.fullname !== undefined ? userContext.data?.fullname : 'Admin'}
                </span>
              </div>
            </NavLink>
          </li>

          <li className={`block md:hidden ${colors.hoverColor}`}>
            <button
              onClick={logoutUser}
              className={`block py-2 px-5 ${colors.fgColor}`}
              style={{ color: customisations?.navbarFgColor }}
            >
              <div className={`flex items-center ${isClosed ? 'justify-center' : ''}`}>
                <FaDoorClosed className="text-2xl"></FaDoorClosed>
                <span className="text-sm ml-2 font-medium lg:inline-block">Logout</span>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
