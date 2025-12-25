import React, { useState, useEffect } from "react";
import "./FeaturesSettings.css";

const FeaturesSettings = () => {
  const [t, setT] = useState({});
  const lang = localStorage.getItem("lang") || "en";
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    fetch(`/${lang}.json`)
      .then((res) => res.json())
      .then((data) => setT(data))
      .catch((error) => console.error("Error loading translations:", error));
  }, [lang]);

  useEffect(() => {
    // Load features from localStorage if available
    const savedFeatures = localStorage.getItem("features");
    if (savedFeatures) {
      setFeatures(JSON.parse(savedFeatures));
    } else {
      // Load default data from data.json
      fetch("/data.json")
        .then((res) => res.json())
        .then((data) => setFeatures(data.features))
        .catch((err) => console.error("Error loading default features:", err));
    }
  }, []);

  const handleChange = (index, field, value) => {
    const updatedFeatures = [...features];
    updatedFeatures[index][field] = value;
    setFeatures(updatedFeatures);
  };

  const handleSave = () => {
    // Save features to localStorage
    localStorage.setItem("features", JSON.stringify(features));
    alert(t.features_saved || "Features settings have been saved!");
  };

  return (
    <div className="admin-features">
      <h2>{t.features_settings || "Features Settings"}</h2>
      <table className="features-table">
        <thead>
          <tr>
            <th>{t.feature_id || "Feature ID"}</th>
            <th>{t.display_name || "Display Name"}</th>
            <th>{t.description || "Description"}</th>
            <th>{t.path || "Path"}</th>
            <th>{t.visible || "Visible"}</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={feature.id}>
              <td>{feature.id}</td>
              <td>
                <input
                  type="text"
                  value={feature.displayName}
                  onChange={(e) =>
                    handleChange(index, "displayName", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  value={feature.description}
                  onChange={(e) =>
                    handleChange(index, "description", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  value={feature.path}
                  onChange={(e) => handleChange(index, "path", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={feature.isVisible}
                  onChange={(e) =>
                    handleChange(index, "isVisible", e.target.checked)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="features-save-btn">
        <button onClick={handleSave}>
          <i className="fas fa-save"></i> {t.save_changes || "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default FeaturesSettings;
