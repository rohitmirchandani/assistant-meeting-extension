import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getFromStorage, setInStorage, STORAGE } from '../../public/utility';

const setupInterceptors = async (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // config.headers.Proxy_auth_token = localStorage.getItem(STORAGE.token);
      config.headers.Proxy_auth_token = await getFromStorage(STORAGE.token);
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        await setInStorage(STORAGE.token, null);
        window.dispatchEvent(new CustomEvent('assistant_unauthorized'));
      }
      return Promise.reject(error);
    }
  );
};

const baseApi = axios.create({ baseURL: 'https://routes.msg91.com/api/proxy/870623/36jowpr17' });
const proxyApi = axios.create({ baseURL: 'https://routes.msg91.com/api' });

setupInterceptors(proxyApi);
setupInterceptors(baseApi);

export { proxyApi, baseApi };
