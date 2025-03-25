import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import NotFound from "./pages/notFound/NotFound";
import "./App.css";

const App = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        path=""
        element={isAuthenticated ? <Dashboard /> : <Navigate to="login" />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
