// client/src/pages/CreateForm.jsx
import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const CreateForm = () => {
  const navigate = useNavigate();
  
  // Data
  const [bases, setBases] = useState([]);
  const [tables, setTables] = useState([]);
  const [availableFields, setAvailableFields] = useState([]);

  // Selections
  const [selectedBase, setSelectedBase] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [formTitle, setFormTitle] = useState('');
  
  // Modal State for Logic
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [tempCondition, setTempCondition] = useState({
    relatedFieldId: '',
    operator: 'equals',
    value: ''
  });

  // 1. Fetch Bases
  useEffect(() => {
    axios.get('/forms/bases').then(res => setBases(res.data));
  }, []);

  // 2. Fetch Tables
  useEffect(() => {
    if (!selectedBase) return;
    axios.get(`/forms/tables/${selectedBase}`).then(res => setTables(res.data));
  }, [selectedBase]);

  // 3. Fetch Fields
  useEffect(() => {
    if (!selectedBase || !selectedTable) return;
    axios.get(`/forms/fields/${selectedBase}/${selectedTable}`).then(res => {
      const fields = res.data.map(f => ({
        ...f,
        enabled: false,
        customLabel: f.name,
        // Initialize logic structure
        conditions: { logic: 'AND', rules: [] } 
      }));
      setAvailableFields(fields);
    });
  }, [selectedBase, selectedTable]);

  // Toggle Field Visibility
  const toggleField = (id) => {
    setAvailableFields(prev => prev.map(f => 
      f.id === id ? { ...f, enabled: !f.enabled } : f
    ));
  };

  // Open Logic Modal
  const openLogic = (id) => {
    setEditingFieldId(id);
    setTempCondition({ relatedFieldId: '', operator: 'equals', value: '' });
  };

  // Save Logic Rule
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
    setEditingFieldId(null); // Close modal
  };

  // Save to Backend
  const handleSave = async () => {
    const enabledFields = availableFields.filter(f => f.enabled);
    
    // Transform to Schema format
    const fieldsToSave = enabledFields.map(f => ({
      airtableFieldId: f.id,
      label: f.customLabel || f.name,
      type: f.type,
      options: f.options?.choices?.map(c => c.name) || [],
      required: false,
      conditions: f.conditions // Pass the logic rules
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
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Create Smart Form</h1>

      {/* Base/Table Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <label>Base</label>
          <select style={{ width: '100%', padding: '8px' }} onChange={(e) => setSelectedBase(e.target.value)}>
            <option value="">-- Select Base --</option>
            {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label>Table</label>
          <select style={{ width: '100%', padding: '8px' }} disabled={!selectedBase} onChange={(e) => setSelectedTable(e.target.value)}>
            <option value="">-- Select Table --</option>
            {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {selectedTable && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <label>Form Title</label>
            <input type="text" style={{ width: '100%', padding: '8px' }} value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
          </div>

          <h3>Configure Fields & Logic</h3>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            {availableFields.map(field => (
              <div key={field.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: field.enabled ? '#f0f9ff' : 'white', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" checked={field.enabled} onChange={() => toggleField(field.id)} style={{ marginRight: '10px' }} />
                  <strong>{field.name}</strong>
                  <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '5px' }}>({field.type})</span>
                </div>
                
                {field.enabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Show existing rules count */}
                    {field.conditions.rules.length > 0 && (
                      <span style={{ fontSize: '0.8em', color: 'orange', fontWeight: 'bold' }}>
                        {field.conditions.rules.length} Rule(s)
                      </span>
                    )}
                    <button 
                      onClick={() => openLogic(field.id)}
                      style={{ padding: '5px 10px', fontSize: '0.8em', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      + Add Logic
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={handleSave} disabled={!formTitle} style={{ marginTop: '2rem', padding: '12px 24px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Save Form
          </button>
        </>
      )}

      {/* --- LOGIC MODAL (Simple Inline Overlay) --- */}
      {editingFieldId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px' }}>
            <h3>Add Logic Rule</h3>
            <p>Show this field ONLY if...</p>
            
            <div style={{ marginBottom: '10px' }}>
              <label>When Field:</label>
              <select 
                style={{ width: '100%', padding: '5px' }}
                onChange={(e) => setTempCondition({ ...tempCondition, relatedFieldId: e.target.value })}
              >
                <option value="">-- Select Field --</option>
                {availableFields.filter(f => f.enabled && f.id !== editingFieldId).map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>Operator:</label>
              <select 
                style={{ width: '100%', padding: '5px' }}
                onChange={(e) => setTempCondition({ ...tempCondition, operator: e.target.value })}
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Does Not Equal</option>
                <option value="contains">Contains</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Value:</label>
              <input 
                type="text" 
                style={{ width: '100%', padding: '5px' }}
                placeholder="e.g. Engineer"
                onChange={(e) => setTempCondition({ ...tempCondition, value: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setEditingFieldId(null)}>Cancel</button>
              <button onClick={addRule} style={{ background: '#2d7ff9', color: 'white', border: 'none', padding: '5px 15px' }}>Add Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateForm;