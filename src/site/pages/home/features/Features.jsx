import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Features.css";

const Features = () => {
  const [listActivedFeatures, setListActivedFeatures] = useState([]);

  useEffect(() => {
    // First try to load from localStorage (admin overrides)
    const savedFeatures = localStorage.getItem("features");
    if (savedFeatures) {
      setListActivedFeatures(JSON.parse(savedFeatures));
    } else {
      // Fallback to data.json
      fetch("/data.json")
        .then((res) => res.json())
        .then((data) => setListActivedFeatures(data.features))
        .catch((err) => console.error("Error loading features:", err));
    }
  }, []);

  return (
    <section id="features" className="section features-section">
      <h2 className="section-title">Features</h2>
      <div className="features-buttons">
        {listActivedFeatures.length > 0 ? (
          listActivedFeatures
            .filter((feature) => feature.isVisible)
            .map((element) => {
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
