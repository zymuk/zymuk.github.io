import React, { useEffect, useState } from "react";
import "./About.css";

const About = ({ settings }) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [typingText, setTypingText] = useState("");

  useEffect(() => {
    setTypingText(settings.description || "");
  }, [settings]);

  useEffect(() => {
    setDisplayText("");
    setIndex(0);
  }, [typingText]);

  useEffect(() => {
    if (index < typingText.length) {
      setTimeout(() => {
        setDisplayText(displayText + typingText.charAt(index));
        setIndex(index + 1);
      }, 100);
    }
  }, [index, displayText, typingText]);

  const sectionStyle = {
    backgroundColor: settings.color,
    backgroundImage: settings.image ? `url(${settings.image})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <section id="about" className="section about-section" style={sectionStyle}>
      <h2 className="section-title">{settings.text}</h2>
      <p className="typing-text">{displayText}</p>
    </section>
  );
};

export default About;
