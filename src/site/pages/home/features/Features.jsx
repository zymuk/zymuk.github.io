import React from "react";
import { NavLink } from "react-router-dom";
import "./Features.css";

const Features = ({ settings, data }) => {
  const sectionStyle = {
    backgroundColor: settings.color,
    backgroundImage: settings.image ? `url(${settings.image})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const visibleFeatures = data.filter((feature) => feature.isVisible !== false);

  return (
    <section
      id="features"
      className="section features-section"
      style={sectionStyle}
    >
      <h2 className="section-title">Features</h2>
      <div className="features-buttons">
        {visibleFeatures.length > 0 ? (
          visibleFeatures.map((element) => {
            return (
              <NavLink
                to={element.path || "/" + element.id}
                className="features-button"
                key={element.id}
              >
                {element.displayName}
              </NavLink>
            );
          })
        ) : (
          <p>No features available</p>
        )}
      </div>
    </section>
  );
};

export default Features;
