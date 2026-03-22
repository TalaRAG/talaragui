import React from "react";
import Sidebar from "../Sidebar";

export default Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar/>
      <div className="app-main-section">
        <main className="admin-workspace container-fluid p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
