import React from "react";
import "./Experience.css";

const Experience = ({ settings, data }) => {
  const sectionStyle = {
    backgroundColor: settings.color,
    backgroundImage: settings.image ? `url(${settings.image})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const visibleExperiences = data.filter((exp) => exp.isVisible !== false);

  return (
    <section
      id="experience"
      className="section experience-section"
      style={sectionStyle}
    >
      <h2 className="section-title">Experience</h2>
      <div className="experience-timeline">
        {visibleExperiences.map((exp, index) => (
          <div key={index} className="experience-item">
            <div className="experience-header">
              <h3 className="role">{exp.role}</h3>
              <h4 className="company">{exp.company}</h4>
              <span className="period">{exp.period}</span>
            </div>
            <div className="experience-content">
              {exp.description && (
                <p className="main-work">{exp.description}</p>
              )}
              {exp.projects && exp.projects.length > 0 && (
                <div className="projects">
                  <h5>Key Projects:</h5>
                  {exp.projects.map((project, projIndex) => (
                    <div key={projIndex} className="project-item">
                      <h6 className="project-name">{project.name}</h6>
                      <p className="project-description">
                        {project.description}
                      </p>
                      {project.technologies && (
                        <div className="technologies">
                          <strong>Technologies:</strong>
                          <div className="tech-tags">
                            {project.technologies.map((tech, techIndex) => (
                              <span key={techIndex} className="tech-tag">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {project.responsibilities && (
                        <div className="responsibilities">
                          <strong>Responsibilities:</strong>
                          <ul>
                            {project.responsibilities.map((resp, respIndex) => (
                              <li key={respIndex}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Experience;
