import React, { useState } from 'react';
import Sidebar from './Sidebar';
import layoutStyles from '../styles/Layout.module.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
