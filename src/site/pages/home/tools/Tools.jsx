import React from "react";
import "./Tools.css";

const Tools = () => {
  return (
    <section id="tools" className="section tools-section">
      <h2 className="section-title">Tools</h2>
      <div className="tools-buttons">
        <a
          href="https://code.visualstudio.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="tool-button"
        >
          VS Code
        </a>
        <a
          href="https://git-scm.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="tool-button"
        >
          Git
        </a>
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="tool-button"
        >
          GitHub
        </a>
        <a
          href="https://webpack.js.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="tool-button"
        >
          Webpack
        </a>
        <a
          href="https://www.postman.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="tool-button"
        >
          Postman
        </a>
      </div>
    </section>
  );
};

export default Tools;
