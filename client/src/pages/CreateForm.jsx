import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const CreateForm = () => {
  const navigate = useNavigate();

  const [bases, setBases] = useState([]);
  const [tables, setTables] = useState([]);
  const [availableFields, setAvailableFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(false);

  const [selectedBase, setSelectedBase] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [formTitle, setFormTitle] = useState('');

  const [editingFieldId, setEditingFieldId] = useState(null);
  const [tempCondition, setTempCondition] = useState({
    relatedFieldId: '',
    operator: 'equals',
    value: ''
  });


  const styles = {
    container: { padding: '2rem', maxWidth: '900px', margin: '2rem auto', color: '#eee' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#ddd' },
    input: { width: '100%', padding: '12px', background: '#333', color: 'white', border: '1px solid #555', borderRadius: '6px', fontSize: '16px' },
    select: { width: '100%', padding: '12px', background: '#333', color: 'white', border: '1px solid #555', borderRadius: '6px', fontSize: '16px' },


    fieldContainer: { border: '1px solid #555', borderRadius: '8px', overflow: 'hidden', background: '#222', marginTop: '1rem' },

    fieldItem: (enabled) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '15px',

      background: enabled ? '#2c3e50' : '#222',
      borderBottom: '1px solid #444',
      transition: 'background 0.2s',
      color: '#fff'
    }),

    fieldName: { fontSize: '1.1em', color: '#fff', fontWeight: 'bold' },
    fieldType: { fontSize: '0.9em', color: '#aaa', marginLeft: '10px' },

    saveButton: { marginTop: '2rem', padding: '15px 30px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', width: '100%' },
    logicButton: { padding: '8px 12px', fontSize: '0.85em', background: '#555', color: 'white', border: '1px solid #666', borderRadius: '4px', cursor: 'pointer' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: '#333', padding: '2rem', borderRadius: '8px', width: '500px', border: '1px solid #555', color: 'white' }
  };

  useEffect(() => {
    axios.get('/forms/bases').then(res => setBases(res.data));
  }, []);

  useEffect(() => {
    if (!selectedBase) return;
    setTables([]); setSelectedTable(''); setAvailableFields([]);
    axios.get(`/forms/tables/${selectedBase}`).then(res => setTables(res.data));
  }, [selectedBase]);

  useEffect(() => {
    if (!selectedBase || !selectedTable) return;
    setLoadingFields(true);
    axios.get(`/forms/fields/${selectedBase}/${selectedTable}`).then(res => {
      const fields = res.data.map(f => ({
        ...f,
        enabled: false,
        customLabel: f.name,
        conditions: { logic: 'AND', rules: [] }
      }));
      setAvailableFields(fields);
      setLoadingFields(false);
    });
  }, [selectedBase, selectedTable]);

  const toggleField = (id) => {
    setAvailableFields(prev => prev.map(f =>
      f.id === id ? { ...f, enabled: !f.enabled } : f
    ));
  };

  const openLogic = (id) => {
    setEditingFieldId(id);
    setTempCondition({ relatedFieldId: '', operator: 'equals', value: '' });
  };

  const addRule = () => {
    if (!tempCondition.relatedFieldId || !tempCondition.value) return;
    setAvailableFields(prev => prev.map(f => {
      if (f.id === editingFieldId) {
        return {
          ...f,
          conditions: {
            ...f.conditions,
            rules: [...f.conditions.rules, tempCondition]
          }
        };
      }
      return f;
    }));
    setEditingFieldId(null);
  };

  const handleSave = async () => {
    const enabledFields = availableFields.filter(f => f.enabled);
    if (enabledFields.length === 0) return alert("Please select at least one field.");

    const fieldsToSave = enabledFields.map(f => ({
      airtableFieldId: f.id,
      label: f.customLabel || f.name,
      type: f.type,
      options: f.options?.choices?.map(c => c.name) || [],
      required: false,
      conditions: f.conditions
    }));

    try {
      await axios.post('/forms', {
        title: formTitle,
        baseId: selectedBase,
        tableId: selectedTable,
        fields: fieldsToSave
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Error saving form');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Create New Form</h1>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#2d7ff9', fontWeight: 'bold' }}>← Back to Dashboard</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <label style={styles.label}>1. Select Base</label>
          <select style={styles.select} onChange={(e) => setSelectedBase(e.target.value)}>
            <option value="">-- Select Base --</option>
            {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label style={styles.label}>2. Select Table</label>
          <select style={styles.select} disabled={!selectedBase} onChange={(e) => setSelectedTable(e.target.value)}>
            <option value="">-- Select Table --</option>
            {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {selectedTable && (
        <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
          <div style={{ marginBottom: '2rem' }}>
            <label style={styles.label}>3. Form Title</label>
            <input type="text" style={styles.input} placeholder="e.g., Job Application 2023" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
          </div>

          <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '1rem', color: '#fff' }}>4. Configure Fields & Logic</h3>

          {loadingFields ? <div style={{ color: '#aaa' }}>Loading fields...</div> : (
            <div style={styles.fieldContainer}>
              {availableFields.map(field => (
                <div key={field.id} style={styles.fieldItem(field.enabled)}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={field.enabled}
                      onChange={() => toggleField(field.id)}
                      style={{ marginRight: '15px', transform: 'scale(1.2)', cursor: 'pointer' }}
                    />
                    <div>

                      <strong style={styles.fieldName}>{field.name}</strong>
                      <span style={styles.fieldType}>({field.type})</span>
                    </div>
                  </div>

                  {field.enabled && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {field.conditions.rules.length > 0 && (
                        <span style={{ fontSize: '0.9em', color: '#ffc107', fontWeight: 'bold', background: 'rgba(255, 193, 7, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                          {field.conditions.rules.length} Rule(s) Active
                        </span>
                      )}
                      <button onClick={() => openLogic(field.id)} style={styles.logicButton}>
                        ⚙️ Configure Logic
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button onClick={handleSave} disabled={!formTitle} style={{ ...styles.saveButton, opacity: !formTitle ? 0.5 : 1, cursor: !formTitle ? 'not-allowed' : 'pointer' }}>
            Save & Create Form
          </button>
        </div>
      )}

      {editingFieldId && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #555', paddingBottom: '10px', color: '#fff' }}>Add Logic Rule</h2>
            <p style={{ marginBottom: '1.5rem', color: '#ccc' }}>
              Show <strong>"{availableFields.find(f => f.id === editingFieldId)?.name}"</strong> ONLY if...
            </p>

            <div style={{ marginBottom: '15px' }}>
              <label style={styles.label}>When Field:</label>
              <select style={styles.select} onChange={(e) => setTempCondition({ ...tempCondition, relatedFieldId: e.target.value })}>
                <option value="">-- Select field --</option>
                {availableFields.filter(f => f.enabled && f.id !== editingFieldId).map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={styles.label}>Operator:</label>
              <select style={styles.select} onChange={(e) => setTempCondition({ ...tempCondition, operator: e.target.value })}>
                <option value="equals">Equals (=)</option>
                <option value="not_equals">Does Not Equal (≠)</option>
                <option value="contains">Contains (Text)</option>
              </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={styles.label}>Value:</label>
              <input type="text" style={styles.input} placeholder="e.g. Engineer" onChange={(e) => setTempCondition({ ...tempCondition, value: e.target.value })} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
              <button onClick={() => setEditingFieldId(null)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #555', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addRule} style={{ padding: '10px 20px', background: '#2d7ff9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Add Rule</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default CreateForm;