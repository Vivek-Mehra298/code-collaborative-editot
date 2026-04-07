import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_PORT = 5000;
const DEFAULT_DEV_HOST = '0.0.0.0';
const DEFAULT_PROD_HOST = '0.0.0.0';
const LOCAL_ONLY_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);
const DEFAULT_DEV_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

const parseNumber = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, '');

const splitOrigins = (value: string | undefined) =>
  (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const wildcardToRegex = (pattern: string) => {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
};

const configuredOrigins = splitOrigins(process.env.ALLOWED_ORIGINS);
const allowedOriginPatterns = configuredOrigins.map((origin) => ({
  raw: origin,
  regex: wildcardToRegex(normalizeOrigin(origin)),
}));
const devAllowedOriginPatterns = DEFAULT_DEV_ALLOWED_ORIGINS.map((origin) => ({
  raw: origin,
  regex: wildcardToRegex(normalizeOrigin(origin)),
}));

export const config = {
  port: parseNumber(process.env.PORT, DEFAULT_PORT),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  host:
    process.env.NODE_ENV === 'production' && process.env.HOST && LOCAL_ONLY_HOSTS.has(process.env.HOST)
      ? DEFAULT_PROD_HOST
      : process.env.HOST ?? (process.env.NODE_ENV === 'production' ? DEFAULT_PROD_HOST : DEFAULT_DEV_HOST),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  allowedOriginPatterns,
};

export const isProduction = config.nodeEnv === 'production';
const DEVELOPMENT_JWT_SECRET = 'dev-jwt-secret-change-me';
const DEVELOPMENT_MONGO_URI = 'mongodb://127.0.0.1:27017/collaborative-editor';
let hasWarnedAboutDevJwtSecret = false;
let hasWarnedAboutDevMongoUri = false;

export const assertRequiredEnv = (name: 'MONGO_URI' | 'JWT_SECRET', value: string | undefined) => {
  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
};

export const getJwtSecret = () => {
  if (config.jwtSecret) {
    return config.jwtSecret;
  }

  if (isProduction) {
    throw new Error('JWT_SECRET is required.');
  }

  if (!hasWarnedAboutDevJwtSecret) {
    console.warn(
      'JWT_SECRET is not set. Using an insecure development fallback. Set JWT_SECRET in server/.env before deploying.'
    );
    hasWarnedAboutDevJwtSecret = true;
  }

  return DEVELOPMENT_JWT_SECRET;
};

export const getMongoUri = () => {
  if (config.mongoUri) {
    return config.mongoUri;
  }

  if (isProduction) {
    throw new Error('MONGO_URI is required.');
  }

  if (!hasWarnedAboutDevMongoUri) {
    console.warn(
      'MONGO_URI is not set. Using local MongoDB fallback at mongodb://127.0.0.1:27017/collaborative-editor.'
    );
    hasWarnedAboutDevMongoUri = true;
  }

  return DEVELOPMENT_MONGO_URI;
};

export const getAllowedOrigins = () => {
  const configured = config.allowedOriginPatterns.map((pattern) => pattern.raw);

  if (isProduction) {
    return configured;
  }

  return Array.from(new Set([...configured, ...DEFAULT_DEV_ALLOWED_ORIGINS]));
};

export const isOriginAllowed = (origin: string | undefined) => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = normalizeOrigin(origin);

  if (!config.allowedOriginPatterns.length) {
    return !isProduction;
  }

  if (config.allowedOriginPatterns.some((pattern) => pattern.regex.test(normalizedOrigin))) {
    return true;
  }

  if (!isProduction) {
    return devAllowedOriginPatterns.some((pattern) => pattern.regex.test(normalizedOrigin));
  }

  return false;
};
