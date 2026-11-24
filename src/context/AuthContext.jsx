import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('school_admin_token');
    const storedUser = localStorage.getItem('school_admin_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const allowedRoles = ['PRINCIPAL', 'SCHOOL_ADMIN', 'SUPER_ADMIN'];
      if (!allowedRoles.includes(res.data.user.role)) {
        throw new Error('Access denied. School Admin or Principal credentials required.');
      }
      localStorage.setItem('school_admin_token', res.data.token);
      localStorage.setItem('school_admin_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('school_admin_token');
    localStorage.removeItem('school_admin_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
