import React from "react";
import "./Projects.css";

const Projects = () => {
  return (
    <section id="projects" className="section projects-section">
      <h2 className="section-title">Projects</h2>
      <ul className="project-list">
        <li>
          <strong>Project 1</strong> - <a href="project1">Demo</a> |{" "}
          <a href="project1">GitHub</a>
        </li>
        <li>
          <strong>Project 2</strong> - <a href="project2">Demo</a> |{" "}
          <a href="project2">GitHub</a>
        </li>
      </ul>
    </section>
  );
};

export default Projects;
