import React, { useState, useEffect } from "react";
import "./AdminCommon.css";
import "./ExperienceSettings.css";

const ExperienceSettings = () => {
  const [data, setData] = useState({ experience: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Check localStorage first
      const savedData = localStorage.getItem("experienceData");
      if (savedData) {
        setData({ experience: JSON.parse(savedData) });
        setLoading(false);
        return;
      }

      // If no saved data, load from data.json
      const dataResponse = await fetch("/data.json");
      const experienceData = await dataResponse.json();

      setData(experienceData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading experience settings:", error);
      setLoading(false);
    }
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...data.experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value,
    };
    setData((prev) => ({
      ...prev,
      experience: updatedExperience,
    }));
  };

  const handleProjectChange = (expIndex, projIndex, field, value) => {
    const updatedExperience = [...data.experience];
    const updatedProjects = [...updatedExperience[expIndex].projects];
    updatedProjects[projIndex] = {
      ...updatedProjects[projIndex],
      [field]: value,
    };
    updatedExperience[expIndex] = {
      ...updatedExperience[expIndex],
      projects: updatedProjects,
    };
    setData((prev) => ({
      ...prev,
      experience: updatedExperience,
    }));
  };

  const handleResponsibilityChange = (
    expIndex,
    projIndex,
    respIndex,
    value
  ) => {
    const updatedExperience = [...data.experience];
    const updatedResponsibilities = [
      ...updatedExperience[expIndex].projects[projIndex].responsibilities,
    ];
    updatedResponsibilities[respIndex] = value;
    updatedExperience[expIndex].projects[projIndex] = {
      ...updatedExperience[expIndex].projects[projIndex],
      responsibilities: updatedResponsibilities,
    };
    setData((prev) => ({
      ...prev,
      experience: updatedExperience,
    }));
  };

  const addResponsibility = (expIndex, projIndex) => {
    const updatedExperience = [...data.experience];
    updatedExperience[expIndex].projects[projIndex].responsibilities.push("");
    setData((prev) => ({
      ...prev,
      experience: updatedExperience,
    }));
  };

  const removeResponsibility = (expIndex, projIndex, respIndex) => {
    const updatedExperience = [...data.experience];
    updatedExperience[expIndex].projects[projIndex].responsibilities.splice(
      respIndex,
      1
    );
    setData((prev) => ({
      ...prev,
      experience: updatedExperience,
    }));
  };

  const toggleVisibility = (index) => {
    handleExperienceChange(
      index,
      "isVisible",
      !data.experience[index].isVisible
    );
  };

  const addExperience = () => {
    const newExperience = {
      role: "",
      company: "",
      period: "",
      description: "",
      projects: [],
      isVisible: true,
    };
    setData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExperience],
    }));
  };

  const removeExperience = (index) => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      const updatedExperience = [...data.experience];
      updatedExperience.splice(index, 1);
      setData((prev) => ({
        ...prev,
        experience: updatedExperience,
      }));
    }
  };

  const addProject = (expIndex) => {
    const newProject = {
      name: "",
      description: "",
      technologies: [],
      responsibilities: [],
    };
    const updatedExperience = [...data.experience];
    updatedExperience[expIndex].projects = [
      ...updatedExperience[expIndex].projects,
      newProject,
    ];
    setData((prev) => ({
      ...prev,
      experience: updatedExperience,
    }));
  };

  const removeProject = (expIndex, projIndex) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const updatedExperience = [...data.experience];
      updatedExperience[expIndex].projects.splice(projIndex, 1);
      setData((prev) => ({
        ...prev,
        experience: updatedExperience,
      }));
    }
  };

  const saveSettings = () => {
    localStorage.setItem("experienceData", JSON.stringify(data.experience));
    alert("Experience settings saved successfully!");
  };

  const resetSettings = () => {
    localStorage.removeItem("experienceData");
    loadSettings();
    alert("Experience settings reset successfully!");
  };

  if (loading) {
    return <div className="admin-page">Loading...</div>;
  }

  return (
    <div className="admin-page">
      <h2>Experience Settings</h2>
      <div className="admin-buttons">
        <button onClick={saveSettings} className="admin-btn admin-btn-primary">
          <i className="fas fa-save"></i> Save Changes
        </button>
        <button onClick={resetSettings} className="admin-btn admin-btn-cancel">
          <i className="fas fa-undo"></i> Reset to Default
        </button>
        <button onClick={addExperience} className="admin-btn admin-btn-primary">
          <i className="fas fa-plus"></i> Add Experience
        </button>
      </div>

      {data.experience.map((exp, expIndex) => (
        <div key={expIndex} className="admin-experience-item">
          <div className="admin-item-header">
            <h3>Experience #{expIndex + 1}</h3>
            <div className="admin-item-actions">
              <label className="admin-visibility-toggle">
                <input
                  type="checkbox"
                  checked={exp.isVisible}
                  onChange={() => toggleVisibility(expIndex)}
                />
                Visible
              </label>
              <button
                onClick={() => removeExperience(expIndex)}
                className="admin-btn admin-btn-danger"
                title="Remove Experience"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Role:</label>
              <input
                type="text"
                value={exp.role || ""}
                onChange={(e) =>
                  handleExperienceChange(expIndex, "role", e.target.value)
                }
              />
            </div>
            <div className="admin-form-group">
              <label>Company:</label>
              <input
                type="text"
                value={exp.company || ""}
                onChange={(e) =>
                  handleExperienceChange(expIndex, "company", e.target.value)
                }
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Period:</label>
            <input
              type="text"
              value={exp.period || ""}
              onChange={(e) =>
                handleExperienceChange(expIndex, "period", e.target.value)
              }
              placeholder="Jan 2020 - Dec 2022"
            />
          </div>

          <div className="admin-form-group">
            <label>Description:</label>
            <textarea
              value={exp.description || ""}
              onChange={(e) =>
                handleExperienceChange(expIndex, "description", e.target.value)
              }
              rows="3"
            />
          </div>

          {/* Projects */}
          <div className="admin-projects-section">
            <div className="admin-section-header">
              <h4>Projects</h4>
              <button
                onClick={() => addProject(expIndex)}
                className="admin-btn admin-btn-secondary"
              >
                <i className="fas fa-plus"></i> Add Project
              </button>
            </div>

            {exp.projects?.map((project, projIndex) => (
              <div key={projIndex} className="admin-project-item">
                <div className="admin-item-header">
                  <h5>Project #{projIndex + 1}</h5>
                  <button
                    onClick={() => removeProject(expIndex, projIndex)}
                    className="admin-btn admin-btn-danger admin-btn-sm"
                    title="Remove Project"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>

                <div className="admin-form-group">
                  <label>Project Name:</label>
                  <input
                    type="text"
                    value={project.name || ""}
                    onChange={(e) =>
                      handleProjectChange(
                        expIndex,
                        projIndex,
                        "name",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label>Project Description:</label>
                  <textarea
                    value={project.description || ""}
                    onChange={(e) =>
                      handleProjectChange(
                        expIndex,
                        projIndex,
                        "description",
                        e.target.value
                      )
                    }
                    rows="3"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Technologies (comma-separated):</label>
                  <input
                    type="text"
                    value={project.technologies?.join(", ") || ""}
                    onChange={(e) =>
                      handleProjectChange(
                        expIndex,
                        projIndex,
                        "technologies",
                        e.target.value.split(", ")
                      )
                    }
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>

                {/* Responsibilities */}
                <div className="admin-responsibilities-section">
                  <div className="admin-responsibilities-header">
                    <label>Responsibilities:</label>
                    <button
                      type="button"
                      onClick={() => addResponsibility(expIndex, projIndex)}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                    >
                      Add Responsibility
                    </button>
                  </div>

                  {project.responsibilities?.map(
                    (responsibility, respIndex) => (
                      <div
                        key={respIndex}
                        className="admin-responsibility-item"
                      >
                        <input
                          type="text"
                          value={responsibility}
                          onChange={(e) =>
                            handleResponsibilityChange(
                              expIndex,
                              projIndex,
                              respIndex,
                              e.target.value
                            )
                          }
                          placeholder="Responsibility description"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeResponsibility(expIndex, projIndex, respIndex)
                          }
                          className="admin-btn admin-btn-danger admin-btn-sm"
                        >
                          ×
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExperienceSettings;
