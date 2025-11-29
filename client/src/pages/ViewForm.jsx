
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import { shouldShowQuestion } from '../utils/logicEngine';

const ViewForm = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const styles = {
    page: { minHeight: '100vh', background: '#121212', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' },
    card: { width: '100%', maxWidth: '600px', background: '#1e1e1e', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '1px solid #333' },
    title: { color: '#ffffff', marginBottom: '2rem', textAlign: 'center', fontSize: '2rem' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#e0e0e0', fontSize: '1rem' },
    input: { width: '100%', padding: '12px', background: '#2c2c2c', border: '1px solid #444', borderRadius: '6px', fontSize: '16px', color: '#fff', outline: 'none', transition: 'border-color 0.2s' },
    select: { width: '100%', padding: '12px', background: '#2c2c2c', border: '1px solid #444', borderRadius: '6px', fontSize: '16px', color: '#fff', outline: 'none' },
    button: { width: '100%', padding: '14px', background: '#2d7ff9', color: 'white', border: 'none', borderRadius: '6px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1.5rem', transition: 'background 0.2s' },
    successCard: { textAlign: 'center', color: '#fff' },
    successIcon: { fontSize: '4rem', color: '#4ade80', marginBottom: '1rem' }
  };

  useEffect(() => {
    axios.get(`/forms/${id}`)
      .then(res => {
        setForm(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (fieldId, value) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/forms/submit/${id}`, { answers });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Error submitting form. Please try again.");
    }
  };

  if (loading) return <div style={styles.page}><div style={{ color: '#888' }}>Loading Form...</div></div>;
  if (!form) return <div style={styles.page}><div style={{ color: 'red' }}>Form not found</div></div>;

  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✔</div>
            <h2>Application Received!</h2>
            <p style={{ color: '#aaa', marginTop: '10px' }}>Your response has been saved securely.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{form.title}</h1>

        <form onSubmit={handleSubmit}>
          {form.fields.map(field => {


            const isVisible = shouldShowQuestion(field.conditions, answers);

            if (!isVisible) return null;

            return (
              <div key={field.airtableFieldId} style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
                <label style={styles.label}>
                  {field.label} {field.required && <span style={{ color: '#ff6b6b' }}>*</span>}
                </label>

                {(field.type === 'singleLineText' || field.type === 'email' || field.type === 'url') && (
                  <input
                    type={field.type === 'email' ? 'email' : 'text'}
                    style={styles.input}
                    onChange={(e) => handleChange(field.airtableFieldId, e.target.value)}
                    required={field.required}
                    placeholder={`Enter ${field.label}...`}
                  />
                )}

                {field.type === 'multilineText' && (
                  <textarea
                    rows="4"
                    style={{ ...styles.input, resize: 'vertical' }}
                    onChange={(e) => handleChange(field.airtableFieldId, e.target.value)}
                    required={field.required}
                  />
                )}

                {(field.type === 'singleSelect' || field.type === 'multipleSelects') && (
                  <select
                    style={styles.select}
                    onChange={(e) => handleChange(field.airtableFieldId, e.target.value)}
                    required={field.required}
                  >
                    <option value="">-- Select Option --</option>
                    {field.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}

          <button
            type="submit"
            style={styles.button}
            onMouseOver={(e) => e.target.style.background = '#1a6cd1'}
            onMouseOut={(e) => e.target.style.background = '#2d7ff9'}
          >
            Submit Application
          </button>
        </form>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    </div>
  );
};

export default ViewForm;