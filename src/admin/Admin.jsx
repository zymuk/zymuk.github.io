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

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login");
    } else {
      try {
        const apiPage = packageJson.apipage !== undefined && packageJson.apipage.length > 0 ? packageJson.apipage : "http://localhost/zymuk_page_api/";
        fetch(apiPage + "/api/verify_token.php", {
          headers: { Authorization: `token ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.error) {
              alert("Session expired. Please log in again. Error: " + data.error);
              localStorage.removeItem("admin_token");
            }
            else {
              const decodedToken = JSON.parse(atob(token.split(".")[1]));
              const expirationTime = decodedToken.exp * 1000;
              const currentTime = Date.now();
              setDisplayName(decodedToken.displayName);
              if (expirationTime < currentTime) {
                alert("Session expired. Please log in again.");
                localStorage.removeItem("admin_token");
                navigate("/admin/login");
              } else {
                setAuth(true);
              }
            }
          });
      } catch (error) {
        console.error("Error parsing token:", error);
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
      }
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        path="/"
        element={auth ? <AdminLayout displayName={displayName} /> : <Navigate to="login" />}
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
