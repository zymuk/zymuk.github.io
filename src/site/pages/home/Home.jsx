import React from "react";
import About from "./about/About";
import Projects from "./projects/Projects";
import Tools from "./tools/Tools";
import Contact from "./contact/Contact";
import "./Home.css";

const Home = () => {
  return (
    <div>
      <About />
      <Projects />
      <Tools />
      <Contact />
    </div>
  );
};

export default Home;
