import { Routes, Route } from "react-router-dom";
import "./index.css";

import Home from "./pages/home/Home";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";

function FrontEndIndex() {
  return (
    <div className="container">
      <Header />
      <Routes>
        <Route exact path="/*" element={<Home />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default FrontEndIndex;
