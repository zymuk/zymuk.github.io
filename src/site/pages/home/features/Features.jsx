import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Features.css";

const Features = ({ settings = {}, data = [] }) => {
  const [features, setFeatures] = useState(data);
  const [loading, setLoading] = useState(!(data && data.length > 0));

  useEffect(() => {
    let active = true;

    if (data && data.length > 0) {
      setFeatures(data);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    fetch("/data.json")
      .then((dataResponse) => dataResponse.json())
      .then((jsonData) => {
        if (!active) return;
        setFeatures(jsonData.features || []);
      })
      .catch((error) => console.error("Error loading features:", error))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [data]);

  const sectionStyle = {
    backgroundColor: settings.color,
    backgroundImage: settings.image
      ? `url(${settings.image})`
      : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const visibleFeatures = features.filter(
    (feature) => feature.isVisible !== false
  );

  if (loading) {
    return (
      <section
        id="features"
        className="section features-section"
        style={sectionStyle}
      >
        <div>Loading...</div>
      </section>
    );
  }

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
                to={element.path || "/features/" + element.id}
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
