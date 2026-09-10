import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let socket = null;

export function getSocket() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Sign in before opening a retro room');
  }

  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: true,
    auth: { token },
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
