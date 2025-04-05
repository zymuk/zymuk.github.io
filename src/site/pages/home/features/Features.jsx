import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import packageJson from "../../../../../package.json";
import "./Features.css";

const Features = () => {
  const apiPage =
    packageJson.apipage !== undefined && packageJson.apipage.length > 0
      ? packageJson.apipage
      : "http://localhost/zymuk_page_api/";
  const [listActivedFeatures, setListActivedFeatures] = useState([]);

  useEffect(() => {
    fetch(apiPage + "/api/load_features.php", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setListActivedFeatures(data.data);
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error("Error loading features:", error);
      });
  }, [apiPage]);

  return (
    <section id="features" className="section features-section">
      <h2 className="section-title">Features</h2>
      <div className="features-buttons">
        {listActivedFeatures.length > 0 ? (
          listActivedFeatures.map((element) => {
            return (
              <NavLink
                to={"/" + element.key}
                className="features-button"
                key={element.key}
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
