import React from "react";
import "./Hero.css";

const Hero = ({ settings }) => {
  const heroStyle = {
    backgroundColor: settings.color,
    backgroundImage: settings.image ? `url(${settings.image})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  if (!(settings.title || settings.content)) {
    return null;
  }

  return (
    <section id="hero" className="section hero-section" style={heroStyle}>
      {settings.title && <h1 className="hero-title">{settings.title}</h1>}
      {settings.content && <p className="hero-content">{settings.content}</p>}
    </section>
  );
};

export default Hero;
