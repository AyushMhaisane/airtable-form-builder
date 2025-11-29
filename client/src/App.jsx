// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import FormResponses from './pages/FormResponses';
import AuthSuccess from './pages/AuthSuccess';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateForm from './pages/CreateForm';
import ViewForm from './pages/ViewForm';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          
          <Route path="/" element={<Login />} />

         
          <Route path="/form/:id" element={<ViewForm />} />

         
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route
            path="/responses/:formId"
            element={
              <PrivateRoute>
                <FormResponses />
              </PrivateRoute>
            }
          />

          <Route
            path="/create"
            element={
              <PrivateRoute>
                <CreateForm />
              </PrivateRoute>
            }
          />

        
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;