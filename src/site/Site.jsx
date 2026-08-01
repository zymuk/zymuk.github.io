import React, { useEffect, useState } from "react";
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
import SaveWeb from "./pages/saveWeb/SaveWeb";
import EncryptDecrypt from "./pages/encryptDecrypt/EncryptDecrypt";

const Site = () => {
  const [showUp, setShowUp] = useState(false);
  const [showDown, setShowDown] = useState(true);

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

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setShowUp(window.scrollY > 50);
      setShowDown(window.scrollY < maxScroll - 50);

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
            `.nav ul li a[data-scroll="${id}"]`,
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

  // Function to handle scroll on menu click
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToNextSection = () => {
    const sections = document.querySelectorAll("section");
    const current = window.scrollY + window.innerHeight / 2;
    for (const section of sections) {
      if (section.offsetTop > current) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const scrollToPrevSection = () => {
    const sections = document.querySelectorAll("section");
    const current = window.scrollY + window.innerHeight / 2;
    let target = null;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (current >= sections[i].offsetTop) {
        target = sections[i - 1] || null;
        break;
      }
    }
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
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
            path="/text-encoder-decoder"
            element={<TextEncoderDecoder />}
          />
          <Route path="/save-web" element={<SaveWeb />} />
          <Route path="/encrypt-decrypt" element={<EncryptDecrypt />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
      <div className="scroll-buttons">
        <button
          className={`scroll-btn scroll-btn-top ${showUp ? "" : "hidden"}`}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          ↑↑
        </button>
        <button
          className={`scroll-btn scroll-btn-prev ${showUp ? "" : "hidden"}`}
          onClick={scrollToPrevSection}
          aria-label="Scroll to previous section"
          title="Scroll to previous section"
        >
          ↑
        </button>
        <button
          className={`scroll-btn scroll-btn-next ${showDown ? "" : "hidden"}`}
          onClick={scrollToNextSection}
          aria-label="Scroll to next section"
          title="Scroll to next section"
        >
          ↓
        </button>
        <button
          className={`scroll-btn scroll-btn-bottom ${showDown ? "" : "hidden"}`}
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          title="Scroll to bottom"
        >
          ↓↓
        </button>
      </div>
    </div>
  );
};

export default Site;
