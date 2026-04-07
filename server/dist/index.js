"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./db"));
const config_1 = require("./config");
const auth_1 = __importDefault(require("./routes/auth"));
const rooms_1 = __importDefault(require("./routes/rooms"));
const handlers_1 = require("./socket/handlers");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const corsOptions = {
    origin(origin, callback) {
        if ((0, config_1.isOriginAllowed)(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`Origin ${origin !== null && origin !== void 0 ? origin : 'unknown'} is not allowed by CORS`));
    },
    credentials: true,
};
app.set('trust proxy', 1);
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.get('/api/health', (_req, res) => {
    res.json({
        ok: true,
        environment: config_1.config.nodeEnv,
        allowedOrigins: (0, config_1.getAllowedOrigins)(),
        uptime: process.uptime(),
    });
});
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/rooms', rooms_1.default);
// Socket.io
const io = new socket_io_1.Server(server, {
    cors: {
        origin(origin, callback) {
            if ((0, config_1.isOriginAllowed)(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error(`Origin ${origin !== null && origin !== void 0 ? origin : 'unknown'} is not allowed by Socket.IO`));
        },
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
(0, handlers_1.setupSocketHandlers)(io);
// Database Connection
(0, db_1.default)();
const PORT = config_1.config.port;
const HOST = config_1.config.host;
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use on ${HOST}. Stop the existing process or set a different PORT.`);
        return;
    }
    console.error('Server startup error:', error);
});
server.listen(PORT, HOST, () => {
    const localUrl = `http://localhost:${PORT}`;
    console.log(`Server running at ${localUrl} (${config_1.isProduction ? 'production' : 'development'})`);
});
