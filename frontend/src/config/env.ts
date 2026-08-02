export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.expedia.com/v1',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
