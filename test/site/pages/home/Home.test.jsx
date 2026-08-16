import React from "react";
import { render, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../../../../src/site/pages/home/Home";
import { ThemeProvider } from "../../../../src/site/ThemeContext";

const SETTINGS = {
  hero: { title: "Hero", content: "Hero content", color: "#001f2e" },
  about: { text: "About", description: "desc", color: "#003855" },
  experience: { title: "Experience", description: "desc", color: "#005577" },
  education: { color: "#006080" },
  certifications: { color: "#006994" },
  skills: { color: "#007099" },
  projects: { color: "#0077b6" },
  tools: { color: "#0099d4" },
  contact: { color: "#00bbf2" },
};

const seedLocalStorage = () => {
  localStorage.setItem("homepageSettings", JSON.stringify(SETTINGS));
  localStorage.setItem("projects", JSON.stringify([]));
  localStorage.setItem("features", JSON.stringify([]));
  localStorage.setItem("experience", JSON.stringify([]));
  localStorage.setItem("education", JSON.stringify([]));
  localStorage.setItem("certifications", JSON.stringify([]));
  localStorage.setItem("skills", JSON.stringify([]));
};

const flushAsync = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

const renderHome = async () => {
  const view = render(
    <MemoryRouter>
      <ThemeProvider>
        <Home />
      </ThemeProvider>
    </MemoryRouter>,
  );
  await flushAsync();
  return view;
};

describe("Home (theme-driven section colors)", () => {
  beforeEach(() => {
    localStorage.clear();
    seedLocalStorage();
  });

  it("uses settings.color from admin/data.json when no theme is chosen", async () => {
    await renderHome();
    expect(document.getElementById("hero").style.backgroundColor).toBe(
      "rgb(0, 31, 46)",
    );
  });

  it("overrides section colors with the chosen palette theme", async () => {
    localStorage.setItem("siteTheme", "midnight");
    await renderHome();
    expect(document.getElementById("hero").style.backgroundColor).toBe(
      "rgb(26, 10, 46)",
    );
  });

  it("drops settings.color for a full re-skin theme, letting CSS control it", async () => {
    localStorage.setItem("siteTheme", "harvard");
    await renderHome();
    expect(document.getElementById("hero").style.backgroundColor).toBe("");
  });
});
