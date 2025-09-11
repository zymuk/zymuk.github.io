import React, { useState, useEffect } from "react";
import packageJson from "../../../package.json";
import "./FeaturesSettings.css";

const FeaturesSettings = () => {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    // Load features from localStorage if available
    const savedFeatures = localStorage.getItem("featuresSettings");
    if (savedFeatures) {
      setFeatures(JSON.parse(savedFeatures));
    } else {
      setFeatures([]);
    }
  }, []);

  const handleChange = (index, field, value) => {
    const updatedFeatures = [...features];
    updatedFeatures[index][field] = value;
    setFeatures(updatedFeatures);
  };

  const handleSave = () => {
    // Save features to localStorage
    localStorage.setItem("featuresSettings", JSON.stringify(features));
    alert("Features settings have been saved!");
  };

  return (
    <div className="admin-features">
      <h2>Features Settings</h2>
      <table className="features-table">
        <thead>
          <tr>
            <th>Feature ID</th>
            <th>Display Name</th>
            <th>Description</th>
            <th>Visible</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={feature.key}>
              <td>{feature.key}</td>
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
          <i className="fas fa-save"></i> Save Changes
        </button>
      </div>
    </div>
  );
};

export default FeaturesSettings;
