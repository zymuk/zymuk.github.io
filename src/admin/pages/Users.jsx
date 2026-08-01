import React, { useState, useEffect } from "react";
import "./AdminCommon.css";
import "./Users.css";

const Users = () => {
  const [t, setT] = useState({});
  const lang = localStorage.getItem("lang") || "en";
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({
    email: "",
    password: "",
    role: "user",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetch(`/${lang}.json`)
      .then((res) => res.json())
      .then((data) => setT(data))
      .catch((error) => console.error("Error loading translations:", error));
  }, [lang]);

  useEffect(() => {
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      fetch("/data.json")
        .then((res) => res.json())
        .then((data) => setUsers(data.users || []))
        .catch((err) => console.error("Error loading users:", err));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const saveToLocalStorage = (updatedUsers) => {
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user.email.trim() || !user.password.trim()) {
      setMessage({
        type: "error",
        text: t.fill_required_fields || "Please fill all required fields!",
      });
      return;
    }

    const emailExists = users.some(
      (u, i) => u.email.toLowerCase() === user.email.toLowerCase() && i !== editIndex
    );
    if (emailExists) {
      setMessage({
        type: "error",
        text: t.email_exists_error || "This email is already in use!",
      });
      return;
    }

    let updatedUsers;
    if (editIndex !== null) {
      updatedUsers = [...users];
      updatedUsers[editIndex] = { ...user };
      setEditIndex(null);
      setMessage({
        type: "success",
        text: t.user_updated_success || "User updated successfully!",
      });
    } else {
      updatedUsers = [...users, { ...user }];
      setMessage({
        type: "success",
        text: t.user_added_success || "User added successfully!",
      });
    }
    setUsers(updatedUsers);
    saveToLocalStorage(updatedUsers);
    setUser({ email: "", password: "", role: "user" });
  };

  const handleEdit = (index) => {
    setUser({ ...users[index] });
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    if (window.confirm(t.confirm_delete_user || "Are you sure you want to delete this user?")) {
      const updatedUsers = users.filter((_, i) => i !== index);
      setUsers(updatedUsers);
      saveToLocalStorage(updatedUsers);
      setMessage({
        type: "success",
        text: t.user_deleted_success || "User deleted successfully!",
      });
    }
  };

  return (
    <div className="admin-page">
      <h2>{t.users_management || "Users Management"}</h2>
      <p>{t.users_description || "User list and management."}</p>

      {message && (
        <div
          className={
            message.type === "error"
              ? "admin-error-message"
              : "admin-success-message"
          }
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-section">
        <h3>{editIndex !== null ? t.edit_user || "Edit User" : t.add_user || "Add User"}</h3>
        <div className="admin-form-group">
          <label>{t.email || "Email"}:</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            placeholder={t.enter_email || "Enter email"}
            required
          />
        </div>
        <div className="admin-form-group">
          <label>{t.password || "Password"}:</label>
          <div className="password-input-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={user.password}
              onChange={handleChange}
              placeholder={t.enter_password || "Enter password"}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? t.hide_password || "Hide password" : t.show_password || "Show password"}
            >
              <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
            </button>
          </div>
        </div>
        <div className="admin-form-group">
          <label>{t.role || "Role"}:</label>
          <select name="role" value={user.role} onChange={handleChange}>
            <option value="admin">{t.role_admin || "Admin"}</option>
            <option value="user">{t.role_user || "User"}</option>
          </select>
        </div>
        <div className="admin-button-group">
          <button type="submit" className="admin-btn admin-btn-primary">
            <i className={editIndex !== null ? "fas fa-save" : "fas fa-plus"}></i>{" "}
            {editIndex !== null
              ? t.update_user || "Update User"
              : t.add_user || "Add User"}
          </button>
          {editIndex !== null && (
            <button
              type="button"
              className="admin-btn admin-btn-cancel"
              onClick={() => {
                setEditIndex(null);
                setUser({ email: "", password: "", role: "user" });
              }}
            >
              <i className="fas fa-times"></i> {t.cancel || "Cancel"}
            </button>
          )}
        </div>
      </form>

      <div className="admin-section">
        <h3>{t.user_list || "User List"}</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t.email || "Email"}</th>
              <th>{t.role || "Role"}</th>
              <th>{t.actions || "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="3">{t.no_users || "No users found"}</td>
              </tr>
            ) : (
              users.map((u, index) => (
                <tr key={index}>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className={
                        u.role === "admin"
                          ? "role-badge role-admin"
                          : "role-badge role-user"
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <div className="admin-action-buttons">
                      <button
                        onClick={() => handleEdit(index)}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                      >
                        <i className="fas fa-edit"></i> {t.edit || "Edit"}
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="admin-btn admin-btn-danger admin-btn-sm"
                      >
                        <i className="fas fa-trash"></i> {t.delete || "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
