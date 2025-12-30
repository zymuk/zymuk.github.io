import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Home from "./pages/home/Home";
import Features from "./pages/home/features/Features";
import NotFound from "./pages/notFound/NotFound";
import Footer from "./components/footer/Footer";
import Calculator from "./pages/calculator/Calculator";
import Notes from "./pages/notes/Notes";
import "./Site.css";
import NumerologyName from "./pages/numerologyName/NumerologyName";
import TextEncoderDecoder from "./pages/textEncoderDecoder/TextEncoderDecoder";

const Site = () => {
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector(".header");
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      }

      // Xử lý active section khi cuộn
      let sections = document.querySelectorAll("section");
      let navLinks = document.querySelectorAll(".nav ul li a");

      sections.forEach((section) => {
        let top = window.scrollY;
        let offset = section.offsetTop - 100;
        let height = section.offsetHeight;
        let id = section.getAttribute("id");

        if (top >= offset && top < offset + height) {
          navLinks.forEach((link) => link.classList.remove("active"));
          const activeLink = document.querySelector(
            `.nav ul li a[data-scroll="${id}"]`
          );
          if (activeLink) {
            activeLink.classList.add("active");
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🟢 Hàm xử lý cuộn khi click vào menu
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="container">
      <Header scrollToSection={scrollToSection} />
      <div className="siteContent">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/numerology-name" element={<NumerologyName />} />
          <Route
            path="/text_encoder_decoder"
            element={<TextEncoderDecoder />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default Site;
