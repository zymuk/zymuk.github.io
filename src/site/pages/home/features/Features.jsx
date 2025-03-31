import React from "react";
import { NavLink } from "react-router-dom";
import "./Features.css";

const Features = () => {
  const listFeatures = JSON.parse(localStorage.getItem("featuresSettings")) || [];
  const listActiveFeatures = listFeatures.filter(feature => feature.isVisible);

  return (
    <section id="features" className="section features-section">
      <h2 className="section-title">Features</h2>
      <div className="features-buttons">
        {listActiveFeatures.length > 0 ? (listActiveFeatures.map((element) => {
          return (
            <NavLink to={"/" + element.id} className="features-button" key={element.id}>
              {element.displayName}
            </NavLink>
          );
        })) : (
          <p>No features available</p>
        )}
      </div>
    </section>
  );
};

export default Features;
