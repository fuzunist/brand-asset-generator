import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeamManagementPage = () => {
    const [team, setTeam] = useState([]);
    const [inviteeEmail, setInviteeEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchTeam = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/team');
            setTeam(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch team members.');
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const handleInvite = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await axios.post('http://localhost:3001/api/invitations', { inviteeEmail });
            setMessage(`Invitation sent to ${inviteeEmail}.`);
            setInviteeEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send invitation.');
        }
    };
    
    const handleRevoke = async (memberId) => {
        if (window.confirm('Are you sure you want to revoke access for this user?')) {
            try {
                await axios.delete(`http://localhost:3001/api/team/${memberId}`);
                setMessage('User access revoked.');
                fetchTeam(); // Refresh the team list
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to revoke access.');
            }
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
            <h2>Team Management</h2>
            
            <div style={{ marginBottom: '40px' }}>
                <h3>Invite New Member</h3>
                <form onSubmit={handleInvite}>
                    <input 
                        type="email" 
                        value={inviteeEmail} 
                        onChange={(e) => setInviteeEmail(e.target.value)} 
                        placeholder="user@agency.com" 
                        required 
                        style={{ padding: '8px', marginRight: '10px' }}
                    />
                    <button type="submit" style={{ padding: '8px 12px', background: '#4F46E5', color: 'white', border: 'none', cursor: 'pointer' }}>Send Invitation</button>
                </form>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}

            <div>
                <h3>Current Team Members</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Email</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Role</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team.map(member => (
                            <tr key={member.id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{member.full_name}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{member.email}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{member.role}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {member.role === 'guest' && (
                                        <button 
                                            onClick={() => handleRevoke(member.id)}
                                            style={{ background: 'none', border: '1px solid red', color: 'red', cursor: 'pointer' }}
                                        >
                                            Revoke Access
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamManagementPage; 