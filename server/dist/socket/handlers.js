"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const Room_1 = __importDefault(require("../models/Room"));
const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        socket.on('join-room', (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, userId, username }) {
            socket.join(roomId);
            console.log(`User ${username} joined room ${roomId}`);
            try {
                // Fetch room to get current state
                const room = yield Room_1.default.findOne({ roomId }).populate('participants', 'name email');
                if (room) {
                    // Update lastActive
                    room.lastActive = new Date();
                    if (!room.participants.some((p) => p._id.toString() === userId)) {
                        room.participants.push(userId);
                    }
                    yield room.save();
                    // Send current state to the joining user
                    socket.emit('room-joined', {
                        participants: room.participants,
                        currentCode: room.code,
                        language: room.language,
                    });
                    // Broadcast to others
                    socket.to(roomId).emit('user-joined', { userId, username });
                }
            }
            catch (err) {
                console.error('Error joining room:', err);
            }
        }));
        socket.on('code-change', (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, code, cursorPosition }) {
            // Broadcast to others in the room
            socket.to(roomId).emit('code-updated', { code, changedBy: socket.id, cursorPosition });
            // Debounced save could be done here or handled by client debouncing
            try {
                yield Room_1.default.findOneAndUpdate({ roomId }, { code, lastActive: new Date() });
            }
            catch (err) {
                console.error('Error saving code:', err);
            }
        }));
        socket.on('language-change', (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, language }) {
            socket.to(roomId).emit('language-updated', { language });
            try {
                yield Room_1.default.findOneAndUpdate({ roomId }, { language, lastActive: new Date() });
            }
            catch (err) {
                console.error('Error saving language:', err);
            }
        }));
        socket.on('leave-room', (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, userId }) {
            socket.leave(roomId);
            socket.to(roomId).emit('user-left', { userId });
            console.log(`User ${userId} left room ${roomId}`);
        }));
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
            // Would need to track which user was in which room to emit user-left appropriately
        });
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
