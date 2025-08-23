import React, { useState, useEffect } from "react";
import "./HomepageSettings.css";

const HomepageSettings = () => {
  const [settings, setSettings] = useState({
    hero: { title: "", content: "", color: "#ffffff", image: "" },
    about: { text: "", description: "", color: "#ffffff", image: "" },
    projects: { color: "#ffffff", image: "" },
    tools: { color: "#ffffff", image: "" },
  });

  // Load dữ liệu từ localStorage khi component mount
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("homepageSettings"));
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  // Hàm cập nhật state khi nhập dữ liệu
  const handleChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  // Hàm lưu vào localStorage
  const handleSave = () => {
    localStorage.setItem("homepageSettings", JSON.stringify(settings));
    alert("This setting saved! ✅");
  };

  return (
    <div className="homepage-settings">
      <h2>Homepage Settings</h2>

      {/* Hero Section */}
      <div className="section">
        <h3>Hero Section</h3>

        <div className="setting-group">
          <label>Title:</label>
          <input
            type="text"
            value={settings.hero.title}
            onChange={(e) => handleChange("hero", "title", e.target.value)}
          />
        </div>

        <div className="setting-group">
          <label>Content:</label>
          <textarea
            value={settings.hero.content}
            onChange={(e) => handleChange("hero", "content", e.target.value)}
          />
        </div>

        <div className="setting-group">
          <label>Background Color:</label>
          <input
            type="color"
            value={settings.hero.color}
            onChange={(e) => handleChange("hero", "color", e.target.value)}
          />
        </div>

        <div className="setting-group">
          <label>Background Image URL:</label>
          <input
            type="text"
            value={settings.hero.image}
            onChange={(e) => handleChange("hero", "image", e.target.value)}
          />
        </div>
      </div>

      {/* About Section */}
      <div className="section">
        <h3>About Section</h3>
        <div className="setting-group">
          <label>Text:</label>
          <input
            type="text"
            value={settings.about.text}
            onChange={(e) => handleChange("about", "text", e.target.value)}
          />
        </div>

        <div className="setting-group">
          <label>Description:</label>
          <textarea
            value={settings.about.description}
            onChange={(e) =>
              handleChange("about", "description", e.target.value)
            }
          />
        </div>

        <div className="setting-group">
          <label>Background Color:</label>
          <input
            type="color"
            value={settings.about.color}
            onChange={(e) => handleChange("about", "color", e.target.value)}
          />
        </div>

        <div className="setting-group">
          <label>Background Image URL:</label>
          <input
            type="text"
            value={settings.about.image}
            onChange={(e) => handleChange("about", "image", e.target.value)}
          />
        </div>
      </div>

      {/* Projects Section */}
      <div className="section">
        <h3>Projects Section</h3>
        <div className="setting-group">
          <label>Background Color:</label>
          <input
            type="color"
            value={settings.projects.color}
            onChange={(e) => handleChange("projects", "color", e.target.value)}
          />
        </div>

        <div className="setting-group">
          <label>Background Image URL:</label>
          <input
            type="text"
            value={settings.projects.image}
            onChange={(e) => handleChange("projects", "image", e.target.value)}
          />
        </div>
      </div>

      {/* Tools Section */}
      <div className="section">
        <h3>Tools Section</h3>
        <div className="setting-group">
          <label>Background Color:</label>
          <input
            type="color"
            value={settings.tools.color}
            onChange={(e) => handleChange("tools", "color", e.target.value)}
          />
        </div>

        <div className="setting-group">
          <label>Background Image URL:</label>
          <input
            type="text"
            value={settings.tools.image}
            onChange={(e) => handleChange("tools", "image", e.target.value)}
          />
        </div>
      </div>

      <button className="save-btn" onClick={handleSave}>
        <i className="fas fa-save"></i> Lưu Cài Đặt
      </button>
    </div>
  );
};

export default HomepageSettings;
