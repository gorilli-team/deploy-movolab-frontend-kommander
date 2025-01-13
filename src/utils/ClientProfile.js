import { CLIENT_ROLE_ADMIN, MOVOLAB_ROLE_ADMIN } from './Utils';

export const checkClientProfileIsAdmin = (currentClient) => {
  return currentClient?.role === CLIENT_ROLE_ADMIN || currentClient?.role === MOVOLAB_ROLE_ADMIN;
};

export const checkClientProfileIsMovolabAdmin = (currentClient) => {
  return currentClient?.role === MOVOLAB_ROLE_ADMIN;
};
