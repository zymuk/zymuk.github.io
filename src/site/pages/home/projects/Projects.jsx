import React from "react";
import "./Projects.css";

const Projects = ({ settings, data }) => {
  const sectionStyle = {
    backgroundColor: settings.color,
    backgroundImage: settings.image ? `url(${settings.image})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const visibleProjects = data.filter((project) => project.isVisible !== false);

  return (
    <section
      id="projects"
      className="section projects-section"
      style={sectionStyle}
    >
      <h2 className="section-title">Projects</h2>
      <ul className="project-list">
        {visibleProjects.map((item) => {
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
