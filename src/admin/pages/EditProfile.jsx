import React, { useState } from "react";
import "./EditProfile.css";

const EditProfile = () => {
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

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // NOTE: Using alert for profile update success. Consider replacing with a proper UI notification in production.
    alert("Profile updated successfully!");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      // NOTE: Using alert for password mismatch error. Consider replacing with a proper UI notification in production.
      alert("New passwords do not match!");
      return;
    }
    // NOTE: Using alert for password change success. Consider replacing with a proper UI notification in production.
    alert("Password changed successfully!");
  };

  return (
    <div className="edit-profile">
      <h2>Edit Profile</h2>

      {/* Card 1: Update Profile */}
      <div className="card">
        <h3>Update Profile</h3>
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input type="text" value={profile.username} disabled />
          </div>
          <div className="form-group">
            <label>Display Name:</label>
            <input
              type="text"
              name="displayName"
              value={profile.displayName}
              onChange={handleProfileChange}
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
            />
          </div>
          <div className="form-group">
            <label>Account Created:</label>
            <input type="text" value={profile.createdAt} disabled />
          </div>
          <div className="button-group">
            <button type="submit">Save Changes</button>
          </div>
        </form>
      </div>

      {/* Card 2: Change Password */}
      <div className="card">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label>Current Password:</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="button-group">
            <button type="submit">Change Password</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
