// client/src/pages/Dashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);

  useEffect(() => {
    // Fetch user's forms
    axios.get('/forms/my-forms')
      .then(res => setForms(res.data))
      .catch(err => console.error("Failed to fetch forms", err));
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>My Forms</h1>
        <button
          onClick={() => navigate('/create')}
          style={{ padding: '10px 20px', background: '#2d7ff9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          + Create New Form
        </button>
      </div>

      {forms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed #ccc', borderRadius: '8px', color: '#666' }}>
          <h3>No forms yet</h3>
          <p>Create your first form to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {forms.map(form => (
            <div key={form._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{form.title}</h3>
              <p style={{ color: '#666', fontSize: '0.9em' }}>Base ID: {form.airtableBaseId}</p>

              {/* Buttons Container */}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>

                {/* 1. Public Link Button */}
                <Link
                  to={`/form/${form._id}`}
                  style={{ textDecoration: 'none', color: '#2d7ff9', fontWeight: 'bold' }}
                >
                  View Public Link →
                </Link>

                {/* 2. Admin View Responses Button (NEW) */}
                <Link
                  to={`/responses/${form._id}`}
                  style={{
                    textDecoration: 'none',
                    color: '#28a745',
                    fontWeight: 'bold',
                    fontSize: '0.9em',
                    border: '1px solid #28a745',
                    padding: '6px 12px',
                    borderRadius: '4px'
                  }}
                >
                  View Responses
                </Link>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;