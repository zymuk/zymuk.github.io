import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [t, setT] = useState({});
  const lang = localStorage.getItem("lang") || "en";

  useEffect(() => {
    fetch(`/${lang}.json`)
      .then((res) => res.json())
      .then((data) => setT(data))
      .catch((error) => console.error("Error loading translations:", error));
  }, [lang]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <h2>{t.admin_dashboard || "Admin Dashboard"}</h2>
    </div>
  );
};

export default Dashboard;
