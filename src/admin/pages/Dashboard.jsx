import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [t, setT] = useState({});
  const [data, setData] = useState(null);
  const lang = localStorage.getItem("lang") || "en";

  useEffect(() => {
    fetch(`/${lang}.json`)
      .then((res) => res.json())
      .then((data) => setT(data))
      .catch((error) => console.error("Error loading translations:", error));
  }, [lang]);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Error loading data:", error));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("login", { replace: true });
    }
  }, [navigate]);

  const quickActions = [
    {
      title: t.users_management || "Users Management",
      description:
        t.users_description || "Manage user accounts and permissions",
      path: "/admin/users",
      icon: "👥",
    },
    {
      title: t.projects_settings || "Projects Settings",
      description: t.projects_description || "Manage portfolio projects",
      path: "/admin/projects",
      icon: "📁",
    },
    {
      title: t.experience_settings || "Experience Settings",
      description: t.experience_description || "Manage work experience entries",
      path: "/admin/experience",
      icon: "💼",
    },
    {
      title: t.features_settings || "Features Settings",
      description: t.features_description || "Manage site features and tools",
      path: "/admin/features",
      icon: "⚙️",
    },
    {
      title: t.homepage_settings || "Homepage Settings",
      description: t.homepage_description || "Customize homepage content",
      path: "/admin/homepage",
      icon: "🏠",
    },
    {
      title: t.settings || "Settings",
      description: "General site settings",
      path: "/admin/settings",
      icon: "🔧",
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>{t.admin_dashboard || "Admin Dashboard"}</h2>
        <p className="dashboard-subtitle">
          {t.dashboard_welcome ||
            "Welcome back! Here's an overview of your site."}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{data?.projects?.length || 0}</h3>
            <p>{t.projects || "Projects"}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛠️</div>
          <div className="stat-content">
            <h3>{data?.features?.length || 0}</h3>
            <p>{t.features || "Features"}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>{data?.experience?.length || 0}</h3>
            <p>{t.experience || "Experience"}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌐</div>
          <div className="stat-content">
            <h3>{data?.features?.filter((f) => f.isVisible)?.length || 0}</h3>
            <p>{t.active_features || "Active Features"}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h3>{t.quick_actions || "Quick Actions"}</h3>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="action-card"
              onClick={() => navigate(action.path)}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <h4>{action.title}</h4>
                <p>{action.description}</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <h3>{t.recent_activity || "Recent Activity"}</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">🔄</div>
            <div className="activity-content">
              <p>{t.site_data_loaded || "Site data loaded successfully"}</p>
              <span className="activity-time">{t.just_now || "Just now"}</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">👤</div>
            <div className="activity-content">
              <p>{t.admin_login_success || "Admin login successful"}</p>
              <span className="activity-time">{t.today || "Today"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
