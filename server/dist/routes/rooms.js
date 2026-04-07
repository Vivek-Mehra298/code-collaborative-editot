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
const express_1 = __importDefault(require("express"));
const Room_1 = __importDefault(require("../models/Room"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId, language } = req.body;
        if (!roomId) {
            return res.status(400).json({ message: 'Room ID is required' });
        }
        let room = yield Room_1.default.findOne({ roomId });
        if (!room) {
            room = new Room_1.default({
                roomId,
                createdBy: req.user,
                language: language || 'javascript',
                code: '',
                participants: [req.user]
            });
            yield room.save();
        }
        res.json(room);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}));
router.get('/recent', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find rooms where user is participant or creator
        const rooms = yield Room_1.default.find({
            $or: [{ createdBy: req.user }, { participants: req.user }]
        }).sort({ lastActive: -1 }).limit(10);
        res.json(rooms);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}));
router.get('/:roomId', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = yield Room_1.default.findOne({ roomId: req.params.roomId });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(room);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}));
exports.default = router;
