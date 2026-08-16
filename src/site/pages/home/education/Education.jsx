import React from "react";
import "./Education.css";

const Education = ({ data = [], settings = {} }) => {
  const visibleEducation = data.filter((edu) => edu.isVisible !== false);

  if (visibleEducation.length === 0) return null;

  const sectionStyle = {
    backgroundColor: settings.color,
    backgroundImage: settings.image ? `url(${settings.image})` : undefined,
    backgroundSize: settings.image ? "cover" : undefined,
    backgroundPosition: settings.image ? "center" : undefined,
  };

  return (
    <section
      id="education"
      className="section education-section"
      style={sectionStyle}
    >
      <h2 className="section-title">Education</h2>
      <ul className="education-list">
        {visibleEducation.map((edu, index) => (
          <li key={index}>
            <div className="education-degree">{edu.degree}</div>
            <div className="education-school">
              {edu.school} ({edu.period})
            </div>
            {edu.gpa && <div className="education-gpa">GPA: {edu.gpa}</div>}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Education;
