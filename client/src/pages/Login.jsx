import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const { login, user } = useContext(AuthContext);

  if (user) return <Navigate to="/dashboard" />;

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h1>Airtable Form Builder</h1>
        <p>Login to start building forms</p>
        <button 
          onClick={login}
          style={{ padding: '10px 20px', fontSize: '16px', background: '#2d7ff9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Login with Airtable
        </button>
      </div>
    </div>
  );
};

export default Login;
