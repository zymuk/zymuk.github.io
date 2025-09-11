import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import packageJson from "../../../../../package.json";
import "./Features.css";

const Features = () => {
  const apiPage =
    packageJson.apipage !== undefined && packageJson.apipage.length > 0
      ? packageJson.apipage
      : "http://localhost/zymuk_page_api/";
  const [listActivedFeatures, setListActivedFeatures] = useState([
    {
      id: "calculator",
      displayName: "Calculator",
      description: "",
      isVisible: true,
    },
    { id: "notes", displayName: "Notes", description: "", isVisible: true },
    {
      id: "save_web",
      displayName: "Save Web Page",
      description: "",
      isVisible: false,
    },
    {
      id: "numerology-name",
      displayName: "Auto generate numerology name",
      description: "",
      isVisible: true,
    },
    {
      id: "text_encoder_decoder",
      displayName: "Encode/Decode Text",
      description: "",
      isVisible: false,
    },
  ]);

  useEffect(() => {
    axios
      .get(apiPage + "/api/load_features.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setListActivedFeatures(data.data);
        } else {
          // NOTE: alert để thông báo lỗi, cân nhắc thay thế UI thông báo phù hợp
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
                to={"/" + element.id}
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
