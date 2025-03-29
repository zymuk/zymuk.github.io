import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import "./AdminLayout.css";

const AdminLayout = ({displayName}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="admin-container">
      <AdminHeader displayName={displayName} />
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={`main-content ${isSidebarOpen ? "" : "collapsed"}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
