import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminLayout from "./pages/AdminLayout";
import Dashboard from "./pages/Dashboard";
import HomepageSettings from "./pages/HomepageSettings";
import ProjectsSettings from "./pages/ProjectsSettings";
import FeaturesSettings from "./pages/FeaturesSettings";
import EditProfile from "./pages/EditProfile";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import packageJson from "../../package.json";
import "./Admin.css";

const Admin = () => {
  const [auth, setAuth] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Static site: just check if token exists in localStorage
    const token = localStorage.getItem("admin_token");
    if (token) {
      setAuth(true);
      setDisplayName("Admin");
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        path="/"
        element={
          auth ? (
            <AdminLayout displayName={displayName} />
          ) : (
            <Navigate to="login" replace />
          )
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="homepage" element={<HomepageSettings />} />
        <Route path="projects" element={<ProjectsSettings />} />
        <Route path="features" element={<FeaturesSettings />} />
        <Route path="profile" element={<EditProfile />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Admin;
