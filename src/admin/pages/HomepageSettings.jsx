import React, { useState, useEffect } from "react";
import "./HomepageSettings.css";

const HomepageSettings = () => {
  const [t, setT] = useState({});
  const lang = localStorage.getItem("lang") || "en";
  const [settings, setSettings] = useState({
    hero: { title: "", content: "", color: "#000000", image: "" },
    about: { text: "", description: "", color: "#000000", image: "" },
    experience: { title: "", description: "", color: "#000000" },
    projects: { color: "#000000", image: "" },
    tools: { color: "#000000", image: "" },
  });

  useEffect(() => {
    fetch(`/${lang}.json`)
      .then((res) => res.json())
      .then((data) => setT(data))
      .catch((error) => console.error("Error loading translations:", error));
  }, [lang]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = localStorage.getItem("homepageSettings");
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
          return;
        }

        const response = await fetch("/config.json");
        const config = await response.json();
        setSettings({
          hero: {
            title: config.homepage?.hero?.title || "",
            content: config.homepage?.hero?.content || "",
            color: config.homepage?.hero?.color || "#000000",
            image: config.homepage?.hero?.image || "",
          },
          about: {
            text: config.homepage?.about?.text || "",
            description: config.homepage?.about?.description || "",
            color: config.homepage?.about?.color || "#000000",
            image: config.homepage?.about?.image || "",
          },
          experience: {
            title: config.homepage?.experience?.title || "",
            description: config.homepage?.experience?.description || "",
            color: config.homepage?.experience?.color || "#000000",
          },
          projects: {
            color: config.homepage?.projects?.color || "#000000",
            image: config.homepage?.projects?.image || "",
          },
          tools: {
            color: config.homepage?.tools?.color || "#000000",
            image: config.homepage?.tools?.image || "",
          },
        });
      } catch (error) {
        console.error("Error loading homepage settings:", error);
      }
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
      const response = await fetch("/config.json");
      const config = await response.json();

      const resetSettings = {
        hero: {
          title: config.homepage?.hero?.title || "",
          content: config.homepage?.hero?.content || "",
          color: config.homepage?.hero?.color || "#000000",
          image: config.homepage?.hero?.image || "",
        },
        about: {
          text: config.homepage?.about?.text || "",
          description: config.homepage?.about?.description || "",
          color: config.homepage?.about?.color || "#000000",
          image: config.homepage?.about?.image || "",
        },
        experience: {
          title: config.homepage?.experience?.title || "",
          description: config.homepage?.experience?.description || "",
          color: config.homepage?.experience?.color || "#000000",
        },
        projects: {
          color: config.homepage?.projects?.color || "#000000",
          image: config.homepage?.projects?.image || "",
        },
        tools: {
          color: config.homepage?.tools?.color || "#000000",
          image: config.homepage?.tools?.image || "",
        },
      };

      setSettings(resetSettings);
      localStorage.removeItem("homepageSettings");
      alert("Reset to default settings! ✅");
    } catch (error) {
      console.error("Error resetting to default:", error);
    }
  };

  return (
    <div className="homepage-settings">
      <h2>{t.homepage_settings || "Homepage Settings"}</h2>

      <div className="section">
        <h3>{t.hero_section || "Hero Section"}</h3>

        <div className="setting-group">
          <label>{t.title || "Title"}:</label>
          <input
            type="text"
            value={settings.hero.title}
            onChange={(e) => handleChange("hero", "title", e.target.value)}
          />
        </div>

        <div className="setting-group">
          <label>{t.content || "Content"}:</label>
          <textarea
            value={settings.hero.content}
            onChange={(e) => handleChange("hero", "content", e.target.value)}
          />
        </div>

        <div className="setting-group">
          <label>{t.background_color || "Background Color"}:</label>
          <input
            type="color"
            value={settings.hero.color}
            onChange={(e) => handleChange("hero", "color", e.target.value)}
          />
        </div>

        <div className="setting-group">
          <label>{t.background_image_url || "Background Image URL"}:</label>
          <input
            type="text"
            value={settings.hero.image}
            onChange={(e) => handleChange("hero", "image", e.target.value)}
          />
        </div>
      </div>

      <div className="section">
        <h3>{t.about_section || "About Section"}</h3>
        <div className="setting-group">
          <label>{t.text || "Text"}:</label>
          <input
            type="text"
            value={settings.about.text}
            onChange={(e) => handleChange("about", "text", e.target.value)}
          />
        </div>

        <div className="setting-group">
          <label>{t.typing_text || "Typing Text"}:</label>
          <input
            type="text"
            value={settings.about.description}
            onChange={(e) =>
              handleChange("about", "description", e.target.value)
            }
          />
        </div>

        <div className="setting-group">
          <label>{t.background_color || "Background Color"}:</label>
          <input
            type="color"
            value={settings.about.color}
            onChange={(e) => handleChange("about", "color", e.target.value)}
          />
        </div>

        <div className="setting-group">
          <label>{t.background_image_url || "Background Image URL"}:</label>
          <input
            type="text"
            value={settings.about.image}
            onChange={(e) => handleChange("about", "image", e.target.value)}
          />
        </div>
      </div>

      <div className="section">
        <h3>Experience Section</h3>
        <div className="setting-group">
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

        <div className="setting-group">
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

        <div className="setting-group">
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

      <div className="section">
        <h3>{t.projects_section || "Projects Section"}</h3>
        <div className="setting-group">
          <label>{t.background_color || "Background Color"}:</label>
          <input
            type="color"
            value={settings.projects.color}
            onChange={(e) => handleChange("projects", "color", e.target.value)}
          />
        </div>

        <div className="setting-group">
          <label>{t.background_image_url || "Background Image URL"}:</label>
          <input
            type="text"
            value={settings.projects.image}
            onChange={(e) => handleChange("projects", "image", e.target.value)}
          />
        </div>
      </div>

      <div className="section">
        <h3>{t.tools_section || "Tools Section"}</h3>
        <div className="setting-group">
          <label>{t.background_color || "Background Color"}:</label>
          <input
            type="color"
            value={settings.tools.color}
            onChange={(e) => handleChange("tools", "color", e.target.value)}
          />
        </div>

        <div className="setting-group">
          <label>{t.background_image_url || "Background Image URL"}:</label>
          <input
            type="text"
            value={settings.tools.image}
            onChange={(e) => handleChange("tools", "image", e.target.value)}
          />
        </div>
      </div>

      <div className="button-group">
        <button className="save-btn" onClick={handleSave}>
          <i className="fas fa-save"></i> {t.save || "Save"}
        </button>

        <button className="reset-btn" onClick={handleReset}>
          <i className="fas fa-undo"></i> Reset to Default
        </button>
      </div>
    </div>
  );
};

export default HomepageSettings;
