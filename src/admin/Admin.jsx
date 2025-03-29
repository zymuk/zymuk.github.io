import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminLayout from "./pages/AdminLayout";
import Dashboard from "./pages/Dashboard";
import HomepageSettings from "./pages/HomepageSettings";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import "./Admin.css";

const Admin = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        path="/"
        element={isAuthenticated ? <AdminLayout /> : <Navigate to="login" />}
      >
        <Route index element={<Dashboard />} />
        <Route path="homepage" element={<HomepageSettings />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Admin;
