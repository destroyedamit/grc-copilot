import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("grc_token")
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("grc_user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const login = (accessToken, userData) => {
    localStorage.setItem("grc_token", accessToken);
    localStorage.setItem("grc_user", JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("grc_token");
    localStorage.removeItem("grc_user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}