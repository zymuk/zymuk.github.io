import React, { useState, useEffect } from "react";
import "./EditProfile.css";

const EditProfile = () => {
  const [t, setT] = useState({});
  const lang = localStorage.getItem("lang") || "en";
  const [profile, setProfile] = useState({
    username: "admin",
    email: "admin@example.com",
    displayName: "Admin User",
    createdAt: "2024-01-01 10:00 AM",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetch(`/${lang}.json`)
      .then((res) => res.json())
      .then((data) => setT(data))
      .catch((error) => console.error("Error loading translations:", error));
  }, [lang]);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // NOTE: Using alert for profile update success. Consider replacing with a proper UI notification in production.
    alert(t.profile_updated_success || "Profile updated successfully!");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      // NOTE: Using alert for password mismatch error. Consider replacing with a proper UI notification in production.
      alert(t.password_mismatch_error || "New passwords do not match!");
      return;
    }
    // NOTE: Using alert for password change success. Consider replacing with a proper UI notification in production.
    alert(t.password_changed_success || "Password changed successfully!");
  };

  return (
    <div className="edit-profile">
      <h2>{t.edit_profile_title || "Edit Profile"}</h2>

      {/* Card 1: Update Profile */}
      <div className="card">
        <h3>{t.update_profile || "Update Profile"}</h3>
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label>{t.username || "Username"}:</label>
            <input type="text" value={profile.username} disabled />
          </div>
          <div className="form-group">
            <label>{t.display_name || "Display Name"}:</label>
            <input
              type="text"
              name="displayName"
              value={profile.displayName}
              onChange={handleProfileChange}
            />
          </div>
          <div className="form-group">
            <label>{t.email || "Email"}:</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
            />
          </div>
          <div className="form-group">
            <label>{t.account_created || "Account Created"}:</label>
            <input type="text" value={profile.createdAt} disabled />
          </div>
          <div className="button-group">
            <button type="submit">{t.save_changes || "Save Changes"}</button>
          </div>
        </form>
      </div>

      {/* Card 2: Change Password */}
      <div className="card">
        <h3>{t.change_password || "Change Password"}</h3>
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label>{t.current_password || "Current Password"}:</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="form-group">
            <label>{t.new_password || "New Password"}:</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="form-group">
            <label>{t.confirm_password || "Confirm Password"}:</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="button-group">
            <button type="submit">
              {t.change_password || "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
