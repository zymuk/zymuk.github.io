import { Routes, Route } from "react-router-dom";
import "./index.css";

import Home from "./pages/home/Home";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Tools from "./pages/tools/Tools";

function FrontEndIndex() {
  return (
    <div className="container">
      <Header />
      <div className="frontend-content">
        <Routes>
          <Route exact path="/*" element={<Home />} />
          <Route exact path="tools" element={<Tools />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default FrontEndIndex;
