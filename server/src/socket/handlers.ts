import { Server, Socket } from 'socket.io';
import Room from '../models/Room';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join-room', async ({ roomId, userId, username }) => {
      socket.join(roomId);
      console.log(`User ${username} joined room ${roomId}`);

      try {
        // Fetch room to get current state
        const room = await Room.findOne({ roomId }).populate('participants', 'name email');
        if (room) {
          // Update lastActive
          room.lastActive = new Date();
          
          if (!room.participants.some((p: any) => p._id.toString() === userId)) {
            room.participants.push(userId);
          }
          await room.save();
          const populatedRoom = await Room.findById(room._id).populate('participants', 'name email');

          // Send current state to the joining user
          socket.emit('room-joined', {
            participants: populatedRoom?.participants ?? [],
            currentCode: populatedRoom?.code ?? room.code,
            language: populatedRoom?.language ?? room.language,
          });

          // Broadcast to others
          socket.to(roomId).emit('user-joined', { userId, username });
        }
      } catch (err) {
        console.error('Error joining room:', err);
      }
    });

    socket.on('code-change', async ({ roomId, code, cursorPosition }) => {
      // Broadcast to others in the room
      socket.to(roomId).emit('code-updated', { code, changedBy: socket.id, cursorPosition });
      
      // Debounced save could be done here or handled by client debouncing
      try {
        await Room.findOneAndUpdate({ roomId }, { code, lastActive: new Date() });
      } catch (err) {
        console.error('Error saving code:', err);
      }
    });

    socket.on('language-change', async ({ roomId, language }) => {
      socket.to(roomId).emit('language-updated', { language });
      try {
        await Room.findOneAndUpdate({ roomId }, { language, lastActive: new Date() });
      } catch (err) {
        console.error('Error saving language:', err);
      }
    });

    socket.on('leave-room', async ({ roomId, userId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', { userId });
      console.log(`User ${userId} left room ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Would need to track which user was in which room to emit user-left appropriately
    });
  });
};
