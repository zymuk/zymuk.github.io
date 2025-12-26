import React, { useState, useEffect } from "react";
import Hero from "./hero/Hero";
import About from "./about/About";
import Experience from "./experience/Experience";
import Projects from "./projects/Projects";
import Features from "./features/Features";
import Contact from "./contact/Contact";
import "./Home.css";

const Home = () => {
  const [settings, setSettings] = useState({});
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        let loadedSettings = {};
        const savedSettings = localStorage.getItem("homepageSettings");
        if (savedSettings) {
          loadedSettings = JSON.parse(savedSettings);
        } else {
          const settingsResponse = await fetch("/config.json");
          const configData = await settingsResponse.json();
          loadedSettings = configData;
        }
        setSettings(loadedSettings);

        let projectsData = [];
        let featuresData = [];
        let experienceData = [];

        const savedProjects = localStorage.getItem("projects");
        const savedFeatures = localStorage.getItem("features");
        const savedExperience = localStorage.getItem("experience");

        if (savedProjects && savedFeatures && savedExperience) {
          projectsData = JSON.parse(savedProjects);
          featuresData = JSON.parse(savedFeatures);
          experienceData = JSON.parse(savedExperience);
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
        }

        setData({
          projects: projectsData,
          features: featuresData,
          experience: experienceData,
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
      <Hero settings={settings.homepage?.hero || settings.hero || {}} />
      <About settings={settings.homepage?.about || settings.about || {}} />
      <Experience
        settings={settings.homepage?.experience || settings.experience || {}}
        data={data.experience || []}
      />
      <Projects
        settings={settings.homepage?.projects || settings.projects || {}}
        data={data.projects || []}
      />
      <Features
        settings={settings.homepage?.tools || settings.tools || {}}
        data={data.features || []}
      />
      <Contact
        settings={settings.homepage?.contact || settings.contact || {}}
      />
    </div>
  );
};

export default Home;
