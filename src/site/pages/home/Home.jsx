import React, { useState, useEffect } from "react";
import Hero from "./hero/Hero";
import About from "./about/About";
import Experience from "./experience/Experience";
import Education from "./education/Education";
import Certifications from "./certifications/Certifications";
import Skills from "./skills/Skills";
import Projects from "./projects/Projects";
import Features from "./features/Features";
import Contact from "./contact/Contact";
import { useTheme } from "../../ThemeContext";
import { HOME_THEMES } from "./homeThemes";
import "./Home.css";

const Home = () => {
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
        let loadedSettings = {};
        const savedSettings = localStorage.getItem("homepageSettings");
        if (savedSettings) {
          loadedSettings = JSON.parse(savedSettings);
        } else {
          const settingsResponse = await fetch("/data.json");
          const configData = await settingsResponse.json();
          loadedSettings = configData;
        }
        setSettings(loadedSettings);

        let projectsData = [];
        let featuresData = [];
        let experienceData = [];
        let educationData = [];
        let certificationsData = [];
        let skillsData = [];

        const savedProjects = localStorage.getItem("projects");
        const savedFeatures = localStorage.getItem("features");
        const savedExperience = localStorage.getItem("experience");
        const savedEducation = localStorage.getItem("education");
        const savedCertifications = localStorage.getItem("certifications");
        const savedSkills = localStorage.getItem("skills");

        if (savedProjects && savedFeatures && savedExperience) {
          projectsData = JSON.parse(savedProjects);
          featuresData = JSON.parse(savedFeatures);
          experienceData = JSON.parse(savedExperience);
          educationData = JSON.parse(savedEducation);
          certificationsData = JSON.parse(savedCertifications);
          skillsData = savedSkills ? JSON.parse(savedSkills) : [];
        } else {
          const dataResponse = await fetch("/data.json");
          const jsonData = await dataResponse.json();

          projectsData = savedProjects
            ? JSON.parse(savedProjects)
            : jsonData.projects || [];
          featuresData = savedFeatures
            ? JSON.parse(savedFeatures)
            : jsonData.features || [];
          experienceData = savedExperience
            ? JSON.parse(savedExperience)
            : jsonData.experience || [];
          educationData = savedEducation
            ? JSON.parse(savedEducation)
            : jsonData.education || [];
          certificationsData = savedCertifications
            ? JSON.parse(savedCertifications)
            : jsonData.certifications || [];
          skillsData = savedSkills
            ? JSON.parse(savedSkills)
            : jsonData.skills || [];
        }

        setData({
          projects: projectsData,
          features: featuresData,
          experience: experienceData,
          education: educationData,
          certifications: certificationsData,
          skills: skillsData,
        });
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
      <Contact settings={getSectionSettings("contact")} />
    </div>
  );
};

export default Home;
