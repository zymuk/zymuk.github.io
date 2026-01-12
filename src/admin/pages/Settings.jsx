import React, { useState, useEffect } from "react";
import "./AdminCommon.css";
import "./Settings.css";

const Settings = () => {
  const [t, setT] = useState({});
  const [data, setData] = useState(null);
  const lang = localStorage.getItem("lang") || "en";

  useEffect(() => {
    fetch(`/${lang}.json`)
      .then((res) => res.json())
      .then((data) => setT(data))
      .catch((error) => console.error("Error loading translations:", error));
  }, [lang]);

  useEffect(() => {
    // Load data from localStorage first, fallback to data.json
    const cachedData = localStorage.getItem("site_data");
    if (cachedData) {
      console.log("Loading data from localStorage");
      setData(JSON.parse(cachedData));
    } else {
      console.log("Loading data from data.json");
      fetch("/data.json")
        .then((res) => res.json())
        .then((jsonData) => {
          setData(jsonData);
          localStorage.setItem("site_data", JSON.stringify(jsonData));
        })
        .catch((error) => console.error("Error loading data:", error));
    }
  }, []);

  const exportData = () => {
    console.log("Export button clicked");
    if (!data) {
      alert("No data to export!");
      return;
    }

    console.log("Exporting data:", data);

    // Create JSON blob
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement("a");
    link.href = url;
    link.download = `data_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("Download triggered");
  };

  return (
    <div className="admin-page">
      <h2>{t.settings_title || "Settings"}</h2>
      <p>{t.settings_description || "Admin system configuration."}</p>

      <div className="admin-section">
        <h3>{t.export_data || "Export Data"}</h3>
        <p>{t.export_description || "Export current data as JSON file"}</p>
        <button
          onClick={exportData}
          className="admin-btn admin-btn-primary admin-export-btn"
        >
          {t.export_data || "Export data.json"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
