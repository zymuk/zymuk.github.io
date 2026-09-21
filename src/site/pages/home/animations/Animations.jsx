import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Animations.css";

const Animations = ({ settings = {}, data = [] }) => {
  const [animations, setAnimations] = useState(data);
  const [loading, setLoading] = useState(!(data && data.length > 0));

  useEffect(() => {
    let active = true;

    if (data && data.length > 0) {
      setAnimations(data);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    fetch("/data.json")
      .then((dataResponse) => dataResponse.json())
      .then((jsonData) => {
        if (!active) return;
        setAnimations(jsonData.animations || []);
      })
      .catch((error) => console.error("Error loading animations:", error))
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

  const visibleAnimations = animations.filter(
    (animation) => animation.isVisible !== false
  );

  if (loading) {
    return (
      <section
        id="animations"
        className="section animations-section"
        style={sectionStyle}
      >
        <div>Loading...</div>
      </section>
    );
  }

  return (
    <section
      id="animations"
      className="section animations-section"
      style={sectionStyle}
    >
      <h2 className="section-title">Animations</h2>
      <div className="animations-buttons">
        {visibleAnimations.length > 0 ? (
          visibleAnimations.map((element) => {
            return (
              <NavLink
                to={element.path || "/animations/" + element.id}
                className="animations-button"
                key={element.id}
              >
                {element.displayName}
              </NavLink>
            );
          })
        ) : (
          <p>No animations available</p>
        )}
      </div>
    </section>
  );
};

export default Animations;