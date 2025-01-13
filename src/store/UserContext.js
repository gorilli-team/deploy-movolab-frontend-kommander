import React, { createContext, useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import {
  AUTH_COOKIE_VAR,
  CORPORATE_ROLE_ADMIN,
  CORPORATE_ROLE_OPERATOR,
  http,
} from '../utils/Utils';

export const movolabAuthToken = {
  token: null,
};

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState();
  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    try {
      const data = await http({ method: 'GET', url: '/clientProfile/me' });

      data.customisations = [];

      //eslint-disable-next-line
      const websiteLayout = data.client?.websiteLayout?.forEach((setting) => {
        data.customisations[setting.key] = setting.value;
      });

      if (data.role === CORPORATE_ROLE_ADMIN || data.role === CORPORATE_ROLE_OPERATOR) {
        data.client = await http({ url: `/userCompanies/${data?.userCompany}` });
      }

      setUserData(data);
      return data;
    } catch (e) {
      await new Cookies().remove(AUTH_COOKIE_VAR, {
        path: '/',
      });
    }
  };
  const login = async (email, password) => {
    const res = await http({
      url: '/clientProfile/login',
      method: 'POST',
      form: { email, password },
    });

    if (res.token) {
      movolabAuthToken.token = res.token;
    }

    await new Cookies().remove(AUTH_COOKIE_VAR, {
      path: '/',
    });
    await new Cookies().set(AUTH_COOKIE_VAR, res.token, {
      path: '/',
      expires: new Date(Date.now() + 1000 * 3600 * 24 * 30),
    });
    setUserData(res.clientProfile);
    return await getUserInfo();
  };
  const logout = async () => {
    try {
      // Make a request to the server-side logout endpoint
      await http({ method: 'POST', url: '/clientProfile/logout' });

      setUserData(null);
      await new Cookies().remove(AUTH_COOKIE_VAR, {
        path: '/',
      });
    } catch (e) {
      console.error('User::logout (error)', e);
      throw e;
    }
  };
  const confirmAddress = async () => {
    await http({
      url: '/api/users/confirmAddress',
      method: 'POST',
    });
  };
  const updateSettings = async () => {
    throw new Error('Not implemented');
  };

  return (
    <UserContext.Provider
      value={{
        data: userData,
        getUserInfo,
        login,
        logout,
        confirmAddress,
        updateSettings,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const getCurrentPartnerCode = async (client = null) => {
  const response = await http({ url: '/partnerCode' });

  if (!client) {
    const profile = await http({ method: 'GET', url: '/clientProfile/me' });
    client = profile.client;
  }

  if (!client.partnerCode) {
    return null;
  }

  return response.partnerCodes.find((c) => c.code === client.partnerCode) || null;
};
