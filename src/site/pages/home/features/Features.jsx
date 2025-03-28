import React from "react";
import "./Features.css";

const Features = () => {
  const listFeatures = [
    { href: ".", name: "Please wait 1..." },
    { href: ".", name: "Please wait 2..." },
    { href: ".", name: "Please wait 3..." },
    { href: ".", name: "Please wait 4..." },
    { href: ".", name: "Please wait 5..." },
  ];

  return (
    <section id="features" className="section features-section">
      <h2 className="section-title">Features</h2>
      <div className="features-buttons">
        {listFeatures.map((element) => {
          return (
            <a
              key={element.name}
              href={element.href}
              target="_blank"
              rel="noopener noreferrer"
              className="features-button"
            >
              {element.name}
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default Features;
