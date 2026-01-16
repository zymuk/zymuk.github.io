import React from "react";
import "./Skills.css";

const Skills = ({ settings = {}, data = [] }) => {
  const sectionStyle = {
    backgroundColor: settings.color || "#007099",
    backgroundImage: settings.image ? `url(${settings.image})` : undefined,
    backgroundSize: settings.image ? "cover" : undefined,
    backgroundPosition: settings.image ? "center" : undefined,
  };

  const visibleCategories = data.filter(
    (category) => category.isVisible !== false
  );

  if (visibleCategories.length === 0) return null;

  return (
    <section
      id="skills"
      className="section skills-section"
      style={sectionStyle}
    >
      <h2 className="section-title">Skills & Technologies</h2>
      <div className="skills-container">
        {visibleCategories.map((category, catIndex) => (
          <div key={catIndex} className="skill-category">
            <h3 className="category-title">{category.category}</h3>
            <div className="skills-grid">
              {category.items
                ?.filter((item) => item.isVisible !== false)
                .map((skill, skillIndex) => (
                  <div key={skillIndex} className="skill-item">
                    <div className="skill-header">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-percentage">
                        {skill.years} {skill.years === 1 ? "year" : "years"}
                      </span>
                    </div>
                    <div className="skill-bar">
                      <div
                        className="skill-progress"
                        style={{ width: `${Math.min(skill.years * 15, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
