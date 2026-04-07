"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOriginAllowed = exports.getAllowedOrigins = exports.getMongoUri = exports.getJwtSecret = exports.assertRequiredEnv = exports.isProduction = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DEFAULT_PORT = 5000;
const DEFAULT_DEV_HOST = '127.0.0.1';
const DEFAULT_PROD_HOST = '0.0.0.0';
const parseNumber = (value, fallback) => {
    if (!value) {
        return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
const normalizeOrigin = (origin) => origin.trim().replace(/\/$/, '');
const splitOrigins = (value) => (value !== null && value !== void 0 ? value : '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const wildcardToRegex = (pattern) => {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`);
};
const allowedOriginPatterns = splitOrigins(process.env.ALLOWED_ORIGINS).map((origin) => ({
    raw: origin,
    regex: wildcardToRegex(normalizeOrigin(origin)),
}));
exports.config = {
    port: parseNumber(process.env.PORT, DEFAULT_PORT),
    nodeEnv: (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : 'development',
    host: (_b = process.env.HOST) !== null && _b !== void 0 ? _b : (process.env.NODE_ENV === 'production' ? DEFAULT_PROD_HOST : DEFAULT_DEV_HOST),
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    allowedOriginPatterns,
};
exports.isProduction = exports.config.nodeEnv === 'production';
const DEVELOPMENT_JWT_SECRET = 'dev-jwt-secret-change-me';
const DEVELOPMENT_MONGO_URI = 'mongodb://127.0.0.1:27017/collaborative-editor';
let hasWarnedAboutDevJwtSecret = false;
let hasWarnedAboutDevMongoUri = false;
const assertRequiredEnv = (name, value) => {
    if (!value) {
        throw new Error(`${name} is required.`);
    }
    return value;
};
exports.assertRequiredEnv = assertRequiredEnv;
const getJwtSecret = () => {
    if (exports.config.jwtSecret) {
        return exports.config.jwtSecret;
    }
    if (exports.isProduction) {
        throw new Error('JWT_SECRET is required.');
    }
    if (!hasWarnedAboutDevJwtSecret) {
        console.warn('JWT_SECRET is not set. Using an insecure development fallback. Set JWT_SECRET in server/.env before deploying.');
        hasWarnedAboutDevJwtSecret = true;
    }
    return DEVELOPMENT_JWT_SECRET;
};
exports.getJwtSecret = getJwtSecret;
const getMongoUri = () => {
    if (exports.config.mongoUri) {
        return exports.config.mongoUri;
    }
    if (exports.isProduction) {
        throw new Error('MONGO_URI is required.');
    }
    if (!hasWarnedAboutDevMongoUri) {
        console.warn('MONGO_URI is not set. Using local MongoDB fallback at mongodb://127.0.0.1:27017/collaborative-editor.');
        hasWarnedAboutDevMongoUri = true;
    }
    return DEVELOPMENT_MONGO_URI;
};
exports.getMongoUri = getMongoUri;
const getAllowedOrigins = () => exports.config.allowedOriginPatterns.map((pattern) => pattern.raw);
exports.getAllowedOrigins = getAllowedOrigins;
const isOriginAllowed = (origin) => {
    if (!origin) {
        return true;
    }
    const normalizedOrigin = normalizeOrigin(origin);
    if (!exports.config.allowedOriginPatterns.length) {
        return !exports.isProduction;
    }
    return exports.config.allowedOriginPatterns.some((pattern) => pattern.regex.test(normalizedOrigin));
};
exports.isOriginAllowed = isOriginAllowed;
