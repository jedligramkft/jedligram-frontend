import type { UserData } from '../Interfaces/UserData';
import httpClient from './httpClient';

var authTokenName: string = import.meta.env.VITE_AUTH_TOKEN_NAME || 'authToken';

export const Login = async (userData: UserData) => {
    const response = await httpClient.post('/api/login', userData);

    var bearerToken: string = response.data.access_token;
    localStorage.setItem(authTokenName, bearerToken);
    
    response.data.access_token = undefined;

    return {
        "status": response.status,
        "data": response.data
    };
};

export const Register = async (userData: UserData) => {
  const response = await httpClient.post('/api/register', userData);

  return {
        "status": response.status,
        "data": response.data
  };
};