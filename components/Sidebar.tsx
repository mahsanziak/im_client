import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import sidebarStyles from '../styles/Sidebar.module.css';
import { supabase } from '../utils/supabaseClient';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      const restaurantId = 1; // You can modify this to be dynamic if necessary

      const { data, error } = await supabase
        .from('restaurants')
        .select('name, location')
        .eq('id', restaurantId)
        .single();

      if (error) {
        console.error('Error fetching restaurant data:', error.message);
      } else {
        setRestaurantName(data?.name || 'Unknown Restaurant');
        setLocation(data?.location || 'Unknown Location');
      }
    };

    fetchRestaurantData();
  }, []);

  return (
    <div>
      <div className={`${sidebarStyles.sidebar} ${isOpen ? sidebarStyles.sidebarOpen : sidebarStyles.sidebarClosed}`}>
        <div className={sidebarStyles.header}>
          {isOpen ? (
            <>
              <div className={sidebarStyles.franchiseeName}>{restaurantName}</div>
              <div className={sidebarStyles.location}>{location}</div>
            </>
          ) : (
            <i className="fas fa-utensils text-2xl"></i>
          )}
        </div>
        <ul className={sidebarStyles.menu}>
          <li>
            <Link href="/restaurants/${restaurantId}/overview" className={sidebarStyles.menuItem}>
              <i className="fas fa-home"></i>
              {isOpen && <span className={sidebarStyles.menuText}>Overview</span>}
            </Link>
          </li>
          <li>
            <Link href="/restaurants/${restaurantId}/request-order" className={sidebarStyles.menuItem}>
              <i className="fas fa-shopping-cart"></i>
              {isOpen && <span className={sidebarStyles.menuText}>Request Order</span>}
            </Link>
          </li>
          <li>
            <Link href="/restaurants/${restaurantId}/orders" className={sidebarStyles.menuItem}>
              <i className="fas fa-list"></i>
              {isOpen && <span className={sidebarStyles.menuText}>Orders</span>}
            </Link>
          </li>
          <li>
            <Link href="/restaurants/${restaurantId}/billing" className={sidebarStyles.menuItem}>
              <i className="fas fa-file-invoice-dollar"></i>
              {isOpen && <span className={sidebarStyles.menuText}>Billing</span>}
            </Link>
          </li>
          <li>
            <Link href="/restaurants/${restaurantId}/recommendations" className={sidebarStyles.menuItem}>
              <i className="fas fa-lightbulb"></i>
              {isOpen && <span className={sidebarStyles.menuText}>Recommendations</span>}
            </Link>
          </li>
          <li>
            <Link href="/restaurants/${restaurantId}/settings" className={sidebarStyles.menuItem}>
              <i className="fas fa-cog"></i>
              {isOpen && <span className={sidebarStyles.menuText}>Settings</span>}
            </Link>
          </li>
        </ul>
      </div>

      <div className={sidebarStyles.toggleButton} onClick={toggleSidebar}>
        <button className={sidebarStyles.button}>
          <i className={`fas ${isOpen ? 'fa-angle-double-left' : 'fa-angle-double-right'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
