const trimTrailingSlash = (value: string) => value.replace(/\/$/, '');
const isLocalHostname = (hostname: string) =>
  hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

const getConfiguredApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return `${trimTrailingSlash(process.env.NEXT_PUBLIC_SOCKET_URL)}/api`;
  return null;
};

const getApiUrl = () => {
  const configuredApiUrl = getConfiguredApiUrl();

  if (configuredApiUrl && typeof window === 'undefined') {
    return configuredApiUrl;
  }

  if (typeof window !== 'undefined') {
    if (isLocalHostname(window.location.hostname)) {
      return configuredApiUrl ?? 'http://localhost:5000/api';
    }

    // In deployed environments we use the Next.js proxy route so the browser
    // does not need to call the Railway origin directly.
    return '/api';
  }

  return configuredApiUrl ?? 'http://localhost:5000/api';
};

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
  if (typeof window !== 'undefined') {
    if (isLocalHostname(window.location.hostname)) return 'http://localhost:5000';
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://localhost:5000';
};

export const clientConfig = {
  apiUrl: trimTrailingSlash(getApiUrl()),
  socketUrl: trimTrailingSlash(getSocketUrl()),
};
