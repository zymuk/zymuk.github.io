import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard</h2>
    </div>
  );
};

export default Dashboard;
