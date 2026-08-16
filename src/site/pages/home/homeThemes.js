// Alternate looks visitors can preview on the homepage.
//
// kind: "palette" themes only swap each section's background color
// (settings.color) and keep the existing glass-morphism look untouched.
// "default" is a palette theme with colors: null, meaning: don't override
// anything, keep whatever settings.color (admin/data.json) already provides.
//
// kind: "skin" themes are a full visual re-skin (background, text, fonts,
// card chrome, accent color). For these, colors is unused — Home.jsx drops
// settings.color entirely so the CSS driven by the [data-home-skin] selector
// (see Site.css / Header.css / Footer.css and each section's CSS file) takes
// over the section backgrounds and typography instead.
export const HOME_THEMES = [
  {
    id: "default",
    name: "Default",
    kind: "palette",
    swatch: "#00bbf2",
    colors: null,
  },
  {
    id: "midnight",
    name: "Midnight",
    kind: "palette",
    swatch: "#b055dd",
    colors: {
      hero: "#1a0a2e",
      about: "#2c1250",
      experience: "#3d1a6e",
      education: "#4a2080",
      certifications: "#572694",
      skills: "#6b2ca8",
      projects: "#7f34bc",
      tools: "#9542cf",
      contact: "#b055dd",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    kind: "palette",
    swatch: "#d06c28",
    colors: {
      hero: "#2b0f0a",
      about: "#3f150e",
      experience: "#551a11",
      education: "#6b2014",
      certifications: "#7a2814",
      skills: "#8f3418",
      projects: "#a5451c",
      tools: "#bd5820",
      contact: "#d06c28",
    },
  },
  {
    id: "harvard",
    name: "Harvard Clean",
    kind: "skin",
    swatch: "#a51c30",
    colors: null,
  },
];

export const DEFAULT_THEME_ID = "default";
