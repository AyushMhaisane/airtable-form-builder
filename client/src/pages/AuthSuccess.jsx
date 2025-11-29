import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setToken } = useContext(AuthContext);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);

            setToken(token);

            navigate('/dashboard');
        } else {
            navigate('/');
        }
    }, [searchParams, navigate, setToken]);

    return <div>Logging you in...</div>;
};

export default AuthSuccess;