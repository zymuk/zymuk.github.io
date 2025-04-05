import React, { useState, useEffect } from "react";
import packageJson from "../../../package.json";
import "./FeaturesSettings.css";

const FeaturesSettings = () => {
  const [features, setFeatures] = useState([]);
  const apiPage =
    packageJson.apipage !== undefined && packageJson.apipage.length > 0
      ? packageJson.apipage
      : "http://localhost/zymuk_page_api/";
  const yourJWTToken = localStorage.getItem("admin_token");

  useEffect(() => {
    fetch(apiPage + "/api/load_features.php", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${yourJWTToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const updatedFeatures = data.data.map((feature) => ({
            ...feature,
            isVisible: feature.isVisible === 1,
          }));
          setFeatures(updatedFeatures);
          console.log(updatedFeatures);
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error("Error loading features:", error);
      });
  }, [apiPage, yourJWTToken]);

  const handleChange = (index, field, value) => {
    const updatedFeatures = [...features];
    updatedFeatures[index][field] = value;
    setFeatures(updatedFeatures);
  };

  const handleSave = () => {
    const updatedFeatures = features.map((feature) => ({
      key: feature.key,
      name: feature.displayName,
      description: feature.description,
      isVisible: feature.isVisible,
    }));

    fetch(apiPage + "/api/save_features.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${yourJWTToken}`,
      },
      body: JSON.stringify({ features: updatedFeatures }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Features settings have been saved!");
        } else {
          alert(`Error: ${data.message}`);
        }
      })
      .catch((error) => {
        console.error("Error saving features:", error);
        alert("Failed to save features settings.");
      });
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
