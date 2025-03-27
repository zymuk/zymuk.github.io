import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import Site from "./site/Site";
import Admin from "./admin/Admin";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/*" element={<Site />} /> {/* Trang người dùng */}
        <Route path="/admin/*" element={<Admin />} /> {/* Trang admin */}
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
