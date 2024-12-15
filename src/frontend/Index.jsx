import { Routes, Route, useLocation } from "react-router-dom";
import "./index.css";

import Home from "./pages/home/Home";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Tools from "./pages/tools/Tools";
import HomeHeader from "./components/header/HomeHeader";
import { useEffect, useState } from "react";

function FrontEndIndex() {
  const [isHomePage, setIsHomePage] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const regexHomePage = new RegExp(
      "([hpts]{4,}[:/]{0,}[a-zA-Z0-9.:]{1,}[/]{0,}([#]{1,}[a-zA-Z0-9]{0,}){0,}[/]{0,}){1,}$"
    );
    const checkHonePage = regexHomePage.test(window.location.href);
    setIsHomePage(checkHonePage);
  }, [location]);

  return (
    <div className="container">
      {(isHomePage && <HomeHeader />) || <Header />}
      <Routes>
        <Route exact path="/*" element={<Home />} />
        <Route exact path="tools" element={<Tools />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default FrontEndIndex;
