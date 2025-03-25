import React from "react";
import "./Tools.css";

const Tools = () => {
  const listTool = [
    { href: ".", name: "Please wait..." },
    { href: ".", name: "Please wait..." },
    { href: ".", name: "Please wait..." },
    { href: ".", name: "Please wait..." },
    { href: ".", name: "Please wait..." },
  ];

  return (
    <section id="tools" className="section tools-section">
      <h2 className="section-title">Tools</h2>
      <div className="tools-buttons">
        {listTool.map((element) => {
          return (
            <a
              href={element.href}
              target="_blank"
              rel="noopener noreferrer"
              className="tool-button"
            >
              {element.name}
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default Tools;
