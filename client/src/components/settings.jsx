import { useState, useEffect } from "react";
import { getCurrentUser, updateProfile, changePassword, deleteAccount } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Settings() {
    const navigate = useNavigate();
    
    // Profile State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [defaultCategory, setDefaultCategory] = useState("Study");
    const [dailyGoal, setDailyGoal] = useState(120);
    
    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    
    // Status State
    const [profileMsg, setProfileMsg] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await getCurrentUser();
                if (userData) {
                    setName(userData.name || "");
                    setEmail(userData.email || "");
                    if (userData.preferences) {
                        setDefaultCategory(userData.preferences.defaultCategory || "Study");
                        setDailyGoal(userData.preferences.dailyGoal || 120);
                    }
                }
            } catch (error) {
                console.error("Failed to load user data:", error);
            }
        };
        loadUser();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const updated = await updateProfile({
                name,
                preferences: { defaultCategory, dailyGoal: Number(dailyGoal) }
            });
            
            if (updated.message) {
                setProfileMsg(`Error: ${updated.message}`);
            } else {
                setProfileMsg("Profile updated successfully!");
                localStorage.setItem("userName", updated.name); // update cached name
                setTimeout(() => setProfileMsg(""), 3000);
            }
        } catch (error) {
            setProfileMsg("An error occurred while updating profile.");
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) {
            setPasswordMsg("Both password fields are required.");
            return;
        }
        try {
            const res = await changePassword({ currentPassword, newPassword });
            if (res.message === "Password updated successfully") {
                setPasswordMsg("Password changed successfully!");
                setCurrentPassword("");
                setNewPassword("");
            } else {
                setPasswordMsg(res.message || "Failed to change password.");
            }
            setTimeout(() => setPasswordMsg(""), 3000);
        } catch (error) {
            setPasswordMsg("An error occurred while changing password.");
        }
    };

    const handleDeleteAccount = async () => {
        const confirm1 = window.confirm("Are you SURE you want to delete your account? This action cannot be undone.");
        if (confirm1) {
            const confirm2 = window.prompt("Type DELETE to confirm your account deletion.");
            if (confirm2 === "DELETE") {
                try {
                    await deleteAccount();
                    localStorage.removeItem("token");
                    localStorage.removeItem("userName");
                    navigate("/login");
                } catch (error) {
                    alert("Failed to delete account.");
                }
            }
        }
    };

    return (
        <div className="container">
            <h1 className="analytics-header">⚙️ Account Settings</h1>
            
            <div className="analytics-container" style={{ maxWidth: "800px", margin: "0 auto 2rem" }}>
                <h3 className="chart-title">👤 Profile & Preferences</h3>
                {profileMsg && <div className={profileMsg.includes("Error") ? "error-message" : "success-message"}>{profileMsg}</div>}
                
                <form onSubmit={handleProfileUpdate} style={{ display: "grid", gap: "1.5rem" }}>
                    <div>
                        <label className="form-label">Email (Read Only)</label>
                        <input type="text" className="form-input" value={email} disabled style={{ background: "var(--hover-bg)", cursor: "not-allowed" }} />
                    </div>
                    <div>
                        <label className="form-label">Display Name</label>
                        <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="form-label">Default Task Category</label>
                        <select className="form-select" value={defaultCategory} onChange={(e) => setDefaultCategory(e.target.value)}>
                            <option>Study</option>
                            <option>Work</option>
                            <option>Personal</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Daily Goal (minutes)</label>
                        <input type="number" className="form-input" value={dailyGoal} onChange={(e) => setDailyGoal(e.target.value)} min="1" required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ justifySelf: "start" }}>Save Profile</button>
                </form>
            </div>

            <div className="analytics-container" style={{ maxWidth: "800px", margin: "0 auto 2rem" }}>
                <h3 className="chart-title">🔐 Change Password</h3>
                {passwordMsg && <div className={passwordMsg.includes("Error") || passwordMsg.includes("Invalid") || passwordMsg.includes("Failed") ? "error-message" : "success-message"}>{passwordMsg}</div>}
                
                <form onSubmit={handlePasswordChange} style={{ display: "grid", gap: "1.5rem" }}>
                    <div>
                        <label className="form-label">Current Password</label>
                        <input type="password" className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label">New Password</label>
                        <input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-success" style={{ justifySelf: "start" }}>Update Password</button>
                </form>
            </div>

            <div className="analytics-container" style={{ maxWidth: "800px", margin: "0 auto", border: "2px solid var(--bg-danger)", background: "var(--bg-danger)" }}>
                <h3 className="chart-title" style={{ color: "var(--text-danger)" }}>⚠️ Danger Zone</h3>
                <p style={{ color: "var(--text-danger)", marginBottom: "1.5rem" }}>
                    Once you delete your account, there is no going back. All your tasks, goals, and analytics will be permanently erased.
                </p>
                <button type="button" className="btn btn-danger" onClick={handleDeleteAccount}>
                    Delete Account
                </button>
            </div>
        </div>
    );
}

export default Settings;
