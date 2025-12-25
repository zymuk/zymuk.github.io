import React, { useState, useEffect } from "react";
import "./ProjectsSettings.css";

const ProjectsSettings = () => {
  const [t, setT] = useState({});
  const lang = localStorage.getItem("lang") || "en";
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState({
    name: "",
    description: "",
    demoLink: "",
    sourceLink: "",
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
    const storedProjects = JSON.parse(localStorage.getItem("projects"));
    if (storedProjects) {
      setProjects(storedProjects);
    } else {
      // Load default data from data.json if no localStorage data
      fetch("/data.json")
        .then((res) => res.json())
        .then((data) => {
          // Convert from public format to admin format
          const adminFormat = data.projects.map((project) => ({
            name: project.name,
            description: project.description || "",
            demoLink: project.demo || "",
            sourceLink: project.github || "",
            isVisible: true,
          }));
          setProjects(adminFormat);
        })
        .catch((err) => console.error("Error loading default projects:", err));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProject((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveToLocalStorage = (updatedProjects) => {
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updatedProjects;
    if (editIndex !== null) {
      updatedProjects = [...projects];
      updatedProjects[editIndex] = project;
      setEditIndex(null);
    } else {
      updatedProjects = [...projects, project];
    }
    setProjects(updatedProjects);
    saveToLocalStorage(updatedProjects);
    setProject({
      name: "",
      description: "",
      demoLink: "",
      sourceLink: "",
      isVisible: true,
    });
  };

  const handleEdit = (index) => {
    setProject(projects[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    setProjects(updatedProjects);
    saveToLocalStorage(updatedProjects);
  };

  return (
    <div className="admin-projects">
      <h2>{t.manage_projects || "Manage Projects"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t.project_name || "Project Name"}:</label>
          <input
            type="text"
            name="name"
            value={project.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{t.description || "Description"}:</label>
          <textarea
            name="description"
            value={project.description}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>{t.demo_link || "Demo Link"}:</label>
          <input
            type="url"
            name="demoLink"
            value={project.demoLink}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{t.source_code_link || "Source Code Link"}:</label>
          <input
            type="url"
            name="sourceLink"
            value={project.sourceLink}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group checkbox-group">
          <label>{t.visible || "Visible"}:</label>
          <input
            type="checkbox"
            name="isVisible"
            checked={project.isVisible}
            onChange={handleChange}
          />
        </div>
        <div className="buttons">
          <button type="submit" className="add-project-btn">
            <i
              className={editIndex !== null ? "fas fa-save" : "fas fa-plus"}
            ></i>{" "}
            {editIndex !== null
              ? t.update_project || "Update Project"
              : t.add_project || "Add Project"}
          </button>
          {editIndex !== null && (
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setEditIndex(null)}
            >
              <i className="fas fa-times"></i> {t.cancel || "Cancel"}
            </button>
          )}
        </div>
      </form>

      <h3>{t.project_list || "Project List"}</h3>
      <ul className="project-list">
        {projects.map((proj, index) => (
          <li key={index}>
            <strong>{proj.name}</strong> -{" "}
            {proj.isVisible ? "Visible" : "Hidden"}
            <div className="actions">
              <button onClick={() => handleEdit(index)}>
                <i className="fas fa-edit"></i> {t.edit || "Edit"}
              </button>
              <button onClick={() => handleDelete(index)}>
                <i className="fas fa-trash"></i> {t.delete || "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectsSettings;
