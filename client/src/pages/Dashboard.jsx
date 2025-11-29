import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const styles = {
    page: { minHeight: '100vh', background: '#1a1a1a', color: '#eee', padding: '2rem' },
    container: { maxWidth: '1200px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid #333', paddingBottom: '20px' },
    title: { fontSize: '2.5rem', fontWeight: 'bold', margin: 0, background: 'linear-gradient(90deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    createButton: { padding: '12px 24px', background: '#2d7ff9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', boxShadow: '0 4px 14px rgba(45, 127, 249, 0.3)' },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' },

    card: { background: '#2d2d2d', border: '1px solid #444', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column' },
    cardTitle: { margin: '0 0 10px 0', fontSize: '1.4rem', color: '#fff' },
    cardMeta: { color: '#888', fontSize: '0.9rem', marginBottom: '2rem', fontFamily: 'monospace', background: '#222', padding: '5px 10px', borderRadius: '4px', display: 'inline-block' },

    buttonGroup: { marginTop: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap' },
    btn: { textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

    viewBtn: { color: '#63b3ed', background: 'rgba(49, 130, 206, 0.15)', border: '1px solid #3182ce' },
    responseBtn: { color: '#68d391', background: 'rgba(56, 161, 105, 0.15)', border: '1px solid #38a169' },
    shareBtn: { color: '#f6e05e', background: 'rgba(236, 201, 75, 0.15)', border: '1px solid #d69e2e' }
  };

  useEffect(() => {
    axios.get('/forms/my-forms')
      .then(res => {
        setForms(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch forms", err);
        setLoading(false);
      });
  }, []);

  const handleCopyLink = (formId) => {
    const publicUrl = `${window.location.origin}/form/${formId}`;

    navigator.clipboard.writeText(publicUrl).then(() => {
      alert("Link copied to clipboard!\n\nSend this to anyone to fill out the form.");
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Forms</h1>
          <button onClick={() => navigate('/create')} style={styles.createButton}>+ Create New Form</button>
        </div>

        {loading ? (
          <div style={{ color: '#666', textAlign: 'center' }}>Loading workspace...</div>
        ) : forms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', border: '2px dashed #444', borderRadius: '12px', background: '#252525' }}>
            <h3 style={{ color: '#fff' }}>No forms yet</h3>
            <p style={{ color: '#888' }}>Create your first form to start collecting data.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {forms.map(form => (
              <div key={form._id} style={styles.card}>
                <h3 style={styles.cardTitle}>{form.title || "Untitled Form"}</h3>
                <div><span style={styles.cardMeta}>Base: {form.airtableBaseId.substring(0, 8)}...</span></div>

                <div style={styles.buttonGroup}>

                  <Link to={`/form/${form._id}`} style={{ ...styles.btn, ...styles.viewBtn }}>
                    👁️ View Form
                  </Link>


                  <Link to={`/responses/${form._id}`} style={{ ...styles.btn, ...styles.responseBtn }}>
                    📊 View Response
                  </Link>


                  <button
                    onClick={() => handleCopyLink(form._id)}
                    style={{ ...styles.btn, ...styles.shareBtn }}
                    title="Copy Link to Clipboard"
                  >
                    🔗 Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;