import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import Login from "./pages/Login";
import AdminLayout from "./pages/AdminLayout";
import Dashboard from "./pages/Dashboard";
import HomepageSettings from "./pages/HomepageSettings";
import ProjectsSettings from "./pages/ProjectsSettings";
import FeaturesSettings from "./pages/FeaturesSettings";
import ExperienceSettings from "./pages/ExperienceSettings";
import EducationSettings from "./pages/EducationSettings";
import CertificationSettings from "./pages/CertificationSettings";
import SkillsSettings from "./pages/SkillsSettings";
import EditProfile from "./pages/EditProfile";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const Admin = () => {
  useLocation();

  const auth = isAuthenticated();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = storedUser.email || "Admin";

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
        <Route path="education" element={<EducationSettings />} />
        <Route path="certifications" element={<CertificationSettings />} />
        <Route path="skills" element={<SkillsSettings />} />
        <Route path="profile" element={<EditProfile />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Admin;
