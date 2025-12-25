import React, { useState, useEffect } from "react";
import "./Projects.css";

const Projects = () => {
  const [listProject, setListProject] = useState([]);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => setListProject(data.projects))
      .catch((err) => console.error("Error loading projects:", err));
  }, []);

  return (
    <section id="projects" className="section projects-section">
      <h2 className="section-title">Projects</h2>
      <ul className="project-list">
        {listProject.map((item) => {
          return (
            <li key={item.name}>
              <strong>{item.name}</strong> - <a href={item.demo}>Demo</a> |{" "}
              <a href={item.github}>GitHub</a>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default Projects;
