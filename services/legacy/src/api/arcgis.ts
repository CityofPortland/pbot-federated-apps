import axios from 'axios';

const axiosInstance = axios.create();

// ESRI REST services don't play well with axios's nested JSON parameter stringify op
axiosInstance.interceptors.request.use((config) => {
  config.paramsSerializer = (params) => {
    const query = new Array<string>();

    Object.keys(params).forEach((key) => {
      const value = typeof params[key] == 'object' ? JSON.stringify(params[key]) : params[key];
      query.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    });

    return query.join('&');
  };

  return config;
});

export default axiosInstance;
