import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./index.css";

const Site = lazy(() => import("./site/Site"));
const Admin = lazy(() => import("./admin/Admin"));

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HashRouter>
      <Suspense fallback={<div className="app-loading">Loading...</div>}>
        <Routes>
          <Route path="/*" element={<Site />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </Suspense>
    </HashRouter>
  </React.StrictMode>
);
