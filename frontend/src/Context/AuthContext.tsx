import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
  username: string;
  token: string | null;
  setUser: (username: string, token: string, id: string) => void;
  logout: () => void;
  userId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedName = localStorage.getItem("name");
    const storedId = localStorage.getItem("userId");

    if (storedToken) setToken(storedToken);
    if (storedName) setUsername(storedName);
    if (storedId) setUserId(storedId);
  }, []);

  const setUser = (name: string, token: string, id: string) => {
    setUsername(name);
    setToken(token);
    setUserId(id);
    localStorage.setItem("name", name);
    localStorage.setItem("token", token);
    localStorage.setItem("userId", id);
  };

  const logout = () => {
    setUsername("");
    setToken(null);
    setUserId(null);
    localStorage.removeItem("name");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ username, token, userId, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
