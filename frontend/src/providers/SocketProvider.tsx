/**
 * Socket.tsx
 * ----------
 * Provides a singleton Socket.IO client connection to the backend server.
 * Exposes `useSocket()` hook to easily use `socket` anywhere in the app.
 */

import React, { type ReactNode, useMemo } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextValue {
  socket: Socket;
}

const SocketContext = React.createContext<SocketContextValue | null>(null);

// Custom hook to access socket instance
export const useSocket = (): SocketContextValue => {
  const context = React.useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used within a SocketProvider");
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  // Create socket connection only once using useMemo
  const socket = useMemo<Socket>(
    () =>
      io(
        import.meta.env.VITE_BACKEND_URL ||
          "https://meshspire-core.onrender.com",
        {
          transports: ["websocket"], // force WebSocket (better for signaling)
          autoConnect: true,
        }
      ),
    []
  );

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
