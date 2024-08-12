// components/Layout.tsx
import React, { useState } from 'react';
import Sidebar from './Sidebar'; // Make sure you have a Sidebar component
import layoutStyles from '../styles/layout.module.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar minimized by default

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar state
  };

  return (
    <div className={layoutStyles.layoutContainer}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={`${layoutStyles.mainContent} ${isSidebarOpen ? layoutStyles.contentShift : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
