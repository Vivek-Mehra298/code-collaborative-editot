const trimTrailingSlash = (value: string) => value.replace(/\/$/, '');

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') return 'http://localhost:5000/api';
    return `${window.location.protocol}//${window.location.host}/api`;
  }
  return 'http://localhost:5000/api';
};

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') return 'http://localhost:5000';
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://localhost:5000';
};

export const clientConfig = {
  apiUrl: trimTrailingSlash(getApiUrl()),
  socketUrl: trimTrailingSlash(getSocketUrl()),
};
