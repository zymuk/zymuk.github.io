import React, { useState, useEffect } from "react";
import Hero from "./hero/Hero";
import About from "./about/About";
import Experience from "./experience/Experience";
import Education from "./education/Education";
import Certifications from "./certifications/Certifications";
import Skills from "./skills/Skills";
import Projects from "./projects/Projects";
import Features from "./features/Features";
import Animations from "./animations/Animations";
import Contact from "./contact/Contact";
import { useTheme } from "../../ThemeContext";
import { HOME_THEMES } from "./homeThemes";
import usePageMeta from "../../../utils/usePageMeta";
import "./Home.css";

const Home = () => {
  usePageMeta({});
  const [settings, setSettings] = useState({});
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const activeTheme = HOME_THEMES.find((t) => t.id === theme);

  const getSectionSettings = (key) => {
    const base = settings.homepage?.[key] || settings[key] || {};
    if (activeTheme?.kind === "skin") {
      // Full re-skin themes control section backgrounds via CSS
      // ([data-home-skin] rules), so drop any settings.color here.
      const { color, ...rest } = base;
      return rest;
    }
    const themeColor = activeTheme?.colors?.[key];
    return themeColor ? { ...base, color: themeColor } : base;
  };

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const dataResponse = await fetch("/data.json");
        const jsonData = await dataResponse.json();

        const parseSaved = (key) => {
          const saved = localStorage.getItem(key);
          if (!saved) return null;
          try {
            return JSON.parse(saved);
          } catch (error) {
            console.error(`Invalid ${key} data in localStorage:`, error);
            return null;
          }
        };

        const savedHomepageSettings = parseSaved("homepageSettings");
        const loadedSettings = {
          ...jsonData,
          homepage: {
            ...(jsonData.homepage || {}),
            ...(savedHomepageSettings || {}),
          },
        };
        setSettings(loadedSettings);

        const sectionKeys = [
          "projects",
          "features",
          "experience",
          "education",
          "certifications",
          "skills",
          "animations",
        ];
        const sectionData = {};
        for (const key of sectionKeys) {
          const saved = parseSaved(key);
          sectionData[key] = saved !== null ? saved : jsonData[key] || [];
        }
        setData(sectionData);
      } catch (error) {
        console.error("Error loading home data:", error);
        setSettings({});
        setData({ projects: [], features: [] });
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Hero settings={getSectionSettings("hero")} />
      <About settings={getSectionSettings("about")} />
      <Experience
        settings={getSectionSettings("experience")}
        data={data.experience || []}
      />
      <Education
        settings={getSectionSettings("education")}
        data={data.education || []}
      />
      <Certifications
        settings={getSectionSettings("certifications")}
        data={data.certifications || []}
      />
      <Skills
        settings={getSectionSettings("skills")}
        data={data.skills || []}
      />
      <Projects
        settings={getSectionSettings("projects")}
        data={data.projects || []}
      />
      <Features
        settings={getSectionSettings("tools")}
        data={data.features || []}
      />
      <Animations
        settings={getSectionSettings("animations")}
        data={data.animations || []}
      />
      <Contact settings={getSectionSettings("contact")} />
    </div>
  );
};

export default Home;
