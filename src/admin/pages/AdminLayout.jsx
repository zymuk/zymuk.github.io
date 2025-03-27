import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import "./AdminLayout.css";

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <AdminHeader />

      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <main className={`main-content ${isSidebarOpen ? "" : "collapsed"}`}>
        <Outlet /> {/* Đây là phần hiển thị nội dung từng trang con */}
      </main>
    </div>
  );
};

export default AdminLayout;
