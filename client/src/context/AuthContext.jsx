// client/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // We use { withCredentials: true } to send the cookie
        const res = await axios.get('http://localhost:5000/auth/me', { withCredentials: true });
        if (res.data.isAuthenticated) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.log('Not logged in');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = () => {
    // Redirects browser to backend auth route
    window.location.href = 'http://localhost:5000/auth/airtable';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login }}>
      {children}
    </AuthContext.Provider>
  );
};