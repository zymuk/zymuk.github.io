import React from "react";
import "./Tools.css";

const Tools = () => {
  const listTool = [
    { href: ".", name: "Please wait 1..." },
    { href: ".", name: "Please wait 2..." },
    { href: ".", name: "Please wait 3..." },
    { href: ".", name: "Please wait 4..." },
    { href: ".", name: "Please wait 5..." },
  ];

  return (
    <section id="tools" className="section tools-section">
      <h2 className="section-title">Tools</h2>
      <div className="tools-buttons">
        {listTool.map((element) => {
          return (
            <a
              key={element.name}
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
