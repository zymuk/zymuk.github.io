import React, { useState, useEffect } from "react";
import "./HomepageSettings.css";

const HomepageSettings = () => {
  const [settings, setSettings] = useState({
    title: "",
    content: "",
    sections: {
      hero: "#ffffff",
      about: "#f4f4f4",
      projects: "#eaeaea",
      contact: "#dddddd",
    },
    projects: [],
    tools: [],
  });

  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("homepageSettings"));
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSectionColorChange = (section, color) => {
    setSettings((prev) => ({
      ...prev,
      sections: { ...prev.sections, [section]: color },
    }));
  };

  const handleSave = () => {
    localStorage.setItem("homepageSettings", JSON.stringify(settings));
    alert("Đã lưu cài đặt!");
  };

  return (
    <div className="homepage-settings">
      <h2>Cài đặt Trang Chủ</h2>

      {/* Tiêu đề và nội dung */}
      <div className="settings-group">
        <label>Tiêu đề:</label>
        <input
          type="text"
          name="title"
          value={settings.title}
          onChange={handleInputChange}
        />
      </div>

      <div className="settings-group">
        <label>Nội dung:</label>
        <textarea
          name="content"
          value={settings.content}
          onChange={handleInputChange}
        />
      </div>

      {/* Màu sắc từng section */}
      <div className="settings-group">
        <h3>Màu sắc các phần</h3>
        {Object.keys(settings.sections).map((section) => (
          <div key={section} className="color-picker">
            <label>{section}:</label>
            <input
              type="color"
              value={settings.sections[section]}
              onChange={(e) =>
                handleSectionColorChange(section, e.target.value)
              }
            />
          </div>
        ))}
      </div>

      <button className="save-btn" onClick={handleSave}>
        Lưu cài đặt
      </button>
    </div>
  );
};

export default HomepageSettings;
