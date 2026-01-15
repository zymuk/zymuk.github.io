import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminLayout from "./pages/AdminLayout";
import Dashboard from "./pages/Dashboard";
import HomepageSettings from "./pages/HomepageSettings";
import ProjectsSettings from "./pages/ProjectsSettings";
import FeaturesSettings from "./pages/FeaturesSettings";
import ExperienceSettings from "./pages/ExperienceSettings";
import CertificationSettings from "./pages/CertificationSettings";
import EditProfile from "./pages/EditProfile";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const Admin = () => {
  const [auth, setAuth] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [t, setT] = useState({});
  const lang = localStorage.getItem("lang") || "en";

  useEffect(() => {
    fetch(`/${lang}.json`)
      .then((res) => res.json())
      .then((data) => setT(data));
  }, [lang]);

  useEffect(() => {
    // Static site: just check if token exists in localStorage
    const token = localStorage.getItem("admin_token");
    console.log("Admin useEffect, token:", token);
    if (token) {
      setAuth(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setDisplayName(user.email || "Admin");
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>{t.loading || "Loading..."}</div>;
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
        <Route path="experience" element={<ExperienceSettings />} />
        <Route path="certifications" element={<CertificationSettings />} />
        <Route path="profile" element={<EditProfile />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Admin;
