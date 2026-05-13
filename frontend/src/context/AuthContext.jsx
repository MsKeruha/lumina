import React, { createContext, useState, useContext, useEffect } from 'react';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser(data);
        else localStorage.removeItem('token');
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const { access_token } = await res.json();
      localStorage.setItem('token', access_token);
      
      const userRes = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${access_token}` }
      });
      const userData = await userRes.json();
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const register = async (username, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    return res.ok;
  };

  const updateUser = async (updateData) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData),
    });
    if (res.ok) {
      const updatedUser = await res.json();
      setUser(updatedUser);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
