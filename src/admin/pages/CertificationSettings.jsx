import React, { useState, useEffect } from "react";
import "./AdminCommon.css";
import "./CertificationSettings.css";

const CertificationSettings = () => {
  const [t, setT] = useState({});
  const lang = localStorage.getItem("lang") || "en";
  const [certifications, setCertifications] = useState([]);
  const [certification, setCertification] = useState({
    name: "",
    issuer: "",
    issueDate: "",
    credentialUrl: "",
    description: "",
    isVisible: true,
  });
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    fetch(`/${lang}.json`)
      .then((res) => res.json())
      .then((data) => setT(data))
      .catch((error) => console.error("Error loading translations:", error));
  }, [lang]);

  useEffect(() => {
    const storedCertifications = localStorage.getItem("certifications");
    if (storedCertifications) {
      setCertifications(JSON.parse(storedCertifications));
    } else {
      // Load default data from data.json
      fetch("/data.json")
        .then((res) => res.json())
        .then((data) => {
          const defaultCertifications = data.certifications || [];
          setCertifications(defaultCertifications);
        })
        .catch((err) => console.error("Error loading certifications:", err));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCertification((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveToLocalStorage = (updatedCertifications) => {
    localStorage.setItem(
      "certifications",
      JSON.stringify(updatedCertifications)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updatedCertifications;
    if (editIndex !== null) {
      updatedCertifications = [...certifications];
      updatedCertifications[editIndex] = certification;
      setEditIndex(null);
    } else {
      updatedCertifications = [...certifications, certification];
    }
    setCertifications(updatedCertifications);
    saveToLocalStorage(updatedCertifications);
    setCertification({
      name: "",
      issuer: "",
      issueDate: "",
      credentialUrl: "",
      description: "",
      isVisible: true,
    });
  };

  const handleEdit = (index) => {
    setCertification(certifications[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    if (
      window.confirm(
        t.confirm_delete ||
          "Are you sure you want to delete this certification?"
      )
    ) {
      const updatedCertifications = certifications.filter(
        (_, i) => i !== index
      );
      setCertifications(updatedCertifications);
      saveToLocalStorage(updatedCertifications);
    }
  };

  return (
    <div className="admin-page">
      <h2>{t.certifications || "Certifications"}</h2>
      <p>
        {t.certifications_description || "Manage professional certifications"}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-group">
          <label>{t.certification_name || "Certification Name"}:</label>
          <input
            type="text"
            name="name"
            value={certification.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="admin-form-group">
          <label>{t.issuer || "Issuer"}:</label>
          <input
            type="text"
            name="issuer"
            value={certification.issuer}
            onChange={handleChange}
            required
          />
        </div>
        <div className="admin-form-group">
          <label>{t.issue_date || "Issue Date"} (YYYY-MM):</label>
          <input
            type="text"
            name="issueDate"
            value={certification.issueDate}
            onChange={handleChange}
            placeholder="2024-01"
            required
          />
        </div>
        <div className="admin-form-group">
          <label>{t.credential_url || "Credential URL"}:</label>
          <input
            type="url"
            name="credentialUrl"
            value={certification.credentialUrl}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>
        <div className="admin-form-group">
          <label>{t.description || "Description"}:</label>
          <textarea
            name="description"
            value={certification.description}
            onChange={handleChange}
          />
        </div>
        <div className="admin-form-group admin-checkbox-group">
          <label>{t.visible || "Visible"}:</label>
          <input
            type="checkbox"
            name="isVisible"
            checked={certification.isVisible}
            onChange={handleChange}
          />
        </div>
        <div className="admin-buttons">
          <button type="submit" className="admin-btn admin-btn-primary">
            <i
              className={editIndex !== null ? "fas fa-save" : "fas fa-plus"}
            ></i>{" "}
            {editIndex !== null
              ? t.update_certification || "Update Certification"
              : t.add_certification || "Add Certification"}
          </button>
          {editIndex !== null && (
            <button
              type="button"
              className="admin-btn admin-btn-cancel"
              onClick={() => {
                setEditIndex(null);
                setCertification({
                  name: "",
                  issuer: "",
                  issueDate: "",
                  credentialUrl: "",
                  description: "",
                  isVisible: true,
                });
              }}
            >
              <i className="fas fa-times"></i> {t.cancel || "Cancel"}
            </button>
          )}
        </div>
      </form>

      <h3>
        {t.certifications || "Certifications"} {t.project_list ? "List" : ""}
      </h3>
      <ul className="admin-certification-list">
        {certifications.map((cert, index) => (
          <li key={index}>
            <strong>{cert.name}</strong> - {cert.issuer} ({cert.issueDate}) -{" "}
            {cert.isVisible ? "Visible" : "Hidden"}
            <div className="admin-actions">
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CertificationSettings;
