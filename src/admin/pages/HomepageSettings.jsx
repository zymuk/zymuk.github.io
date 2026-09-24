import React, { useState, useEffect } from "react";
import "./AdminCommon.css";
import "./HomepageSettings.css";

const SECTION_DEFAULTS = {
  hero: { title: "", content: "", color: "#000000", image: "" },
  about: { text: "", description: "", color: "#000000", image: "" },
  experience: { title: "", description: "", color: "#000000" },
  certifications: { color: "#000000", image: "" },
  skills: { color: "#000000", image: "" },
  projects: { color: "#000000", image: "" },
  tools: { color: "#000000", image: "" },
  contact: { color: "#000000", image: "" },
};

const normalizeSettings = (homepage, saved) => {
  const sections = {};
  const keys = new Set([
    ...Object.keys(SECTION_DEFAULTS),
    ...Object.keys(homepage || {}),
    ...Object.keys(saved || {}),
  ]);
  for (const key of keys) {
    sections[key] = {
      ...(SECTION_DEFAULTS[key] || {}),
      ...(homepage?.[key] || {}),
      ...(saved?.[key] || {}),
    };
  }
  return sections;
};

const HomepageSettings = () => {
  const [t, setT] = useState({});
  const lang = localStorage.getItem("lang") || "en";
  const [settings, setSettings] = useState(SECTION_DEFAULTS);

  useEffect(() => {
    fetch(`/${lang}.json`)
      .then((res) => res.json())
      .then((data) => setT(data))
      .catch((error) => console.error("Error loading translations:", error));
  }, [lang]);

  useEffect(() => {
    const loadSettings = async () => {
      let savedParsed = {};
      const savedSettings = localStorage.getItem("homepageSettings");
      if (savedSettings) {
        try {
          savedParsed = JSON.parse(savedSettings) || {};
        } catch (error) {
          console.error(
            "Invalid homepageSettings data in localStorage:",
            error
          );
          savedParsed = {};
        }
      }

      let homepage = {};
      try {
        const response = await fetch("/data.json");
        const config = await response.json();
        homepage = config.homepage || {};
      } catch (error) {
        console.error("Error loading homepage settings:", error);
      }

      setSettings(normalizeSettings(homepage, savedParsed));
    };

    loadSettings();
  }, []);

  const handleChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSave = () => {
    localStorage.setItem("homepageSettings", JSON.stringify(settings));
    alert(t.save || "Settings saved! ✅ Refresh frontend to see changes.");
  };

  const handleReset = async () => {
    try {
      const response = await fetch("/data.json");
      const config = await response.json();

      setSettings(normalizeSettings(config.homepage || {}, {}));
      localStorage.removeItem("homepageSettings");
      alert("Reset to default settings! ✅");
    } catch (error) {
      console.error("Error resetting to default:", error);
    }
  };

  return (
    <div className="admin-page">
      <h2>{t.homepage_settings || "Homepage Settings"}</h2>

      <div className="admin-section">
        <h3>{t.hero_section || "Hero Section"}</h3>

        <div className="admin-form-group-horizontal">
          <label>{t.title || "Title"}:</label>
          <input
            type="text"
            value={settings.hero.title}
            onChange={(e) => handleChange("hero", "title", e.target.value)}
          />
        </div>

        <div className="admin-form-group-horizontal">
          <label>{t.content || "Content"}:</label>
          <textarea
            value={settings.hero.content}
            onChange={(e) => handleChange("hero", "content", e.target.value)}
          />
        </div>

        <div className="admin-form-group-horizontal">
          <label>{t.background_color || "Background Color"}:</label>
          <input
            type="color"
            value={settings.hero.color}
            onChange={(e) => handleChange("hero", "color", e.target.value)}
          />
        </div>

        <div className="admin-form-group-horizontal">
          <label>{t.background_image_url || "Background Image URL"}:</label>
          <input
            type="text"
            value={settings.hero.image}
            onChange={(e) => handleChange("hero", "image", e.target.value)}
          />
        </div>
      </div>

      <div className="admin-section">
        <h3>{t.about_section || "About Section"}</h3>
        <div className="admin-form-group-horizontal">
          <label>{t.text || "Text"}:</label>
          <input
            type="text"
            value={settings.about.text}
            onChange={(e) => handleChange("about", "text", e.target.value)}
          />
        </div>

        <div className="admin-form-group-horizontal">
          <label>{t.typing_text || "Typing Text"}:</label>
          <input
            type="text"
            value={settings.about.description}
            onChange={(e) =>
              handleChange("about", "description", e.target.value)
            }
          />
        </div>

        <div className="admin-form-group-horizontal">
          <label>{t.background_color || "Background Color"}:</label>
          <input
            type="color"
            value={settings.about.color}
            onChange={(e) => handleChange("about", "color", e.target.value)}
          />
        </div>

        <div className="admin-form-group-horizontal">
          <label>{t.background_image_url || "Background Image URL"}:</label>
          <input
            type="text"
            value={settings.about.image}
            onChange={(e) => handleChange("about", "image", e.target.value)}
          />
        </div>
      </div>

      <div className="admin-section">
        <h3>Experience Section</h3>
        <div className="admin-form-group-horizontal">
          <label>{t.title || "Title"}:</label>
          <input
            type="text"
            placeholder="Experience"
            value={settings.experience.title}
            onChange={(e) =>
              handleChange("experience", "title", e.target.value)
            }
          />
        </div>

        <div className="admin-form-group-horizontal">
          <label>{t.description || "Description"}:</label>
          <input
            type="text"
            placeholder="My professional journey"
            value={settings.experience.description}
            onChange={(e) =>
              handleChange("experience", "description", e.target.value)
            }
          />
        </div>

        <div className="admin-form-group-horizontal">
          <label>{t.background_color || "Background Color"}:</label>
          <input
            type="color"
            value={settings.experience.color}
            onChange={(e) =>
              handleChange("experience", "color", e.target.value)
            }
          />
        </div>
      </div>

      <div className="admin-section">
        <h3>{t.certifications || "Certifications"} Section</h3>
        <div className="admin-form-group-horizontal">
          <label>{t.background_color || "Background Color"}:</label>
          <input
            type="color"
            value={settings.certifications.color}
            onChange={(e) =>
              handleChange("certifications", "color", e.target.value)
            }
          />
        </div>

        <div className="admin-form-group-horizontal">
          <label>{t.background_image_url || "Background Image URL"}:</label>
          <input
            type="text"
            value={settings.certifications.image}
            onChange={(e) =>
              handleChange("certifications", "image", e.target.value)
            }
          />
        </div>
      </div>

      <div className="admin-section">
        <h3>{t.skills || "Skills"} Section</h3>
        <div className="admin-form-group-horizontal">
          <label>{t.background_color || "Background Color"}:</label>
          <input
            type="color"
            value={settings.skills?.color}
            onChange={(e) => handleChange("skills", "color", e.target.value)}
          />
        </div>

        <div className="admin-form-group-horizontal">
          <label>{t.background_image_url || "Background Image URL"}:</label>
          <input
            type="text"
            value={settings.skills?.image}
            onChange={(e) => handleChange("skills", "image", e.target.value)}
          />
        </div>
      </div>

      <div className="admin-section">
        <h3>{t.projects_section || "Projects Section"}</h3>
        <div className="admin-form-group-horizontal">
          <label>{t.background_color || "Background Color"}:</label>
          <input
            type="color"
            value={settings.projects.color}
            onChange={(e) => handleChange("projects", "color", e.target.value)}
          />
        </div>

        <div className="admin-form-group-horizontal">
          <label>{t.background_image_url || "Background Image URL"}:</label>
          <input
            type="text"
            value={settings.projects.image}
            onChange={(e) => handleChange("projects", "image", e.target.value)}
          />
        </div>
      </div>

      <div className="admin-section">
        <h3>{t.tools_section || "Tools Section"}</h3>
        <div className="admin-form-group-horizontal">
          <label>{t.background_color || "Background Color"}:</label>
          <input
            type="color"
            value={settings.tools.color}
            onChange={(e) => handleChange("tools", "color", e.target.value)}
          />
        </div>

        <div className="admin-form-group-horizontal">
          <label>{t.background_image_url || "Background Image URL"}:</label>
          <input
            type="text"
            value={settings.tools.image}
            onChange={(e) => handleChange("tools", "image", e.target.value)}
          />
        </div>
      </div>

      <div className="admin-section">
        <h3>{t.contact_section || "Contact Section"}</h3>
        <div className="admin-form-group-horizontal">
          <label>{t.background_color || "Background Color"}:</label>
          <input
            type="color"
            value={settings.contact.color}
            onChange={(e) => handleChange("contact", "color", e.target.value)}
          />
        </div>

        <div className="admin-form-group-horizontal">
          <label>{t.background_image_url || "Background Image URL"}:</label>
          <input
            type="text"
            value={settings.contact.image}
            onChange={(e) => handleChange("contact", "image", e.target.value)}
          />
        </div>
      </div>

      <div className="admin-button-group">
        <button className="admin-btn admin-btn-primary" onClick={handleSave}>
          <i className="fas fa-save"></i> {t.save || "Save"}
        </button>

        <button className="admin-btn admin-btn-cancel" onClick={handleReset}>
          <i className="fas fa-undo"></i> Reset to Default
        </button>
      </div>
    </div>
  );
};

export default HomepageSettings;
