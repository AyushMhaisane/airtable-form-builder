// client/src/pages/AuthSuccess.jsx
import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext); // We will add setToken next

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // 1. Save to LocalStorage
      localStorage.setItem('token', token);
      
      // 2. Update Context
      setToken(token);

      // 3. Redirect to Dashboard
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  }, [searchParams, navigate, setToken]);

  return <div>Logging you in...</div>;
};

export default AuthSuccess;