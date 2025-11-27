// client/src/pages/ViewForm.jsx (DEBUG VERSION)
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';

// TEMPORARY: Dummy logic engine to prevent crashes
const shouldShowQuestion = (conditions, answers) => {
  console.log("Checking logic...", conditions);
  return true; // Always show everything for now
};

const ViewForm = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    console.log("Fetching form with ID:", id); // Debug Log 1
    axios.get(`/forms/${id}`)
      .then(res => {
        console.log("Form Data Received:", res.data); // Debug Log 2
        setForm(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (fieldId, value) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };
  const [submitted, setSubmitted] = useState(false);
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

  // Add a success message view
  if (submitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '3rem', textAlign: 'center', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h1 style={{ color: 'green', fontSize: '3rem' }}>✔</h1>
        <h2>Application Received!</h2>
        <p>Your response has been saved to Airtable.</p>
      </div>
    );
  }

  if (loading) return <div>Loading Form... (Check Console)</div>;
  if (!form) return <div>Form not found (Check ID)</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd' }}>
      <h1>{form.title}</h1>
      <p style={{ color: 'red' }}>DEBUG MODE: Logic Disabled</p>

      <form onSubmit={handleSubmit}>
        {form.fields.map(field => {
          // Verify field structure
          if (!field.airtableFieldId) return <div style={{ color: 'red' }}>Bad Field Data</div>;

          return (
            <div key={field.airtableFieldId} style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>
                {field.label}
              </label>

              {/* Render Inputs */}
              <input
                type="text"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
                onChange={(e) => handleChange(field.airtableFieldId, e.target.value)}
              />
            </div>
          );
        })}
        <button type="submit" style={{ marginTop: '20px', padding: '10px' }}>Submit</button>
      </form>
    </div>
  );
};

export default ViewForm;