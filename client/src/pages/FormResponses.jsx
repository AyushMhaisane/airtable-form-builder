import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';

const FormResponses = () => {
    const { formId } = useParams();
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/forms/${formId}/responses`)
            .then(res => {
                setResponses(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [formId]);

    if (loading) return <div style={{ padding: '2rem', color: '#eee' }}>Loading Data...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'white' }}>Form Responses</h1>
                <Link to="/dashboard" style={{ textDecoration: 'none', color: '#2d7ff9', fontWeight: 'bold' }}>← Back to Dashboard</Link>
            </div>

            {responses.length === 0 ? (
                <div style={{ padding: '3rem', background: '#2d2d2d', borderRadius: '8px', textAlign: 'center', border: '1px solid #444' }}>
                    <h3 style={{ color: '#fff' }}>No responses yet</h3>
                    <p style={{ color: '#aaa' }}>Share your public link to collect data!</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto', border: '1px solid #444', borderRadius: '8px', background: '#1e1e1e' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px', textalign: 'left' }}>
                        <thead style={{ background: '#333' }}>
                            <tr>
                                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #555', color: '#fff' }}>#</th>
                                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #555', color: '#fff' }}>Date</th>
                                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #555', color: '#fff' }}>Airtable ID</th>
                                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #555', color: '#fff' }}>Answers Preview</th>
                            </tr>
                        </thead>
                        <tbody>
                            {responses.map((res, index) => (
                                <tr key={res._id} style={{ borderBottom: '1px solid #444', background: index % 2 === 0 ? '#1e1e1e' : '#252525' }}>
                                    <td style={{ padding: '15px', color: '#ddd' }}>{responses.length - index}</td>
                                    <td style={{ padding: '15px', color: '#aaa' }}>
                                        {new Date(res.submittedAt).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '15px', fontFamily: 'monospace', color: '#81c784' }}>
                                        {res.airtableRecordId}
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {Object.entries(res.answers).map(([key, value]) => (
                                                <span key={key} style={{ background: '#004d40', padding: '4px 10px', borderRadius: '15px', fontSize: '0.85em', border: '1px solid #00796b', color: '#e0f2f1' }}>
                                                    {String(value).substring(0, 25)}{String(value).length > 25 ? '...' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FormResponses;