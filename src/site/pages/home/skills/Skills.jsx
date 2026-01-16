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
            <ul className="skills-list">
              {category.items
                ?.filter((item) => item.isVisible !== false)
                .map((skill, skillIndex) => (
                  <li key={skillIndex}>
                    <strong>{skill.name}</strong> - {skill.years}{" "}
                    {skill.years === 1 ? "year" : "years"}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
