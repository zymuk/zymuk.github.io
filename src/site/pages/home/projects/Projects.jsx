import React from "react";
import "./Projects.css";

const Projects = () => {
  const listProject = [
    {
      name: "PHP application",
      demo: "http://ttngoc653.byethost4.com/",
      github:
        "https://github.com/zymuk/WebsiteSellLaptopPHP/tree/master/Source",
    },
    {
      name: "Portfolio Personal page",
      demo: "",
      github: "https://github.com/zymuk/zymuk.github.io",
    },
    {
      name: "Personal page",
      demo: "http://zymuk.lovestoblog.com",
      github: "https://github.com/zymuk",
    },
  ];

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
