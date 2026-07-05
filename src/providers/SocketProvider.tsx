import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthProvider';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
};

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false, onlineUsers: [] });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!session) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.3:3008';
    
    const newSocket = io(API_URL, {
      auth: { token: session },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      setOnlineUsers([]);
    });

    newSocket.on('online_users_list', (users: string[]) => {
      setOnlineUsers(users);
    });

    newSocket.on('user_online', (userId: string) => {
      setOnlineUsers(prev => {
        if (!prev.includes(userId)) return [...prev, userId];
        return prev;
      });
    });

    newSocket.on('user_offline', (userId: string) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [session]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
