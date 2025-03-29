import React from "react";
import About from "./about/About";
import Projects from "./projects/Projects";
import Features from "./features/Features";
import Contact from "./contact/Contact";
import "./Home.css";

const Home = () => {
  return (
    <div>
      <About />
      <Projects />
      <Features />
      <Contact />
    </div>
  );
};

export default Home;
