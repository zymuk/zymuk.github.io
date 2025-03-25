import React, { useEffect, useState } from "react";
import "./About.css";

const About = () => {
  const text = "I am a programer/coder/developer.";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      setTimeout(() => {
        setDisplayText(displayText + text.charAt(index));
        setIndex(index + 1);
      }, 100);
    }
  }, [index, displayText]);

  return (
    <section id="about" className="section about-section">
      <h2 className="section-title">TRẦN THẾ NGỌC</h2>
      <p className="typing-text">{displayText}</p>
    </section>
  );
};

export default About;
