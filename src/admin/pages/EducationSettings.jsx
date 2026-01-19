import React, { useState, useEffect } from "react";
import "./AdminCommon.css";
import "./EducationSettings.css";

const EducationSettings = () => {
  const [t, setT] = useState({});
  const lang = localStorage.getItem("lang") || "en";
  const [education, setEducation] = useState([]);
  const [currentEducation, setCurrentEducation] = useState({
    degree: "",
    school: "",
    period: "",
    gpa: "",
    description: "",
    achievements: [],
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
    const storedEducation = localStorage.getItem("education");
    if (storedEducation) {
      setEducation(JSON.parse(storedEducation));
    } else {
      fetch("/data.json")
        .then((res) => res.json())
        .then((data) => {
          const defaultEducation = data.education || [];
          setEducation(defaultEducation);
        })
        .catch((error) => console.error("Error loading education:", error));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentEducation((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAchievementChange = (index, value) => {
    const updatedAchievements = [...currentEducation.achievements];
    updatedAchievements[index] = value;
    setCurrentEducation((prev) => ({
      ...prev,
      achievements: updatedAchievements,
    }));
  };

  const addAchievement = () => {
    setCurrentEducation((prev) => ({
      ...prev,
      achievements: [...prev.achievements, ""],
    }));
  };

  const removeAchievement = (index) => {
    setCurrentEducation((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  const saveToLocalStorage = (updatedEducation) => {
    localStorage.setItem("education", JSON.stringify(updatedEducation));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updatedEducation;
    if (editIndex !== null) {
      updatedEducation = [...education];
      updatedEducation[editIndex] = currentEducation;
      setEditIndex(null);
    } else {
      updatedEducation = [...education, currentEducation];
    }
    setEducation(updatedEducation);
    saveToLocalStorage(updatedEducation);
    setCurrentEducation({
      degree: "",
      school: "",
      period: "",
      gpa: "",
      description: "",
      achievements: [],
      isVisible: true,
    });
  };

  const handleEdit = (index) => {
    setCurrentEducation(education[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    if (
      window.confirm(
        t.confirm_delete ||
          "Are you sure you want to delete this education entry?",
      )
    ) {
      const updatedEducation = education.filter((_, i) => i !== index);
      setEducation(updatedEducation);
      saveToLocalStorage(updatedEducation);
    }
  };

  return (
    <div className="admin-page">
      <h2>{t.education_settings || "Education Settings"}</h2>
      <p>{t.education_description || "Manage your educational background"}</p>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-group">
          <label>{t.degree || "Degree"}:</label>
          <input
            type="text"
            name="degree"
            value={currentEducation.degree}
            onChange={handleChange}
            required
          />
        </div>
        <div className="admin-form-group">
          <label>{t.school || "School/University"}:</label>
          <input
            type="text"
            name="school"
            value={currentEducation.school}
            onChange={handleChange}
            required
          />
        </div>
        <div className="admin-form-group">
          <label>{t.period || "Period"}:</label>
          <input
            type="text"
            name="period"
            value={currentEducation.period}
            onChange={handleChange}
            placeholder="e.g., 2015 - 2019"
            required
          />
        </div>
        <div className="admin-form-group">
          <label>{t.gpa || "GPA"}:</label>
          <input
            type="text"
            name="gpa"
            value={currentEducation.gpa}
            onChange={handleChange}
            placeholder="e.g., 3.8/4.0"
          />
        </div>
        <div className="admin-form-group">
          <label>{t.description || "Description"}:</label>
          <textarea
            name="description"
            value={currentEducation.description}
            onChange={handleChange}
          />
        </div>
        <div className="admin-form-group">
          <label>{t.achievements || "Achievements"}:</label>
          {currentEducation.achievements.map((achievement, index) => (
            <div key={index} className="achievement-item">
              <input
                type="text"
                value={achievement}
                onChange={(e) => handleAchievementChange(index, e.target.value)}
                placeholder={t.achievement || "Achievement"}
              />
              <button
                type="button"
                onClick={() => removeAchievement(index)}
                className="admin-btn admin-btn-danger admin-btn-sm"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addAchievement}
            className="admin-btn admin-btn-secondary admin-btn-sm"
          >
            <i className="fas fa-plus"></i>{" "}
            {t.add_achievement || "Add Achievement"}
          </button>
        </div>
        <div className="admin-form-group admin-checkbox-group">
          <label>{t.visible || "Visible"}:</label>
          <input
            type="checkbox"
            name="isVisible"
            checked={currentEducation.isVisible}
            onChange={handleChange}
          />
        </div>
        <div className="admin-buttons">
          <button type="submit" className="admin-btn admin-btn-primary">
            <i
              className={editIndex !== null ? "fas fa-save" : "fas fa-plus"}
            ></i>{" "}
            {editIndex !== null
              ? t.update_education || "Update Education"
              : t.add_education || "Add Education"}
          </button>
          {editIndex !== null && (
            <button
              type="button"
              className="admin-btn admin-btn-cancel"
              onClick={() => {
                setEditIndex(null);
                setCurrentEducation({
                  degree: "",
                  school: "",
                  period: "",
                  gpa: "",
                  description: "",
                  achievements: [],
                  isVisible: true,
                });
              }}
            >
              <i className="fas fa-times"></i> {t.cancel || "Cancel"}
            </button>
          )}
        </div>
      </form>

      <h3>{t.education || "Education"} List</h3>
      <ul className="admin-education-list">
        {education.map((edu, index) => (
          <li key={index}>
            <strong>{edu.degree}</strong> - {edu.school} ({edu.period}) -{" "}
            {edu.isVisible ? "Visible" : "Hidden"}
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

export default EducationSettings;
