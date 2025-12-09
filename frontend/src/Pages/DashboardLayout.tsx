// src/Layout/DashboardLayout.tsx
"use client";
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";

const DashboardLayout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col md:flex-row bg-black text-white w-full overflow-hidden m-0">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen md:ml-24">
        <Navbar isSidebarExpanded={false} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
