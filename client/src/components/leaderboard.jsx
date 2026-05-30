import React, { useState, useEffect } from 'react';
import { fetchLeaderboard, addFriend } from '../services/authService';
import '../App.css';

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Add friend modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [friendEmail, setFriendEmail] = useState('');
    const [submittingFriend, setSubmittingFriend] = useState(false);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const data = await fetchLeaderboard();
            if (Array.isArray(data)) {
                setLeaderboard(data);
                setError('');
            } else {
                setError('Failed to load leaderboard data.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while loading leaderboard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const handleAddFriendSubmit = async (e) => {
        e.preventDefault();
        if (!friendEmail.trim()) return;

        setSubmittingFriend(true);
        setError('');
        setSuccessMessage('');

        try {
            const res = await addFriend(friendEmail);
            if (res.message && !res.message.includes('error') && !res.message.includes('already') && res.message.toLowerCase().includes('success')) {
                setSuccessMessage(res.message);
                setFriendEmail('');
                setIsModalOpen(false);
                // Refresh list
                loadLeaderboard();
            } else {
                setError(res.message || 'Could not add friend. Make sure the email is correct and registered.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
        } finally {
            setSubmittingFriend(false);
        }
    };

    return (
        <div className="container" style={{ padding: 0, marginTop: "2rem" }}>
            <div className="analytics-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 className="chart-title" style={{ marginBottom: '0.2rem' }}>🏆 Weekly Leaderboard</h2>
                        <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                            Compare your productive minutes this week with your friends!
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setError(''); setSuccessMessage(''); setIsModalOpen(true); }}>
                        ➕ Add Friend
                    </button>
                </div>
                
                {successMessage && <div className="success-message" style={{ marginTop: '1.5rem' }}>{successMessage}</div>}
                {error && <div className="error-message" style={{ marginTop: '1.5rem' }}>{error}</div>}

                <div style={{ marginTop: '2.5rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            ⏳ Syncing leaderboard data...
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--hover-bg)', borderRadius: '12px' }}>
                            <p style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>No friends added yet</p>
                            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Add friends by their email to start competing!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {leaderboard.map((user) => (
                                <div 
                                    key={user.id} 
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        background: user.isUser ? "rgba(129, 140, 248, 0.08)" : "var(--card-bg)",
                                        border: user.isUser ? "2px solid var(--accent-indigo)" : "1px solid var(--border-color)",
                                        padding: "1.2rem 1.8rem",
                                        borderRadius: "16px",
                                        boxShadow: user.isUser ? "var(--shadow-md)" : "var(--shadow-sm)",
                                        transition: 'transform 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div style={{ 
                                            width: "44px", 
                                            height: "44px", 
                                            borderRadius: "50%", 
                                            background: user.rank === 1 ? "#fcd34d" : user.rank === 2 ? "#e5e7eb" : user.rank === 3 ? "#d4a373" : "var(--hover-bg)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: "800",
                                            fontSize: "1.05rem",
                                            color: user.rank <= 3 ? "#000" : "var(--text-primary)",
                                            boxShadow: user.rank <= 3 ? "0 4px 10px rgba(0,0,0,0.1)" : "none"
                                        }}>
                                            #{user.rank}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: "1.15rem", fontWeight: '700', color: "var(--text-primary)" }}>
                                                {user.name}
                                            </h4>
                                            <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)", display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <span>🔥 {user.streak} active {user.streak === 1 ? 'day' : 'days'} this week</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <span style={{ fontSize: '1.6rem', fontWeight: "800", color: "var(--accent-indigo)", letterSpacing: '-0.5px' }}>
                                            {user.score}
                                        </span>
                                        <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginLeft: "0.4rem", fontWeight: '600' }}>min</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Add Friend Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        <h3 className="modal-title">🤝 Add Friend</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '-0.5rem', marginBottom: '1.8rem' }}>
                            Enter your friend's email address to add them and compare productivity timelines.
                        </p>
                        <form onSubmit={handleAddFriendSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="friend-email">Friend's Registered Email</label>
                                <input 
                                    id="friend-email"
                                    type="email" 
                                    className="form-input" 
                                    value={friendEmail} 
                                    onChange={(e) => setFriendEmail(e.target.value)} 
                                    required 
                                    placeholder="friend@example.com"
                                    autoFocus
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submittingFriend}>
                                    {submittingFriend ? 'Sending Request...' : 'Add Friend'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Leaderboard;
