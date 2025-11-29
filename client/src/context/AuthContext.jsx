// client/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import axios from '../api/axios'; // This uses your configured instance

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/auth/me'); // Axios handles the base URL automatically
        if (res.data.isAuthenticated) {
          setUser(res.data.user);
        }
      } catch (err) {
        // Not logged in, which is fine
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = () => {
    // 1. Get the API URL from the environment (e.g., https://...onrender.com/api)
    // or fallback to localhost if developing locally
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // 2. We need the ROOT URL (remove '/api' from the end)
    // because the auth route is at /auth, not /api/auth
    const rootUrl = apiUrl.replace('/api', '');

    // 3. Redirect the browser
    window.location.href = `${rootUrl}/auth/airtable`;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login }}>
      {children}
    </AuthContext.Provider>
  );
};